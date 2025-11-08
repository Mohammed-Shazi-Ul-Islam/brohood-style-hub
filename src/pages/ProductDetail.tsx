import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Truck, RefreshCcw, Shield, Star, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { ProductWithDetails } from "@/types/database";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch product by slug
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          variants:product_variants(*),
          images:product_images(*),
          inventory(*)
        `)
        .eq('slug', id)
        .eq('status', 'active')
        .single();

      if (productError) {
        console.error('Error fetching product:', productError);
        setError('Product not found');
        return;
      }

      if (!productData) {
        setError('Product not found');
        return;
      }

      setProduct(productData as ProductWithDetails);
      
      // Set main image
      const primaryImage = productData.images?.find((img: any) => img.is_primary);
      setMainImage(primaryImage?.image_url || productData.images?.[0]?.image_url || '/placeholder-product.jpg');

      // Fetch related products from same category
      if (productData.category_id) {
        const { data: relatedData } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(*),
            images:product_images(*),
            inventory(*)
          `)
          .eq('category_id', productData.category_id)
          .eq('status', 'active')
          .neq('id', productData.id)
          .limit(4);

        if (relatedData) {
          setRelatedProducts(relatedData as ProductWithDetails[]);
        }
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = () => {
    if (!product?.original_price || !product?.price) return 0;
    if (product.original_price <= product.price) return 0;
    return Math.round(((product.original_price - product.price) / product.original_price) * 100);
  };

  const getTotalStock = () => {
    if (!product?.inventory) return 0;
    return product.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
  };

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  };

  const handleAddToCart = async () => {
    const session = await checkAuth();
    if (!session) {
      // Redirect to login
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!product) return;

    setAddingToCart(true);
    try {
      // Get or create cart item
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('product_id', product.id)
        .maybeSingle();

      if (existing) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new cart item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: session.user.id,
            product_id: product.id,
            variant_id: null, // Add variant support later
            quantity: quantity
          });

        if (error) throw error;
      }

      alert('Added to cart!');
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    const session = await checkAuth();
    if (!session) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!product) return;

    setAddingToWishlist(true);
    try {
      const { data: existing } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('product_id', product.id)
        .maybeSingle();

      if (existing) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlist_items')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;
        alert('Removed from wishlist');
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlist_items')
          .insert({
            user_id: session.user.id,
            product_id: product.id
          });

        if (error) throw error;
        alert('Added to wishlist!');
      }
    } catch (err: any) {
      console.error('Error updating wishlist:', err);
      alert('Failed to update wishlist');
    } finally {
      setAddingToWishlist(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
          <Button onClick={() => navigate('/products')}>
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount();
  const totalStock = getTotalStock();
  const sortedImages = product.images?.sort((a, b) => a.sort_order - b.sort_order) || [];

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/products" className="hover:text-black transition-colors">Products</Link>
            <ChevronRight className="h-4 w-4" />
            {product.category && (
              <>
                <span className="hover:text-black transition-colors">{product.category.name}</span>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
            <span className="text-black font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4 animate-slide-up">
            <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden group">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 text-sm font-semibold">
                  {discount}% OFF
                </Badge>
              )}
            </div>
            {sortedImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {sortedImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setMainImage(image.image_url)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                      mainImage === image.image_url
                        ? "border-black shadow-lg"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={image.alt_text || `${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div>
              {product.category && (
                <Badge variant="outline" className="mb-3">
                  {product.category.name}
                </Badge>
              )}
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                {product.name}
              </h1>
              {product.description && (
                <p className="text-gray-600 text-lg leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 py-4 border-y border-gray-100">
              <span className="text-4xl font-bold text-black">
                ₹{(product.price * quantity).toLocaleString()}
              </span>
              {quantity > 1 && (
                <span className="text-lg text-gray-500">
                  (₹{product.price.toLocaleString()} × {quantity})
                </span>
              )}
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-2xl text-gray-400 line-through">
                    ₹{(product.original_price * quantity).toLocaleString()}
                  </span>
                  <Badge className="bg-green-500 text-white px-3 py-1">
                    Save ₹{((product.original_price - product.price) * quantity).toLocaleString()}
                  </Badge>
                </>
              )}
            </div>

            {/* Size Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Select Size</h3>
                  <Button variant="link" size="sm" className="text-black">
                    Size Guide
                  </Button>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {product.variants.map((variant) => (
                    <Button
                      key={variant.id}
                      variant={selectedSize === variant.size ? "default" : "outline"}
                      onClick={() => setSelectedSize(variant.size || '')}
                      className="h-12 font-semibold transition-all duration-300 hover:scale-105"
                    >
                      {variant.size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-12 w-12 rounded-none hover:bg-gray-100"
                  >
                    -
                  </Button>
                  <span className="w-16 text-center font-bold text-lg">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.min(totalStock, quantity + 1))}
                    className="h-12 w-12 rounded-none hover:bg-gray-100"
                    disabled={quantity >= totalStock}
                  >
                    +
                  </Button>
                </div>
                <span className="text-sm text-gray-600">
                  {totalStock > 0 ? (
                    <span className={totalStock < 10 ? 'text-orange-600 font-medium' : ''}>
                      {totalStock} available
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">Out of stock</span>
                  )}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                size="lg" 
                className="flex-1 h-14 text-lg bg-black hover:bg-gray-800 transition-all duration-300 hover:scale-105"
                disabled={totalStock === 0 || addingToCart}
                onClick={handleAddToCart}
              >
                {addingToCart ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 w-14 transition-all duration-300 hover:scale-110"
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
              className="w-full h-14 text-lg transition-all duration-300 hover:scale-105"
              disabled={totalStock === 0 || addingToCart}
              onClick={async () => {
                await handleAddToCart();
                navigate('/cart');
              }}
            >
              Buy Now
            </Button>

            {/* Features */}
            <div className="border-t border-gray-100 pt-6 space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl transition-all duration-300 hover:bg-gray-100">
                <Truck className="h-6 w-6 text-black flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Free Delivery</h4>
                  <p className="text-sm text-gray-600">
                    On orders above ₹999
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl transition-all duration-300 hover:bg-gray-100">
                <RefreshCcw className="h-6 w-6 text-black flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">7 Days Return</h4>
                  <p className="text-sm text-gray-600">
                    Easy return & exchange policy
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl transition-all duration-300 hover:bg-gray-100">
                <Shield className="h-6 w-6 text-black flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Secure Payment</h4>
                  <p className="text-sm text-gray-600">
                    100% secure transactions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black px-6 py-4 text-lg font-semibold"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black px-6 py-4 text-lg font-semibold"
              >
                Details
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="py-8">
              <div className="prose max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {product.description || 'No description available.'}
                </p>
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-3">Tags:</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="px-4 py-2">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="details" className="py-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-lg mb-4">Product Information</h4>
                  <dl className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-gray-600">SKU</dt>
                      <dd className="font-medium">{product.id.slice(0, 8)}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-gray-600">Category</dt>
                      <dd className="font-medium">{product.category?.name || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-gray-600">Stock</dt>
                      <dd className="font-medium">{totalStock} units</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
