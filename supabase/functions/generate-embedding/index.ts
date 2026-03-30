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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const openAiApiKey = Deno.env.get("OPENAI_API_KEY") || "";

    if (!openAiApiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const configuration = new Configuration({ apiKey: openAiApiKey });
    const openai = new OpenAIApi(configuration);

    const payload = await req.json();

    // Supabase Webhook Payload structure
    const { type, table, record, old_record } = payload;

    // Safety check - ignore DELETE events
    if (type === "DELETE" || !record) {
      return new Response(
        JSON.stringify({ status: "ignored", reason: "delete event" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const tenantId = record.organization_id || record.tenant_id;
    if (!tenantId) {
      return new Response(
        JSON.stringify({ status: "ignored", reason: "no tenant_id present" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let extractedText = "";
    let entityType = "";
    const entityId = record.id;

    // Normalizing text extraction dynamically based on relational node mapping
    if (table === "documents") {
      entityType = "document";
      extractedText =
        `${record.title} ${record.extracted_text || ""} ${record.summary || ""}`.trim();
    } else if (table === "global_tasks") {
      entityType = "task";
      extractedText =
        `${record.title} ${record.description || ""} ${record.status || ""}`.trim();
    } else if (table === "global_communications") {
      entityType = "communication";
      extractedText =
        `${record.subject || "No Subject"} ${record.body || ""} ${record.sentiment || ""}`.trim();
    } else if (table === "projects") {
      entityType = "project";
      extractedText =
        `${record.name} ${record.description || ""} ${record.status || ""}`.trim();
    }

    // Abort if the source schema is unrecognized by semantic trace logic or lacks substantial text payload
    if (!entityType || extractedText.length < 5) {
      return new Response(
        JSON.stringify({
          status: "ignored",
          reason: "insufficient text or unmapped format",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Call OpenAI to generate a vector topology block
    const embeddingResponse = await openai.createEmbedding({
      model: "text-embedding-3-small",
      input: extractedText,
    });

    const embedding = embeddingResponse.data.data[0].embedding;

    // Upsert the generated matrix onto the Relational Database using Service Role (bypassing RLS)
    const { error: upsertError } = await supabase
      .from("platform_embeddings")
      .upsert(
        {
          organization_id: tenantId,
          entity_type: entityType,
          entity_id: entityId,
          content: extractedText,
          embedding: embedding,
        },
        {
          onConflict: "entity_type,entity_id",
        },
      );

    if (upsertError) {
      throw upsertError;
    }

    return new Response(
      JSON.stringify({ status: "success", entityId, entityType }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error(`Edge Embedding Error: ${err.message}`);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
