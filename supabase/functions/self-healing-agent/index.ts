import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.3.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const openAiKey = Deno.env.get('OPENAI_API_KEY') || '';

    if (!openAiKey) throw new Error('OPENAI_API_KEY missing');

    const supabase = createClient(supabaseUrl, supabaseKey);
    const openai = new OpenAIApi(new Configuration({ apiKey: openAiKey }));

    // 1. Fetch Slow Queries Telemetry
    const { data: slowQueries, error } = await supabase.rpc('get_slowest_queries', { limit_val: 3 });

    if (error) throw new Error(`Telemetry Extraction Fault: ${error.message}`);
    
    if (!slowQueries || slowQueries.length === 0) {
        return new Response(JSON.stringify({ status: 'success', message: 'No index optimization required.' }), { headers: corsHeaders });
    }

    // 2. Pass structural telemetry to the Master Reasoner
    const systemPrompt = `You are a Senior PostgreSQL Database Administrator for a high-traffic Relational Operating System.
You will receive telemetry for a slow query. 
Analyze the WHERE/JOIN boundaries and immediately generate a \`CREATE INDEX CONCURRENTLY\` exact SQL statement that will optimize it safely natively.

OUTPUT FORMAT (STRICT JSON):
{
  "explanation": "Brief explanation of why this index helps.",
  "sql": "CREATE INDEX CONCURRENTLY idx_name ON table (column);"
}`;

    const userPrompt = `Analyze this slow query and optimize it:\n${JSON.stringify(slowQueries[0], null, 2)}`;

    const executionResponse = await openai.createChatCompletion({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const indexDraft = JSON.parse(executionResponse.data.choices[0].message?.content || '{}');

    // 3. Inject the Suggestion into the `copilot_suggestions` queue 
    // for the root Tenant Admin to approve!
    const { error: insertErr } = await supabase.from('copilot_suggestions').insert({
       tenant_id: 'SYSTEM',
       context_type: 'general',
       suggestion_text: `Database Self-Healing Event: Slow Query Detected. I recommend deploying an index to restore sub-100ms performance.`,
       suggestion_metadata: {
           type: 'database_optimization',
           telemetry: slowQueries[0],
           sql_remediation: indexDraft.sql,
           explanation: indexDraft.explanation
       }
    });

    if (insertErr) throw new Error(`Failed to queue suggestion: ${insertErr.message}`);

    return new Response(JSON.stringify({ status: 'success', indexDraft }), { headers: corsHeaders });

  } catch (err) {
    console.error('Self-Healing DB Agent Fault', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
