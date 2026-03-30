import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.3.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const openAiKey = Deno.env.get("OPENAI_API_KEY") || "";

    if (!openAiKey) throw new Error("OPENAI_API_KEY missing");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const configuration = new Configuration({ apiKey: openAiKey });
    const openai = new OpenAIApi(configuration);

    const payload = await req.json();
    const { record_id, record_type, context_data } = payload;

    if (!record_id || !record_type) {
      return new Response(
        JSON.stringify({ error: "Missing target mapping IDs" }),
        { status: 400, headers: corsHeaders },
      );
    }

    const systemPrompt = `You are the Bridgebox Relational OS Next Best Action (NBA) Engine.
Your task is predictive forecasting. You are analyzing a ${record_type} record.
You are given a snapshot of the current state, recent timeline, and active blockers.

You MUST return EXACTLY ONE actionable recommendation.
Format your output EXACTLY as this JSON object:
{
  "title": "Short verb-first action title",
  "rationale": "One sentence explaining why this is the highest leverage action to take NOW based on the telemetry provided.",
  "confidence": 0.0 to 1.0 float,
  "proposed_tool_execution": { "tool_name": "create_global_task | update_project_target_date | null", "parameters": {} }
}`;

    const userPrompt = `Analyze the following telemetry for ${record_type} ${record_id}:\n\n${JSON.stringify(context_data, null, 2)}`;

    const chatResponse = await openai.createChatCompletion({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1, // Cold temperature for highly deterministic reasoning
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(
      chatResponse.data.choices[0].message?.content || "{}",
    );

    return new Response(JSON.stringify({ status: "success", nba: analysis }), {
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("NBA Engine Fault", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
