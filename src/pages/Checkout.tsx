import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";

const Checkout = () => {
  const { cart } = useCart();
  const [checkoutItems, setCheckoutItems] = useState<any[]>([]);
  const location = useLocation();

  useEffect(() => {
    // Check for "Buy Now" item
    const buyNowItem = localStorage.getItem("checkoutItem");

    if (buyNowItem) {
      try {
        const parsed = JSON.parse(buyNowItem);
        setCheckoutItems([parsed]);
        return; // ✅ Stop here so it doesn't get overridden by cart
      } catch {
        console.error("Invalid buy now data");
      }
    }

    // Otherwise, show the cart
    if (cart && cart.length > 0) {
      setCheckoutItems(cart);
    }
  }, [cart, location.pathname]);

  const handlePayment = () => {
    alert("Redirecting to payment gateway...");
    localStorage.removeItem("checkoutItem");
  };

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

  return (
    <div className="min-h-screen container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          <div className="space-y-6">
            {checkoutItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-6 border-b pb-4 last:border-none"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-600 text-sm">
                    Quantity: {item.quantity || 1}
                  </p>
                  <p className="font-bold mt-2">
                    ₹{(item.price * (item.quantity || 1)).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <Separator className="my-4" />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
          <Button
            onClick={handlePayment}
            className="w-full mt-6 bg-black hover:bg-gray-800"
          >
            Proceed to Payment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
