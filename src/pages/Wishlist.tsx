import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("wishlist_items")
        .select(`
          *,
          product:products(
            *,
            images:product_images(*)
          )
        `)
        .eq("user_id", sessionData.session.user.id);

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      toast.success("Removed from wishlist");
      fetchWishlist();
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove item");
    }
  };

  const moveToCart = (item: any) => {
    addToCart({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.images?.[0]?.image_url || "/placeholder.jpg",
      quantity: 1,
    });
    removeFromWishlist(item.id);
    toast.success("Moved to cart!");
  };

  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Package className="h-12 w-12 animate-spin text-gold mx-auto mb-4" />
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">My Wishlist</h1>
              <p className="text-gray-600">
                {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved
              </p>
            </div>
            {wishlistItems.length > 0 && (
              <Link to="/products">
                <Button variant="outline" className="hidden sm:flex">
                  Continue Shopping
                </Button>
              </Link>
            )}
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <Card className="text-center py-16 border-2 border-dashed">
            <CardContent>
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-serif font-bold mb-3">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Save your favorite items here and never lose track of what you love
              </p>
              <Link to="/products">
                <Button size="lg" className="bg-black hover:bg-gray-800">
                  Explore Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {wishlistItems.map((item) => {
              const discount = item.product.original_price
                ? calculateDiscount(item.product.original_price, item.product.price)
                : 0;

              return (
                <Card
                  key={item.id}
                  className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0"
                >
                  <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                    <Link to={`/product/${item.product.slug}`}>
                      <img
                        src={item.product.images?.[0]?.image_url || "/placeholder.jpg"}
                        alt={item.product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    
                    {/* Discount Badge */}
                    {discount > 0 && (
                      <Badge className="absolute top-3 left-3 bg-red-500 text-white border-0">
                        {discount}% OFF
                      </Badge>
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-all duration-300 opacity-0 group-hover:opacity-100"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>

                    {/* Quick Add to Cart Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <Button
                        onClick={() => moveToCart(item)}
                        className="w-full bg-white text-black hover:bg-gray-100"
                        size="sm"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <Link to={`/product/${item.product.slug}`}>
                      <h3 className="font-semibold mb-2 line-clamp-2 hover:text-gold transition-colors">
                        {item.product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold">₹{item.product.price.toLocaleString()}</span>
                      {item.product.original_price && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{item.product.original_price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Mobile Add to Cart Button */}
                    <Button
                      onClick={() => moveToCart(item)}
                      className="w-full bg-black hover:bg-gray-800 sm:hidden"
                      size="sm"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        {wishlistItems.length > 0 && (
          <div className="mt-12 text-center">
            <Link to="/products">
              <Button variant="outline" size="lg" className="sm:hidden">
                Continue Shopping
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
