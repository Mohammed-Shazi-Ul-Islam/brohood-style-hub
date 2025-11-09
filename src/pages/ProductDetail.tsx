import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Truck,
  RefreshCcw,
  Shield,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { ProductWithDetails } from "@/types/database";
import { useCart } from "@/context/CartContext"; // ✅ correct import

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart(); // ✅ use global cart context

  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          variants:product_variants(*),
          images:product_images(*),
          inventory(*)
        `)
        .eq("slug", id)
        .eq("status", "active")
        .single();

      if (productError || !productData) {
        setError("Product not found");
        return;
      }

      setProduct(productData as ProductWithDetails);
      const primaryImage = productData.images?.find((img: any) => img.is_primary);
      setMainImage(
        primaryImage?.image_url ||
          productData.images?.[0]?.image_url ||
          "/placeholder-product.jpg"
      );

      if (productData.category_id) {
        const { data: related } = await supabase
          .from("products")
          .select(`
            *,
            category:categories(*),
            images:product_images(*)
          `)
          .eq("category_id", productData.category_id)
          .eq("status", "active")
          .neq("id", productData.id)
          .limit(4);
        setRelatedProducts((related as ProductWithDetails[]) || []);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = () => {
    if (!product?.original_price || !product?.price) return 0;
    return Math.round(
      ((product.original_price - product.price) / product.original_price) * 100
    );
  };

  const handleAddToCart = () => {
    if (!product) return;
    setAddingToCart(true);
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.image_url || "/placeholder-product.jpg",
      quantity: quantity,
    });
    setAddingToCart(false);
    alert("Added to cart!");
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.image_url || "/placeholder-product.jpg",
      quantity: quantity,
    });
    navigate("/checkout");
  };

  const handleAddToWishlist = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setAddingToWishlist(true);
    try {
      const { data: existing } = await supabase
        .from("wishlist_items")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("product_id", product?.id)
        .maybeSingle();

      if (existing) {
        await supabase.from("wishlist_items").delete().eq("id", existing.id);
        alert("Removed from wishlist");
      } else {
        await supabase
          .from("wishlist_items")
          .insert({ user_id: session.user.id, product_id: product?.id });
        alert("Added to wishlist!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update wishlist");
    } finally {
      setAddingToWishlist(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );

  if (error || !product)
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold mb-3">Product Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "The product you’re looking for does not exist."}
          </p>
          <Button onClick={() => navigate("/products")}>Browse Products</Button>
        </div>
      </div>
    );

  const discount = calculateDiscount();

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-black">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/products" className="hover:text-black">Products</Link>
          <ChevronRight className="h-4 w-4" />
          {product.category && (
            <>
              <span className="hover:text-black">{product.category.name}</span>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
          <span className="text-black font-medium">{product.name}</span>
        </div>
      </div>

      {/* Product Section */}
      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div>
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden relative">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-red-500 text-white px-4 py-1">
                Save {discount}%
              </Badge>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold">{product.name}</h1>
          <p className="text-gray-600">{product.description}</p>

          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-black">
              ₹{product.price.toLocaleString()}
            </span>
            {product.original_price && (
              <span className="text-gray-400 line-through">
                ₹{product.original_price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              size="lg"
              className="flex-1 h-14 bg-black text-white hover:bg-gray-800"
              onClick={handleAddToCart}
              disabled={addingToCart}
            >
              {addingToCart ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                </>
              )}
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="h-14 w-14"
              onClick={handleAddToWishlist}
              disabled={addingToWishlist}
            >
              {addingToWishlist ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Heart className="h-5 w-5" />
              )}
            </Button>
          </div>

          <Button
            size="lg"
            variant="secondary"
            className="w-full h-14 text-lg mt-3"
            onClick={handleBuyNow}
          >
            Buy Now
          </Button>

          {/* Features */}
          <div className="border-t border-gray-100 pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <Truck className="h-6 w-6 text-black" />
              <span>Free Delivery on orders above ₹999</span>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCcw className="h-6 w-6 text-black" />
              <span>7-Day Return Policy</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-black" />
              <span>Secure Checkout with Razorpay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
