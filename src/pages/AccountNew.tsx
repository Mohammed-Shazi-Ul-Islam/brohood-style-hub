import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Loader2,
  LogOut,
  User,
  MapPin,
  Trash2,
  Plus,
  X,
  Package,
  Heart,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";

const AccountNew = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    first_name: "",
    last_name: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    phone: "",
    type: "home",
  });

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      navigate("/login");
      return;
    }
    setSession(data.session);
    fetchAddresses(data.session.user.id);
    setLoading(false);
  };

  const fetchAddresses = async (userId: string) => {
    const { data, error } = await supabase
      .from("customer_addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false });

    if (!error && data) {
      setAddresses(data);
    }
  };

  const handleAddAddress = async () => {
    if (!session?.user?.id) return;

    const required = ["first_name", "last_name", "address_line_1", "city", "state", "postal_code", "phone"];
    const missing = required.filter((f) => !(newAddress as any)[f]);
    if (missing.length) {
      toast.error(`Please fill: ${missing.join(", ")}`);
      return;
    }

    try {
      const { error } = await supabase.from("customer_addresses").insert([
        {
          user_id: session.user.id,
          ...newAddress,
        },
      ]);

      if (error) throw error;

      toast.success("Address added successfully!");
      setShowAddressForm(false);
      setNewAddress({
        first_name: "",
        last_name: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "India",
        phone: "",
        type: "home",
      });
      fetchAddresses(session.user.id);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const { error } = await supabase.from("customer_addresses").delete().eq("id", id);
      if (error) throw error;
      toast.success("Address deleted");
      fetchAddresses(session.user.id);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">My Account</h1>
            <p className="text-gray-600">Manage your profile and addresses</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3">
                      {session?.user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="font-bold text-lg">{session?.user?.email}</h3>
                    <p className="text-sm text-gray-600">
                      Member since {new Date(session?.user?.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => navigate("/orders")}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      My Orders
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => navigate("/wishlist")}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Wishlist
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Addresses Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Saved Addresses
                    </CardTitle>
                    {!showAddressForm && (
                      <Button
                        onClick={() => setShowAddressForm(true)}
                        size="sm"
                        className="bg-black hover:bg-gray-800"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Address
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {showAddressForm ? (
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Add New Address</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAddressForm(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="First Name *"
                          value={newAddress.first_name}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, first_name: e.target.value })
                          }
                        />
                        <Input
                          placeholder="Last Name *"
                          value={newAddress.last_name}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, last_name: e.target.value })
                          }
                        />
                      </div>

                      <Input
                        placeholder="Address Line 1 *"
                        value={newAddress.address_line_1}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, address_line_1: e.target.value })
                        }
                      />

                      <Input
                        placeholder="Address Line 2 (Optional)"
                        value={newAddress.address_line_2}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, address_line_2: e.target.value })
                        }
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="City *"
                          value={newAddress.city}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, city: e.target.value })
                          }
                        />
                        <Input
                          placeholder="State *"
                          value={newAddress.state}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, state: e.target.value })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Postal Code *"
                          value={newAddress.postal_code}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, postal_code: e.target.value })
                          }
                        />
                        <Input
                          placeholder="Phone *"
                          value={newAddress.phone}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, phone: e.target.value })
                          }
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={handleAddAddress}
                          className="flex-1 bg-black hover:bg-gray-800"
                        >
                          Save Address
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowAddressForm(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>No addresses saved yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">
                                  {addr.first_name} {addr.last_name}
                                </h4>
                                {addr.is_default && (
                                  <Badge className="bg-green-100 text-green-800">Default</Badge>
                                )}
                                <Badge variant="outline">{addr.type}</Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                {addr.address_line_1}
                                {addr.address_line_2 && `, ${addr.address_line_2}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {addr.city}, {addr.state} - {addr.postal_code}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">📞 {addr.phone}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteAddress(addr.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AccountNew;
