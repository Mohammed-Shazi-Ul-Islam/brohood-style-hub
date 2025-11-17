import { Link } from "react-router-dom";
import { Trash2, Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";


const Cart = () => {
  const { cart, removeFromCart, clearCart } = useCart();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 999 ? 0 : 99;
  const discount = 0;
  const total = subtotal + shipping - discount;

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <p className="text-muted-foreground">Add some products to get started!</p>
          <Link to="/products">
            <Button variant="premium" size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {cart.map((item) => (
              <div
                key={`${item.id}-${item.size || 'no-size'}`}
                className="bg-card rounded-lg border border-border p-3 sm:p-4 md:p-6"
              >
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2 sm:gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base lg:text-lg truncate">{item.name}</h3>
                        {item.size && (
                          <p className="text-xs text-muted-foreground mt-0.5">Size: {item.size}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                        onClick={() => removeFromCart(item.id, item.size)}
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                      Quantity: {item.quantity}
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-primary text-xs sm:text-sm h-8 px-2 sm:px-3">
                        <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Move to Wishlist</span>
                        <span className="sm:hidden">Wishlist</span>
                      </Button>
                      <div className="font-bold text-base sm:text-lg">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border p-6 sticky top-24 space-y-4">
              <h2 className="text-xl font-bold">Order Summary</h2>

              {/* Coupon */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Have a coupon?</label>
                <div className="flex gap-2">
                  <Input placeholder="Enter code" />
                  <Button variant="outline">Apply</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-primary">FREE</span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>

              <Link to="/checkout">
                <Button variant="premium" size="lg" className="w-full">
                  Proceed to Checkout
                </Button>
              </Link>

              <Link to="/">
                <Button variant="outline" size="lg" className="w-full">
                  Continue Shopping
                </Button>
              </Link>

              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={clearCart}
              >
                Clear Cart
              </Button>

              <div className="text-xs text-center text-muted-foreground pt-4">
                <p>Secure checkout powered by Razorpay</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
