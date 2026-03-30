import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const openAiKey = Deno.env.get("OPENAI_API_KEY") || "";
    if (!openAiKey) throw new Error("OPENAI_API_KEY missing");

    const payload = await req.json();
    const { audio_base64 } = payload;

    if (!audio_base64) {
      return new Response(
        JSON.stringify({ error: "Missing audio base64 payload" }),
        { status: 400, headers: corsHeaders },
      );
    }

    // Convert Base64 back to Blob/File for OpenAI Whisper
    const binaryString = atob(
      audio_base64.replace(/^data:audio\/\w+;base64,/, ""),
    );
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "audio/webm" });

    const formData = new FormData();
    formData.append("file", blob, "recording.webm");
    formData.append("model", "whisper-1");

    console.log("Transcribing audio payload length:", bytes.length);

    const whisperResponse = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAiKey}`,
        },
        body: formData,
      },
    );

    if (!whisperResponse.ok) {
      const errBody = await whisperResponse.text();
      throw new Error(`OpenAI Whisper Error: ${errBody}`);
    }

    const { text } = await whisperResponse.json();

    return new Response(JSON.stringify({ status: "success", text }), {
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("Transcription Agent Fault", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
