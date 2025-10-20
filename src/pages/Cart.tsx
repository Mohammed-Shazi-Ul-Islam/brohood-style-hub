import { Link } from "react-router-dom";
import { Trash2, Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import productTshirt from "@/assets/product-tshirt-1.jpg";
import productJeans from "@/assets/product-jeans-1.jpg";

// Mock cart data
const cartItems = [
  {
    id: "1",
    name: "Premium Black T-Shirt",
    image: productTshirt,
    price: 999,
    originalPrice: 1499,
    size: "M",
    color: "Black",
    quantity: 2,
  },
  {
    id: "2",
    name: "Classic Blue Denim Jeans",
    image: productJeans,
    price: 2499,
    size: "32",
    color: "Blue",
    quantity: 1,
  },
];

const Cart = () => {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal >= 999 ? 0 : 99;
  const discount = 0;
  const total = subtotal + shipping - discount;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <p className="text-muted-foreground">
            Add some products to get started!
          </p>
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
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-lg border border-border p-4 md:p-6"
              >
                <div className="flex gap-4">
                  <Link
                    to={`/product/${item.id}`}
                    className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-4 mb-2">
                      <Link to={`/product/${item.id}`}>
                        <h3 className="font-semibold hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <Button variant="ghost" size="icon" className="flex-shrink-0">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1 mb-3">
                      <p>Size: {item.size}</p>
                      <p>Color: {item.color}</p>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          -
                        </Button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          +
                        </Button>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="text-primary">
                          <Heart className="h-4 w-4 mr-2" />
                          Move to Wishlist
                        </Button>
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </div>
                          {item.originalPrice && (
                            <div className="text-sm text-muted-foreground line-through">
                              ₹{(item.originalPrice * item.quantity).toLocaleString()}
                            </div>
                          )}
                        </div>
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
                {discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                {subtotal < 999 && (
                  <p className="text-sm text-muted-foreground">
                    Add ₹{(999 - subtotal).toLocaleString()} more for FREE shipping
                  </p>
                )}
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

              <Link to="/products">
                <Button variant="outline" size="lg" className="w-full">
                  Continue Shopping
                </Button>
              </Link>

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
