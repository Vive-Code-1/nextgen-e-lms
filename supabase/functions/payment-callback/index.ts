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
    const apiKey = Deno.env.get("UDDOKTAPAY_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const invoiceId = url.searchParams.get("invoice_id");

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // GET request from redirect, use query params
    }

    // If we have an invoice_id, verify with UddoktaPay
    if (invoiceId || body?.invoice_id) {
      const targetInvoiceId = invoiceId || body.invoice_id;
      const baseUrl = "https://digitaltechdude.paymently.io/api";

      const verifyRes = await fetch(`${baseUrl}/verify-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "RT-UDDOKTAPAY-API-KEY": apiKey,
        },
        body: JSON.stringify({ invoice_id: targetInvoiceId }),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.status === "COMPLETED" && verifyData.metadata?.order_id) {
        const orderId = verifyData.metadata.order_id;

        // Update order status
        const { data: order, error: updateErr } = await supabase
          .from("orders")
          .update({
            payment_status: "completed",
            transaction_id: verifyData.transaction_id || targetInvoiceId,
          })
          .eq("id", orderId)
          .select()
          .single();

        if (updateErr) throw updateErr;

        // Create enrollment
        if (order?.course_id && order?.user_id) {
          await supabase.from("enrollments").upsert({
            user_id: order.user_id,
            course_id: order.course_id,
          }, { onConflict: "user_id,course_id" });
        }
      }

      // Redirect to thank-you page for GET requests
      if (req.method === "GET") {
        return new Response(null, {
          status: 302,
          headers: { ...corsHeaders, Location: "https://nextgen-e-lms.lovable.app/thank-you?payment=success" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: handle by order_id (for non-UddoktaPay callbacks)
    const targetOrderId = url.searchParams.get("order_id") || body?.order_id || body?.metadata?.order_id;
    if (!targetOrderId) {
      return new Response(JSON.stringify({ error: "Missing invoice_id or order_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: order, error: updateErr } = await supabase
      .from("orders")
      .update({ payment_status: "completed", transaction_id: body?.transaction_id || "callback" })
      .eq("id", targetOrderId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    if (order?.course_id && order?.user_id) {
      await supabase.from("enrollments").upsert({
        user_id: order.user_id,
        course_id: order.course_id,
      }, { onConflict: "user_id,course_id" });
    }

    if (req.method === "GET") {
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, Location: "https://nextgen-e-lms.lovable.app/thank-you?payment=success" },
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
