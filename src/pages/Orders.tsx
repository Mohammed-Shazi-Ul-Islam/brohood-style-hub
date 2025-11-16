import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Truck, CheckCircle, XCircle, Clock, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          items:order_items(
            *,
            product:products(
              *,
              images:product_images(*)
            )
          ),
          payments(*)
        `)
        .eq("customer_id", sessionData.session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "processing":
        return <Package className="h-5 w-5 text-blue-600" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-purple-600" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const parseAddress = (addressJson: any) => {
    if (typeof addressJson === "string") {
      return JSON.parse(addressJson);
    }
    return addressJson;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">My Orders</h1>
            <p className="text-gray-600">View and track your orders</p>
          </div>

          {orders.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
                <p className="text-gray-600 mb-6">
                  Start shopping to see your orders here
                </p>
                <Link to="/products">
                  <Button>Browse Products</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const shippingAddress = parseAddress(order.shipping_address);
                const firstItem = order.items?.[0];
                const itemCount = order.items?.length || 0;

                return (
                  <Card key={order.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Order Image */}
                        <div className="w-full md:w-32 h-32 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                          {firstItem?.product?.images?.[0]?.image_url ? (
                            <img
                              src={firstItem.product.images[0].image_url}
                              alt={firstItem.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Order Details */}
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-lg">
                                Order #{order.order_number}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Placed on {formatDate(order.created_at)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={getStatusColor(order.status)}>
                                {getStatusIcon(order.status)}
                                <span className="ml-1 capitalize">{order.status}</span>
                              </Badge>
                              <Badge className={getPaymentStatusColor(order.payment_status)}>
                                {order.payment_status === "paid" ? "Paid" : order.payment_status}
                              </Badge>
                            </div>
                          </div>

                          <Separator />

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Items</p>
                              <p className="font-semibold">
                                {itemCount} {itemCount === 1 ? "item" : "items"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                              <p className="font-bold text-lg">₹{order.total_amount}</p>
                            </div>
                          </div>

                          {shippingAddress && (
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                              <p className="text-sm">
                                {shippingAddress.first_name} {shippingAddress.last_name},{" "}
                                {shippingAddress.city}, {shippingAddress.state}
                              </p>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              View Details
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                            {order.tracking_number && (
                              <Button variant="outline" size="sm">
                                Track Order
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedOrder(null)}
        >
          <Card
            className="max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="bg-gray-50">
              <div className="flex items-center justify-between">
                <CardTitle>Order Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Order Info */}
              <div>
                <h3 className="font-semibold mb-3">Order Information</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Order Number</p>
                    <p className="font-semibold">{selectedOrder.order_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Order Date</p>
                    <p className="font-semibold">
                      {formatDate(selectedOrder.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Status</p>
                    <Badge className={getPaymentStatusColor(selectedOrder.payment_status)}>
                      {selectedOrder.payment_status}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Items */}
              <div>
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex gap-4 pb-3 border-b last:border-0">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                        {item.product?.images?.[0]?.image_url && (
                          <img
                            src={item.product.images[0].image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{item.product?.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold mt-1">₹{item.total_price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div>
                <h3 className="font-semibold mb-3">Price Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{selectedOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>₹{selectedOrder.shipping_amount}</span>
                  </div>
                  {parseFloat(selectedOrder.discount_amount) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{selectedOrder.discount_amount}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{selectedOrder.total_amount}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Delivery Address */}
              {(() => {
                const address = parseAddress(selectedOrder.shipping_address);
                return (
                  <div>
                    <h3 className="font-semibold mb-3">Delivery Address</h3>
                    <div className="text-sm space-y-1">
                      <p className="font-semibold">
                        {address.first_name} {address.last_name}
                      </p>
                      <p>{address.address_line_1}</p>
                      {address.address_line_2 && <p>{address.address_line_2}</p>}
                      <p>
                        {address.city}, {address.state} - {address.postal_code}
                      </p>
                      <p>{address.country}</p>
                      <p className="mt-2">📞 {address.phone}</p>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Orders;
