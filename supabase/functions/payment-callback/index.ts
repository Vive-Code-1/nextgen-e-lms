import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const orderId = url.searchParams.get("order_id");

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // GET request from redirect, use query params
    }

    const targetOrderId = orderId || body?.order_id || body?.metadata?.order_id;
    if (!targetOrderId) {
      return new Response(JSON.stringify({ error: "Missing order_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update order status
    const { data: order, error: updateErr } = await supabase
      .from("orders")
      .update({ payment_status: "completed", transaction_id: body?.transaction_id || "callback" })
      .eq("id", targetOrderId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Create enrollment if course_id exists
    if (order?.course_id && order?.user_id) {
      await supabase.from("enrollments").upsert({
        user_id: order.user_id,
        course_id: order.course_id,
      }, { onConflict: "user_id,course_id" });
    }

    // Redirect to dashboard for GET requests
    if (req.method === "GET") {
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, Location: "https://nextgen-e-lms.lovable.app/dashboard?payment=success" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
