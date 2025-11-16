import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { CheckCircle, Package, Truck, Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderNumber = searchParams.get("order");
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetails();
      // Show success toast
      toast.success(`Order ${orderNumber} placed successfully!`);
      
      // Start countdown to redirect
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate("/orders");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [orderNumber, navigate]);

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          items:order_items(
            *,
            product:products(*)
          )
        `)
        .eq("order_number", orderNumber)
        .single();

      if (error) throw error;
      setOrderDetails(data);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  const shippingAddress = orderDetails?.shipping_address 
    ? (typeof orderDetails.shipping_address === 'string' 
        ? JSON.parse(orderDetails.shipping_address) 
        : orderDetails.shipping_address)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Icon */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase, {shippingAddress?.first_name}!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Order Details Card */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-xl">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Order Number</span>
                  <span className="font-bold text-lg">{orderNumber || "N/A"}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Status</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Paid
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Order Status</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Confirmed
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-bold text-lg">₹{orderDetails?.total_amount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address Card */}
          {shippingAddress && (
            <Card className="shadow-lg">
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-xl">Delivery Address</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="font-semibold">
                    {shippingAddress.first_name} {shippingAddress.last_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {shippingAddress.address_line_1}
                  </p>
                  {shippingAddress.address_line_2 && (
                    <p className="text-sm text-gray-600">
                      {shippingAddress.address_line_2}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postal_code}
                  </p>
                  <p className="text-sm text-gray-600">
                    {shippingAddress.country}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    📞 {shippingAddress.phone}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Items */}
        {orderDetails?.items && orderDetails.items.length > 0 && (
          <Card className="mb-6 shadow-lg">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-xl">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {orderDetails.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0">
                      {item.product?.images?.[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product?.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.product?.name || "Product"}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm font-semibold mt-1">₹{item.total_price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* What's Next */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-xl">What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Order Processing</h3>
                  <p className="text-sm text-gray-600">
                    We're preparing your order for shipment. You'll receive a confirmation email shortly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Shipping Updates</h3>
                  <p className="text-sm text-gray-600">
                    Track your order status and get real-time shipping updates via email.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Home className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Delivery</h3>
                  <p className="text-sm text-gray-600">
                    Your order will be delivered to your specified address within 5-7 business days.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auto Redirect Notice */}
        <div className="text-center mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Redirecting to your orders page in <span className="font-bold">{countdown}</span> seconds...
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/orders" className="flex-1">
            <Button variant="default" size="lg" className="w-full">
              View All Orders Now
            </Button>
          </Link>
          <Link to="/products" className="flex-1">
            <Button variant="outline" size="lg" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Need help? Contact our support team at{" "}
            <a href="mailto:support@brohood.com" className="text-blue-600 hover:underline">
              support@brohood.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
