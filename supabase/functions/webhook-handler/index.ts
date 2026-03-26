import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// Edge Function to securely ingress external third-party webhook events into Bridgebox.
// Handlers resolve async to prevent blocking the provider.
serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const urlParams = new URL(req.url);
  const provider = urlParams.searchParams.get('provider') || 'unknown';

  try {
    const rawPayload = await req.json();

    // Ingress the raw webhook payload into the processing queue
    // Edge function resolves immediately after insertion so the provider receives a 200 OK
    const { data, error } = await supabaseAdmin
      .from('bb_integration_webhook_events')
      .insert({
        provider_name: provider,
        event_type: rawPayload.type || 'webhook',
        payload: rawPayload,
        status: 'pending'
      })
      .select('id')
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, event_id: data.id }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );

  } catch (err: any) {
    console.error('Webhook Ingest Error:', err.message);
    return new Response(
      JSON.stringify({ error: 'Bad Request', details: err.message }),
      { headers: { "Content-Type": "application/json" }, status: 400 }
    );
  }
});
