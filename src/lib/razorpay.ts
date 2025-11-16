// Razorpay integration utilities
import { supabase } from "@/integrations/supabase/client";

// Razorpay configuration
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_RgQlcr9Ia2zC4v";

// Load Razorpay script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Create Razorpay order
export interface CreateOrderParams {
  items: Array<{
    product_id: string;
    variant_id?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product_snapshot: any;
  }>;
  shipping_address: any;
  billing_address?: any;
  subtotal: number;
  shipping_amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes?: string;
}

export const createOrder = async (params: CreateOrderParams) => {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user?.id) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase.rpc("create_order_with_razorpay", {
    p_customer_id: session.session.user.id,
    p_items: params.items,
    p_shipping_address: params.shipping_address,
    p_billing_address: params.billing_address || params.shipping_address,
    p_subtotal: params.subtotal,
    p_shipping_amount: params.shipping_amount,
    p_tax_amount: params.tax_amount,
    p_discount_amount: params.discount_amount,
    p_total_amount: params.total_amount,
    p_notes: params.notes || null,
  });

  if (error) throw error;
  return data[0];
};

// Initialize Razorpay payment
export interface RazorpayOptions {
  orderNumber: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

export const initializeRazorpay = async (options: RazorpayOptions) => {
  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded) {
    throw new Error("Failed to load Razorpay SDK");
  }

  const razorpayOptions = {
    key: RAZORPAY_KEY_ID,
    amount: Math.round(options.amount * 100), // Convert to paise
    currency: options.currency,
    name: "BroHood",
    description: `Order #${options.orderNumber}`,
    prefill: {
      name: options.customerName,
      email: options.customerEmail,
      contact: options.customerPhone,
    },
    theme: {
      color: "#000000",
    },
    handler: async (response: any) => {
      try {
        await options.onSuccess(response);
      } catch (error) {
        console.error("Payment success handler error:", error);
        options.onFailure(error);
      }
    },
    modal: {
      ondismiss: () => {
        options.onFailure(new Error("Payment cancelled by user"));
      },
    },
    notes: {
      order_number: options.orderNumber,
    },
  };

  const razorpay = new (window as any).Razorpay(razorpayOptions);
  razorpay.open();
};

// Verify payment
export const verifyPayment = async (
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) => {
  const { data, error } = await supabase.rpc("update_payment_status", {
    p_order_id: orderId,
    p_razorpay_order_id: razorpayOrderId,
    p_razorpay_payment_id: razorpayPaymentId,
    p_razorpay_signature: razorpaySignature,
    p_status: "paid",
    p_payment_method: "razorpay",
  });

  if (error) throw error;
  return data;
};

// Mark payment as failed
export const markPaymentFailed = async (orderId: string, reason: string) => {
  const { data, error } = await supabase.rpc("update_payment_status", {
    p_order_id: orderId,
    p_razorpay_order_id: "",
    p_razorpay_payment_id: "",
    p_razorpay_signature: "",
    p_status: "failed",
    p_failure_reason: reason,
  });

  if (error) throw error;
  return data;
};

// Get order details
export const getOrderDetails = async (orderId: string) => {
  const { data, error } = await supabase.rpc("get_order_details", {
    p_order_id: orderId,
  });

  if (error) throw error;
  return data;
};

// Get user orders
export const getUserOrders = async () => {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user?.id) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase.rpc("get_user_orders", {
    p_user_id: session.session.user.id,
  });

  if (error) throw error;
  return data;
};
