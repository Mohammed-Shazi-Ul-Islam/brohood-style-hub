import { useEffect, useState } from "react";
import { Users, Search, Mail, Phone, MapPin, ShoppingBag, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      // Get all users who have placed orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("customer_id, created_at")
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      // Get unique customer IDs
      const uniqueCustomerIds = [...new Set(ordersData?.map((o) => o.customer_id))];

      // Fetch customer details
      const customersWithDetails = await Promise.all(
        uniqueCustomerIds.map(async (customerId) => {
          // Get orders for this customer
          const { data: customerOrders } = await supabase
            .from("orders")
            .select("*")
            .eq("customer_id", customerId);

          // Get addresses for this customer
          const { data: addresses } = await supabase
            .from("customer_addresses")
            .select("*")
            .eq("user_id", customerId)
            .limit(1);

          // Get user email from auth
          const { data: userData } = await supabase.auth.admin.getUserById(customerId);

          const totalOrders = customerOrders?.length || 0;
          const totalSpent = customerOrders?.reduce(
            (sum, order) => sum + parseFloat(order.total_amount),
            0
          ) || 0;

          const address = addresses?.[0];
          const shippingAddress = customerOrders?.[0]?.shipping_address
            ? typeof customerOrders[0].shipping_address === "string"
              ? JSON.parse(customerOrders[0].shipping_address)
              : customerOrders[0].shipping_address
            : null;

          return {
            id: customerId,
            email: userData?.user?.email || "N/A",
            name: address
              ? `${address.first_name} ${address.last_name}`
              : shippingAddress
              ? `${shippingAddress.first_name} ${shippingAddress.last_name}`
              : "Unknown",
            phone: address?.phone || shippingAddress?.phone || "N/A",
            city: address?.city || shippingAddress?.city || "N/A",
            totalOrders,
            totalSpent,
            lastOrderDate: customerOrders?.[0]?.created_at || null,
            joinedDate: userData?.user?.created_at || null,
          };
        })
      );

      setCustomers(customersWithDetails);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (customerId: string) => {
    try {
      // Get all orders
      const { data: orders } = await supabase
        .from("orders")
        .select(`
          *,
          items:order_items(
            *,
            product:products(*)
          )
        `)
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      // Get addresses
      const { data: addresses } = await supabase
        .from("customer_addresses")
        .select("*")
        .eq("user_id", customerId);

      setSelectedCustomer({
        ...customers.find((c) => c.id === customerId),
        orders: orders || [],
        addresses: addresses || [],
      });
    } catch (error) {
      console.error("Error fetching customer details:", error);
      toast.error("Failed to load customer details");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  );

  const stats = {
    total: customers.length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    avgOrderValue:
      customers.length > 0
        ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length
        : 0,
    totalOrders: customers.reduce((sum, c) => sum + c.totalOrders, 0),
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Customers Management</h1>
          <p className="text-gray-600">View and manage customer information</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">₹{stats.totalRevenue.toFixed(0)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
                <p className="text-3xl font-bold text-blue-600">₹{stats.avgOrderValue.toFixed(0)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalOrders}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-400 animate-pulse mb-4" />
                <p className="text-gray-600">Loading customers...</p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No customers found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Customer Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{customer.name}</h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div>
                            <p className="text-gray-600">Phone</p>
                            <p className="font-semibold flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Location</p>
                            <p className="font-semibold flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {customer.city}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Total Orders</p>
                            <p className="font-semibold flex items-center gap-1">
                              <ShoppingBag className="h-3 w-3" />
                              {customer.totalOrders}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Total Spent</p>
                            <p className="font-semibold text-green-600">
                              ₹{customer.totalSpent.toFixed(0)}
                            </p>
                          </div>
                        </div>

                        {customer.lastOrderDate && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Last order: {formatDate(customer.lastOrderDate)}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchCustomerDetails(customer.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Details Modal */}
        {selectedCustomer && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedCustomer(null)}
          >
            <Card
              className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="bg-gray-50">
                <div className="flex items-center justify-between">
                  <CardTitle>Customer Details</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold mb-3">Customer Information</h3>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Name</p>
                      <p className="font-semibold">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="font-semibold">{selectedCustomer.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-semibold">{selectedCustomer.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Location</p>
                      <p className="font-semibold">{selectedCustomer.city}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Orders</p>
                      <p className="font-semibold">{selectedCustomer.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Spent</p>
                      <p className="font-semibold text-green-600">
                        ₹{selectedCustomer.totalSpent.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Addresses */}
                {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-3">Saved Addresses</h3>
                      <div className="space-y-3">
                        {selectedCustomer.addresses.map((addr: any) => (
                          <div key={addr.id} className="p-3 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{addr.type}</Badge>
                              {addr.is_default && (
                                <Badge className="bg-green-100 text-green-800">Default</Badge>
                              )}
                            </div>
                            <p className="text-sm">
                              {addr.address_line_1}
                              {addr.address_line_2 && `, ${addr.address_line_2}`}
                            </p>
                            <p className="text-sm">
                              {addr.city}, {addr.state} - {addr.postal_code}
                            </p>
                            <p className="text-sm text-gray-600">📞 {addr.phone}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Recent Orders */}
                <div>
                  <h3 className="font-semibold mb-3">Recent Orders</h3>
                  <div className="space-y-3">
                    {selectedCustomer.orders?.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">#{order.order_number}</p>
                            <p className="text-xs text-gray-600">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">₹{order.total_amount}</p>
                            <Badge className="text-xs">{order.status}</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          {order.items?.length || 0} items
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCustomers;
