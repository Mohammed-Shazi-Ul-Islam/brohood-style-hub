import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Address {
  id?: string;
  user_id?: string;
  type?: string;
  first_name?: string;
  last_name?: string;
  company?: string | null;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  country?: string;
  is_default?: boolean;
}

const Checkout = () => {
  const { cart } = useCart();
  const [checkoutItems, setCheckoutItems] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>({
    first_name: "",
    last_name: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    phone: "",
    country: "India",
  });
  const location = useLocation();

  // -----------------------------
  // Load checkout items + addresses
  // -----------------------------
  useEffect(() => {
    loadCheckoutItems();
    loadAddresses();
  }, [cart, location.pathname]);

  const loadCheckoutItems = () => {
    const buyNow = localStorage.getItem("checkoutItem");
    if (buyNow) {
      try {
        setCheckoutItems([JSON.parse(buyNow)]);
        return;
      } catch (err) {
        console.error("Invalid buy now data:", err);
      }
    }
    setCheckoutItems(cart);
  };

  const loadAddresses = async () => {
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    if (!session?.user?.id) return;

    // Use auth user ID directly
    const { data: addressesData, error } = await (supabase
      .from("customer_addresses") as any)
      .select("*")
      .eq("user_id", session.user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    const addresses = addressesData || [];
    setAddresses(addresses);
    if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find((a: any) => a.is_default) || addresses[0];
      setSelectedAddress(defaultAddr);
    }
  };

  // -----------------------------
  // Save new address
  // -----------------------------
  const handleSaveNewAddress = async () => {
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    if (!session?.user?.id) return toast.error("Please login to save address.");

    // Basic validation
    const required = ["first_name", "last_name", "address_line_1", "city", "state", "postal_code", "phone"];
    const missing = required.filter((f) => !(newAddress as any)[f]);
    if (missing.length) {
      return toast.error(`Please fill: ${missing.join(", ")}`);
    }

    // Use auth user ID directly
    const { data: insertedAddress, error } = await (supabase.from("customer_addresses") as any).insert([
      {
        user_id: session.user.id,
        type: "home",
        first_name: newAddress.first_name,
        last_name: newAddress.last_name,
        address_line_1: newAddress.address_line_1,
        address_line_2: newAddress.address_line_2 || null,
        city: newAddress.city,
        state: newAddress.state,
        postal_code: newAddress.postal_code,
        country: newAddress.country || "India",
        phone: newAddress.phone,
        is_default: false,
      },
    ]).select();

    if (error) {
      console.error(error);
      toast.error(`Failed to save address: ${error.message}`);
      return;
    }

    toast.success("Address saved successfully!");
    setShowNewAddress(false);
    
    // Set the newly added address as selected
    if (insertedAddress && insertedAddress.length > 0) {
      setSelectedAddress(insertedAddress[0]);
    }
    
    setNewAddress({
      first_name: "",
      last_name: "",
      address_line_1: "",
      address_line_2: "",
      city: "",
      state: "",
      postal_code: "",
      phone: "",
      country: "India",
    });
    loadAddresses();
  };

  // -----------------------------
  // Handle payment
  // -----------------------------
  const handlePayment = () => {
    if (showNewAddress) {
      toast.error("Please save your new address before proceeding!");
      return;
    }

    if (!selectedAddress) {
      toast.error("Please select an address to proceed.");
      return;
    }

    toast.success("Redirecting to payment gateway...");
    localStorage.removeItem("checkoutItem");
  };

  // -----------------------------
  // Empty state
  // -----------------------------
  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">No items to checkout</h2>
          <Link to="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  const total = checkoutItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="min-h-screen container mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
        {/* LEFT: Items */}
        <div className="lg:col-span-2 bg-white border p-4 sm:p-6 rounded-lg">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Order Details</h2>
          <div className="space-y-6">
            {checkoutItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 sm:gap-6 border-b pb-3 sm:pb-4 last:border-none"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base truncate">{item.name}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Quantity: {item.quantity || 1}
                  </p>
                  <p className="font-bold mt-1 sm:mt-2 text-sm sm:text-base">
                    ₹{(item.price * (item.quantity || 1)).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Address + Summary */}
        <div className="bg-white border p-4 sm:p-6 rounded-lg space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-xl font-bold">Delivery Address</h2>

          {/* Address options */}
          <div className="space-y-4">
            {addresses.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Select Delivery Address:</h3>
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedAddress?.id === addr.id && !showNewAddress
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress?.id === addr.id && !showNewAddress}
                      onChange={() => {
                        setSelectedAddress(addr);
                        setShowNewAddress(false);
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {addr.first_name} {addr.last_name}
                        </p>
                        {addr.is_default && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {addr.address_line_1}
                        {addr.address_line_2 && `, ${addr.address_line_2}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {addr.city}, {addr.state} - {addr.postal_code}
                      </p>
                      <p className="text-sm text-gray-600">📞 {addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <label
              className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                showNewAddress
                  ? "border-black bg-gray-50"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <input
                type="radio"
                name="address"
                checked={showNewAddress}
                onChange={() => setShowNewAddress(true)}
              />
              <span className="font-medium">Add new address</span>
            </label>

            {showNewAddress && (
              <div className="space-y-3 mt-4 p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="First Name"
                    value={newAddress.first_name}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, first_name: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Last Name"
                    value={newAddress.last_name}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, last_name: e.target.value })
                    }
                  />
                </div>
                <Input
                  placeholder="Address Line 1"
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
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, city: e.target.value })
                    }
                  />
                  <Input
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, state: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="text"
                    placeholder="Postal Code"
                    value={newAddress.postal_code}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, "");
                      setNewAddress({ ...newAddress, postal_code: cleaned });
                    }}
                  />
                  <Input
                    type="text"
                    placeholder="Phone"
                    value={newAddress.phone}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, "");
                      setNewAddress({ ...newAddress, phone: cleaned });
                    }}
                  />
                </div>
                <Button
                  onClick={handleSaveNewAddress}
                  className="w-full bg-black hover:bg-gray-800"
                >
                  Save & Use This Address
                </Button>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Order Summary */}
          <h2 className="text-lg sm:text-xl font-bold">Order Summary</h2>
          <div className="flex justify-between text-base sm:text-lg font-semibold mt-2">
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>

          <Button
            onClick={handlePayment}
            className="w-full mt-4 sm:mt-6 bg-black hover:bg-gray-800 h-11 sm:h-12 text-sm sm:text-base"
          >
            Proceed to Payment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
