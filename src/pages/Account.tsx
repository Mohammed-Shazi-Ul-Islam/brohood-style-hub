import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, User, MapPin, Trash2, Star } from "lucide-react";
import logo from "@/assets/logo.png";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Address {
  id: string;
  user_id: string;
  type: string;
  first_name: string;
  last_name: string;
  company: string | null;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

const Account = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userMeta, setUserMeta] = useState<{ email?: string; created_at?: string } | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState({
    first_name: "",
    last_name: "",
    company: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    phone: "",
    type: "home"
  });
  const [customerProfileId, setCustomerProfileId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      setSession(session);

      if (session?.user) {
        setUserMeta({
          email: session.user.email,
          created_at: session.user.created_at,
        });
        
        // Fetch addresses using auth user ID
        await fetchAddresses(session.user.id);
        
        // Still fetch customer profile for potential future use
        const { data: profile } = await (supabase
          .from("customer_profiles") as any)
          .select("id")
          .eq("user_id", session.user.id)
          .single();

        if (profile) {
          setCustomerProfileId(profile.id);
        } else {
          console.log("No customer profile found for user:", session.user.id);
        }
      }

      setLoading(false);
    };
    fetchSession();
  }, []);

  const fetchAddresses = async (userId: string) => {
    const { data, error } = await (supabase
      .from("customer_addresses") as any)
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to fetch addresses");
      return;
    }

    setAddresses(data || []);
  };

  const handleAddAddress = async () => {
    if (!session?.user) {
      toast.error("Please login first");
      return;
    }

    const required = ["first_name", "last_name", "address_line_1", "city", "state", "postal_code", "phone"];
    const missing = required.filter(field => !newAddress[field as keyof typeof newAddress]);
    
    if (missing.length) {
      toast.error(`Please fill: ${missing.join(", ")}`);
      return;
    }

    const addressPayload = {
      user_id: session.user.id, // Use auth user ID
      type: newAddress.type,
      first_name: newAddress.first_name,
      last_name: newAddress.last_name,
      company: newAddress.company || null,
      address_line_1: newAddress.address_line_1,
      address_line_2: newAddress.address_line_2 || null,
      city: newAddress.city,
      state: newAddress.state,
      postal_code: newAddress.postal_code,
      country: newAddress.country,
      phone: newAddress.phone,
      is_default: addresses.length === 0
    };

    const { error } = await (supabase.from("customer_addresses") as any).insert([addressPayload]);

    if (error) {
      console.error("Error adding address:", error);
      toast.error(`Failed to save address: ${error.message}`);
      return;
    }

    toast.success("Address added successfully!");
    setNewAddress({
      first_name: "",
      last_name: "",
      company: "",
      address_line_1: "",
      address_line_2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
      phone: "",
      type: "home"
    });
    
    fetchAddresses(session.user.id);
  };

  const handleSetDefault = async (addressId: string) => {
    if (!session?.user) return;

    const { error: updateError } = await (supabase
      .from("customer_addresses") as any)
      .update({ is_default: false })
      .eq("user_id", session.user.id);

    if (updateError) {
      console.error("Error updating addresses:", updateError);
      return;
    }

    const { error } = await (supabase
      .from("customer_addresses") as any)
      .update({ is_default: true })
      .eq("id", addressId);

    if (error) {
      console.error("Error setting default address:", error);
      toast.error("Failed to set default address");
      return;
    }

    toast.success("Default address updated!");
    fetchAddresses(session.user.id);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!session?.user) return;

    const { error } = await supabase
      .from("customer_addresses")
      .delete()
      .eq("id", addressId);

    if (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
      return;
    }

    toast.success("Address deleted successfully!");
    fetchAddresses(session.user.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="absolute top-8 left-10">
          <Link to="/">
            <img src={logo} alt="BroHood Logo" className="h-32 w-auto object-contain" />
          </Link>
        </div>

        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 p-10 text-center space-y-6">
          <h1 className="text-3xl font-serif font-bold text-gray-900">Welcome to BroHood</h1>
          <p className="text-gray-600 text-base">Sign in to view your orders and addresses.</p>

          <div className="flex flex-col gap-4 mt-6">
            <Link to="/login?redirect=/account">
              <Button className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-full">
                Sign In
              </Button>
            </Link>
            <Link to="/login?signup=true&redirect=/account">
              <Button
                variant="outline"
                className="w-full h-12 border-2 border-black text-black hover:bg-black hover:text-white font-medium rounded-full"
              >
                Create Account
              </Button>
            </Link>
            <Link to="/">
              <Button
                variant="outline"
                className="w-full h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-full"
              >
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
      <div className="absolute top-8 left-10">
        <Link to="/">
          <img src={logo} alt="BroHood Logo" className="h-32 w-auto object-contain" />
        </Link>
      </div>

      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 space-y-8">
        <div className="text-center">
          <div className="h-24 w-24 mx-auto rounded-full bg-gray-100 flex items-center justify-center shadow-inner border border-gray-200 mb-4">
            <User className="h-12 w-12 text-gray-500" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900">My Account</h2>
          <p className="text-gray-600 text-base">
            Welcome back, {userMeta?.email?.split("@")[0]} 👋
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
          <p className="text-sm text-gray-800">
            <span className="font-semibold">Email:</span> {userMeta?.email}
          </p>
          <p className="text-sm text-gray-800">
            <span className="font-semibold">Member Since:</span>{" "}
            {new Date(userMeta?.created_at || "").toLocaleDateString()}
          </p>
        </div>

        <Separator className="my-4" />
        <div>
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <MapPin className="h-5 w-5" /> My Addresses
          </h3>

          {addresses.length === 0 && (
            <p className="text-gray-500 mb-4">No addresses added yet.</p>
          )}

          <div className="grid gap-4 mb-8">
            {addresses.map((addr) => (
              <div key={addr.id} className={`border rounded-lg p-4 ${addr.is_default ? 'border-green-500 bg-green-50' : 'bg-gray-50'} relative`}>
                {addr.is_default && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-green-600">
                    <Star className="h-4 w-4 fill-green-600" />
                    <span className="text-xs font-medium">Default</span>
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium capitalize">{addr.type} Address</p>
                    <p className="text-sm mt-1">
                      {addr.first_name} {addr.last_name}
                    </p>
                    <p className="text-sm">
                      {addr.address_line_1}{addr.address_line_2 && `, ${addr.address_line_2}`}
                    </p>
                    <p className="text-sm">
                      {addr.city}, {addr.state} - {addr.postal_code}
                    </p>
                    <p className="text-sm">{addr.country}</p>
                    {addr.phone && (
                      <p className="text-sm text-gray-600 mt-1">📞 {addr.phone}</p>
                    )}
                    {addr.company && (
                      <p className="text-sm text-gray-600">🏢 {addr.company}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {!addr.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-xs"
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            <h4 className="text-lg font-semibold">Add New Address</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="First Name"
                value={newAddress.first_name}
                onChange={(e) => setNewAddress({ ...newAddress, first_name: e.target.value })}
              />
              <Input
                placeholder="Last Name"
                value={newAddress.last_name}
                onChange={(e) => setNewAddress({ ...newAddress, last_name: e.target.value })}
              />
              <Input
                placeholder="Company (Optional)"
                value={newAddress.company}
                onChange={(e) => setNewAddress({ ...newAddress, company: e.target.value })}
              />
              <div>
                <select
                  value={newAddress.type}
                  onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Input
                placeholder="Address Line 1"
                value={newAddress.address_line_1}
                onChange={(e) => setNewAddress({ ...newAddress, address_line_1: e.target.value })}
                className="col-span-2"
              />
              <Input
                placeholder="Address Line 2 (Optional)"
                value={newAddress.address_line_2}
                onChange={(e) => setNewAddress({ ...newAddress, address_line_2: e.target.value })}
                className="col-span-2"
              />
              <Input
                placeholder="City"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
              />
              <Input
                placeholder="State"
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
              />
              <Input
                placeholder="Postal Code"
                value={newAddress.postal_code}
                onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
              />
              <Input
                placeholder="Phone"
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
              />
            </div>
            <Button
              onClick={handleAddAddress}
              className="w-full bg-black hover:bg-gray-800 mt-2"
            >
              Save Address
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-8">
          <Link to="/">
            <Button variant="outline" className="w-full border-2 border-black text-black hover:bg-black hover:text-white rounded-full">
              Continue Shopping
            </Button>
          </Link>

          <Button
            onClick={handleLogout}
            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium rounded-full"
          >
            <LogOut className="mr-2 h-5 w-5" /> Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Account;