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

    const openai = new OpenAIApi(new Configuration({ apiKey: openAiKey }));

    // We expect a task_id and its associated context_data
    const payload = await req.json();
    const { task_id, context_data } = payload;

    if (!task_id || !context_data) {
      return new Response(
        JSON.stringify({ error: "Missing telemetry bounds" }),
        { status: 400, headers: corsHeaders },
      );
    }

    const systemPrompt = `You are the Bridgebox Autonomous Outreach Agent.
You analyze an overdue or blocked task and generate a professional, firm, yet polite email draft aimed at unblocking the workflow.
The email should be ready to send to the client or stakeholder responsible for the blocker.

OUTPUT FORMAT (STRICT JSON):
{
  "subject": "Email Subject Line",
  "recipient_role": "Who this should be sent to (e.g., Client Contact, Developer)",
  "body": "The complete email body formatted in plain text."
}`;

    const userPrompt = `Draft an unblocking email for the following blocked task:\n\n${JSON.stringify(context_data, null, 2)}`;

    const executionResponse = await openai.createChatCompletion({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      response_format: { type: "json_object" },
    });

    const draft = JSON.parse(
      executionResponse.data.choices[0].message?.content || "{}",
    );

    return new Response(JSON.stringify({ status: "success", draft }), {
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("Outreach Agent Fault", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
