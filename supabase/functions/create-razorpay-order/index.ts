// Supabase Edge Function to create Razorpay order
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") || "rzp_test_RgQlcr9Ia2zC4v";
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") || "l1qxbg36OOLomPHjuwYNELTr";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount, currency, receipt, notes } = await req.json();

    // Validate input
    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    // Create Razorpay order
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to paise
        currency: currency || "INR",
        receipt: receipt || `order_${Date.now()}`,
        notes: notes || {},
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.description || "Failed to create Razorpay order");
    }

    const razorpayOrder = await response.json();

    return new Response(JSON.stringify(razorpayOrder), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
