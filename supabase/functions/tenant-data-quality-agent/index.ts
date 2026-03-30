import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Ensure only invoked via authorized Service Role or CRON
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${supabaseKey}`) {
      return new Response("Unauthorized Access", { status: 401 });
    }

    console.log("Initiating Multi-Tenant Data Quality Sweep...");

    // Rule 1: Flag Projects past target date without completion
    const { data: staleProjects, error: projectError } = await supabase
      .from("projects")
      .select("id, name, organization_id, target_launch_date")
      .eq("status", "in_progress")
      .lt("target_launch_date", new Date().toISOString());

    if (projectError) throw projectError;

    // Rule 2: Flag Inbound communications that are older than 48 hours without task bindings
    // (Simplification for Phase 5 demo: just checking raw communication dates across organizations)
    const { data: stagnantComms, error: commError } = await supabase
      .from("global_communications")
      .select("id, subject, organization_id")
      .eq("direction", "inbound")
      .lt(
        "created_at",
        new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      );

    if (commError) throw commError;

    const generatedTasks = [];

    // Emit Warning Tasks to Tenant Admins mapping explicitly across organization contexts
    if (staleProjects && staleProjects.length > 0) {
      for (const proj of staleProjects) {
        generatedTasks.push({
          organization_id: proj.organization_id, // Hard maps universally to Tenant ID implicitly
          title: `Data Quality Alert: Stagnant Project [${proj.name}]`,
          description: `Automated System Alert: Project target date (${proj.target_launch_date}) has securely passed without closure. Please update the target_launch_date or transition to delivered natively.`,
          priority: "high",
          status: "todo",
        });
      }
    }

    if (generatedTasks.length > 0) {
      const { error: insertError } = await supabase
        .from("global_tasks")
        .insert(generatedTasks);

      if (insertError) throw insertError;
    }

    console.log(
      `Data Quality Sweep Complete. Generated ${generatedTasks.length} Automated Tasks.`,
    );

    return new Response(
      JSON.stringify({
        status: "success",
        metrics: {
          flagged_projects: staleProjects?.length || 0,
          flagged_comms: stagnantComms?.length || 0,
          tasks_generated: generatedTasks.length,
        },
      }),
      { headers: corsHeaders },
    );
  } catch (err) {
    console.error("Data Quality Agent Fault", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
