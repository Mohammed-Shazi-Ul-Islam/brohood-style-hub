import { useEffect, useState } from "react";
import { Package, Search, Filter, Eye, Truck, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
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
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;

      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error: any) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order status");
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
      month: "short",
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parseAddress(order.shipping_address)
        .first_name?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <AdminLayout>
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Orders Management</h1>
        <p className="text-gray-600">Manage and track all customer orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-gray-600">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Confirmed</p>
              <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Shipped</p>
              <p className="text-3xl font-bold text-purple-600">{stats.shipped}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Delivered</p>
              <p className="text-3xl font-bold text-blue-600">{stats.delivered}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by order number or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-gray-400 animate-pulse mb-4" />
              <p className="text-gray-600">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No orders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const address = parseAddress(order.shipping_address);
                const itemCount = order.items?.length || 0;

                return (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Order Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-lg">#{order.order_number}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <Badge className={getPaymentStatusColor(order.payment_status)}>
                            {order.payment_status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div>
                            <p className="text-gray-600">Customer</p>
                            <p className="font-semibold">
                              {address.first_name} {address.last_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Items</p>
                            <p className="font-semibold">{itemCount}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Total</p>
                            <p className="font-semibold">₹{order.total_amount}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Date</p>
                            <p className="font-semibold">{formatDate(order.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateOrderStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedOrder(null)}
        >
          <Card
            className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="bg-gray-50">
              <div className="flex items-center justify-between">
                <CardTitle>Order #{selectedOrder.order_number}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
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
                    <p className="font-semibold">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
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

              {/* Customer & Delivery Info */}
              <div className="grid md:grid-cols-2 gap-6">
                {(() => {
                  const address = parseAddress(selectedOrder.shipping_address);
                  return (
                    <>
                      <div>
                        <h3 className="font-semibold mb-3">Customer Information</h3>
                        <div className="text-sm space-y-1">
                          <p className="font-semibold">
                            {address.first_name} {address.last_name}
                          </p>
                          <p className="text-gray-600">📞 {address.phone}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-3">Delivery Address</h3>
                        <div className="text-sm space-y-1">
                          <p>{address.address_line_1}</p>
                          {address.address_line_2 && <p>{address.address_line_2}</p>}
                          <p>
                            {address.city}, {address.state} - {address.postal_code}
                          </p>
                          <p>{address.country}</p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default AdminOrders;
