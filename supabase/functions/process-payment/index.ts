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
    const { course_slug, payment_method, amount, user_id, course_title, full_name, email, sender_phone, trx_id } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Look up course_id from slug
    let courseId: string | null = null;
    if (course_slug) {
      const { data: courseData } = await supabase
        .from("courses")
        .select("id")
        .eq("slug", course_slug)
        .single();
      courseId = courseData?.id || null;
    }

    // Manual BD payments and COD - create order directly as pending
    if (["bkash_manual", "nagad_manual", "rocket_manual", "cod"].includes(payment_method)) {
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id,
          amount,
          currency: "BDT",
          payment_method,
          payment_status: "pending",
          course_id: courseId,
          sender_phone: sender_phone || null,
          trx_id: trx_id || null,
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      return new Response(JSON.stringify({ success: true, order_id: order.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create order record for gateway payments
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id,
        amount,
        currency: "USD",
        payment_method,
        payment_status: "pending",
        course_id: courseId,
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    if (payment_method === "uddoktapay") {
      const apiKey = Deno.env.get("UDDOKTAPAY_API_KEY");
      if (!apiKey) throw new Error("UddoktaPay API key not configured");

      const baseUrl = "https://digitaltechdude.paymently.io/api";
      const appOrigin = req.headers.get("origin") || "https://nextgen-e-lms.lovable.app";

      const response = await fetch(`${baseUrl}/checkout-v2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "RT-UDDOKTAPAY-API-KEY": apiKey,
        },
        body: JSON.stringify({
          full_name: full_name || "Customer",
          email: email || "customer@example.com",
          amount: amount.toString(),
          metadata: { order_id: order.id, course_slug, course_id: courseId },
          redirect_url: `${supabaseUrl}/functions/v1/payment-callback`,
          return_type: "GET",
          cancel_url: `${appOrigin}/courses/${course_slug}`,
          webhook_url: `${supabaseUrl}/functions/v1/payment-callback`,
        }),
      });

      const data = await response.json();
      if (!data.status) throw new Error(data.message || "UddoktaPay error");

      return new Response(JSON.stringify({ redirect_url: data.payment_url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (payment_method === "stripe") {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (!stripeKey) throw new Error("Stripe key not configured");

      const params = new URLSearchParams();
      params.append("mode", "payment");
      params.append("success_url", `${req.headers.get("origin") || "https://nextgen-e-lms.lovable.app"}/dashboard?payment=success`);
      params.append("cancel_url", `${req.headers.get("origin") || "https://nextgen-e-lms.lovable.app"}/courses/${course_slug}`);
      params.append("line_items[0][price_data][currency]", "usd");
      params.append("line_items[0][price_data][product_data][name]", course_title || "Course");
      params.append("line_items[0][price_data][unit_amount]", Math.round(amount * 100).toString());
      params.append("line_items[0][quantity]", "1");
      params.append("metadata[order_id]", order.id);

      const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      const session = await response.json();
      return new Response(JSON.stringify({ redirect_url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (payment_method === "paypal") {
      const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
      const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
      if (!clientId || !clientSecret) throw new Error("PayPal credentials not configured");

      const authRes = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });
      const { access_token } = await authRes.json();

      const orderRes = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [{
            amount: { currency_code: "USD", value: amount.toFixed(2) },
            custom_id: order.id,
          }],
          application_context: {
            return_url: `${req.headers.get("origin") || "https://nextgen-e-lms.lovable.app"}/dashboard?payment=success`,
            cancel_url: `${req.headers.get("origin") || "https://nextgen-e-lms.lovable.app"}/courses/${course_slug}`,
          },
        }),
      });

      const paypalOrder = await orderRes.json();
      const approveLink = paypalOrder.links?.find((l: any) => l.rel === "approve");
      return new Response(JSON.stringify({ redirect_url: approveLink?.href }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid payment method" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
