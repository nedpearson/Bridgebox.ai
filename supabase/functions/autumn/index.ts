/**
 * BRIDGEBOX AUTUMN BILLING EDGE FUNCTION
 *
 * Acts as the secure backend proxy between the autumn-js React SDK
 * and the Autumn API. All billing operations (attach plan, open portal,
 * list plans, track usage, check entitlements) route through here.
 *
 * The React SDK (autumnClient.ts) calls:
 *   POST /functions/v1/autumn/<route>
 *
 * This function:
 * 1. Verifies the Supabase JWT from the Authorization header
 * 2. Resolves the customer ID from the authenticated user's org
 * 3. Proxies the request to Autumn using the secret key
 *
 * Required Edge Function secrets (set in Supabase Dashboard → Edge Functions → Secrets):
 *   AUTUMN_SECRET_KEY   = <your-autumn-secret-key>
 *   SUPABASE_URL        = (auto-injected)
 *   SUPABASE_SERVICE_ROLE_KEY = (auto-injected)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// ─── CORS ─────────────────────────────────────────────────────────────────────
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// ─── Autumn config ────────────────────────────────────────────────────────────
const AUTUMN_SECRET_KEY = Deno.env.get("AUTUMN_SECRET_KEY") ?? "";
const AUTUMN_API_URL = "https://api.useautumn.com/v1";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extracts the Supabase user from the JWT and resolves their org's Autumn customer ID.
 * Returns null if unauthenticated.
 */
async function resolveCustomer(req: Request): Promise<{
  customerId: string;
  customerData: { name?: string; email?: string };
} | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, serviceKey);

  // Verify JWT and get user
  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  // Get the user's active organization
  const { data: member } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(name)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!member) {
    // Fall back to user-scoped customer
    return {
      customerId: `user_${user.id}`,
      customerData: { email: user.email },
    };
  }

  const orgName = (member as any).organizations?.name ?? "Unknown Org";

  return {
    customerId: `org_${member.organization_id}`,
    customerData: {
      name: orgName,
      email: user.email,
    },
  };
}

/**
 * Forward a request to the Autumn API with the secret key, rewriting the path.
 */
async function proxyToAutumn(
  autumnPath: string,
  method: string,
  body: unknown,
  customerId: string,
  customerData: { name?: string; email?: string },
): Promise<Response> {
  const url = `${AUTUMN_API_URL}${autumnPath}`;

  // Merge customer context into the body (Autumn expects customerId in the body)
  const enrichedBody =
    body && typeof body === "object"
      ? { customerId, ...customerData, ...(body as object) }
      : { customerId, ...customerData };

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTUMN_SECRET_KEY}`,
    },
    body: method !== "GET" ? JSON.stringify(enrichedBody) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

// ─── Route table ─────────────────────────────────────────────────────────────
// Maps SDK sub-paths → Autumn API paths + allowed method
const ROUTES: Record<string, { autumnPath: string; method: string }> = {
  customer: { autumnPath: "/customers", method: "POST" },
  attach: { autumnPath: "/attach", method: "POST" },
  "attach/preview": { autumnPath: "/attach/preview", method: "POST" },
  update: { autumnPath: "/subscriptions/update", method: "POST" },
  "update/preview": { autumnPath: "/subscriptions/preview", method: "POST" },
  portal: { autumnPath: "/portal", method: "POST" },
  plans: { autumnPath: "/plans", method: "GET" },
  events: { autumnPath: "/events", method: "GET" },
  "events/aggregate": { autumnPath: "/events/aggregate", method: "POST" },
  entity: { autumnPath: "/entities", method: "GET" },
  "referral/create": { autumnPath: "/referrals", method: "POST" },
  "referral/redeem": { autumnPath: "/referrals/redeem", method: "POST" },
  "setup-payment": { autumnPath: "/payment-methods/setup", method: "POST" },
};

// ─── Main handler ────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    // Check secret key configured
    if (!AUTUMN_SECRET_KEY) {
      console.error("[Autumn] AUTUMN_SECRET_KEY not set");
      return new Response(
        JSON.stringify({ error: "Billing service not configured" }),
        {
          status: 503,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        },
      );
    }

    // Authenticate request
    const identity = await resolveCustomer(req);
    if (!identity) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Extract sub-path: /functions/v1/autumn/<sub-path>
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    // pathParts = ['', 'functions', 'v1', 'autumn', ...rest]
    const subPath = pathParts.slice(4).join("/");

    const route = ROUTES[subPath];
    if (!route) {
      return new Response(
        JSON.stringify({ error: `Unknown billing route: ${subPath}` }),
        {
          status: 404,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        },
      );
    }

    // Parse body
    let body: unknown = {};
    if (req.method !== "GET") {
      try {
        body = await req.json();
      } catch {
        /* empty body */
      }
    }

    console.log(
      `[Autumn] ${identity.customerId} → ${route.method} ${route.autumnPath}`,
    );

    return await proxyToAutumn(
      route.autumnPath,
      route.method,
      body,
      identity.customerId,
      identity.customerData,
    );
  } catch (err: any) {
    console.error("[Autumn] Unhandled error:", err.message);
    return new Response(JSON.stringify({ error: "Internal billing error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
