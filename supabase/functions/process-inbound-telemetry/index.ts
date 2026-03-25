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
    const configuration = new Configuration({ apiKey: openAiKey });
    const openai = new OpenAIApi(configuration);

    const payload = await req.json();
    const { type, table, record } = payload;

    // Only process inbound Communications
    if (type !== 'INSERT' || table !== 'global_communications' || !record) {
      return new Response(JSON.stringify({ status: 'ignored', reason: 'Not an inbound communication insert' }), { headers: corsHeaders });
    }

    const tenantId = record.organization_id || record.tenant_id;
    const bodyText = `${record.subject || ''} ${record.body || ''}`;

    if (!bodyText.trim()) {
      return new Response(JSON.stringify({ status: 'ignored', reason: 'Empty payload' }), { headers: corsHeaders });
    }

    // Evaluate Urgency & Sentiment dynamically
    const prompt = `Analyze the following communication. 
Return EXACTLY a JSON object with two keys:
- urgency (a float between 0.0 and 1.0, where 1.0 is extreme emergency)
- sentiment (a float between 0.0 and 1.0, where 0.0 is furiously angry, 0.5 is neutral, 1.0 is delighted)
- summary (a 1 sentence summary of the core issue)

Communication: "${bodyText}"`;

    const chatResponse = await openai.createChatCompletion({
      model: 'gpt-4-turbo',
      messages: [{ role: 'system', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const analysis = JSON.parse(chatResponse.data.choices[0].message?.content || '{}');
    const urgency = analysis.urgency || 0;
    const sentiment = analysis.sentiment || 0.5;
    const summary = analysis.summary || 'Requires review.';

    console.log(`Mapped Telemetry for Payload ${record.id}: Urgency [${urgency}], Sentiment [${sentiment}]`);

    // Execution Threshold Logic
    if (urgency > 0.8 || sentiment <= 0.25) {
      console.log('Threshold exceeded. Generating autonomous Escalation Task.');
      
      const { error: taskError } = await supabase.from('global_tasks').insert({
        organization_id: tenantId,
        title: `AI Escalation: ${record.subject || 'Urgent Communication'}`,
        description: `Autonomous Routing Trigger. \n\nReason: High Urgency (${urgency}) or Low Sentiment (${sentiment}).\nSummary: ${summary}\n\nPlease review immediately.`,
        status: 'todo',
        priority: 'high',
        assigned_to: record.created_by || null // Fallback assignment logic
      });

      if (taskError) {
        console.error('Task Generation Error', taskError);
        throw taskError;
      }
      
      return new Response(JSON.stringify({ status: 'success', escalated: true, metrics: { urgency, sentiment } }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ status: 'success', escalated: false }), { headers: corsHeaders });

  } catch (err) {
    console.error('Telemetry Fault', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: corsHeaders });
  }
});
