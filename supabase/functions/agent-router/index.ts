import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.3.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Specialized Agent Personas
const AGENT_PERSONAS = {
  finance: `You are the Bridgebox Finance Agent. You specialize in analyzing budgets, MRR, billing, payments, and financial timelines. You are highly analytical and strict.`,
  operations: `You are the Bridgebox Operations Agent. You specialize in resolving blockers, escalating overdue tasks, resource allocation, and workflow unblocking. You are highly action-oriented.`,
  general: `You are the Bridgebox Master Copilot. You are a helpful, capable assistant overseeing the general relational OS.`,
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
    const payload = await req.json();
    const { prompt, context_data } = payload;

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Step 1: The Router Agent mathematically classifies the prompt intent
    const routingResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are the Bridgebox Intent Router. Read the user prompt and respond with EXACTLY ONE word: finance, operations, or general.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.0,
    });

    const route =
      routingResponse.data.choices[0].message?.content?.trim().toLowerCase() ||
      "general";
    const selectedAgent =
      AGENT_PERSONAS[route as keyof typeof AGENT_PERSONAS] ||
      AGENT_PERSONAS.general;

    console.log(`Routed prompt to: ${route}`);

    // Step 2: Forward to the Selected Expert Agent
    const executionResponse = await openai.createChatCompletion({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            selectedAgent +
            `\n\nContext Data:\n${JSON.stringify(context_data, null, 2)}`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    const responseContent =
      executionResponse.data.choices[0].message?.content || "";

    return new Response(
      JSON.stringify({
        status: "success",
        agent: route,
        response: responseContent,
      }),
      { headers: corsHeaders },
    );
  } catch (err) {
    console.error("Agent Router Fault", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
