import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ProductWithDetails } from "@/types/database";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";


interface ProductCardProps {
  product: ProductWithDetails;
}

// Helper function to calculate discount percentage
const calculateDiscount = (price: number, originalPrice?: number) => {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

// Helper function to get primary image
const getPrimaryImage = (product: ProductWithDetails) => {
  const primaryImage = product.images?.find(img => img.is_primary);
  return primaryImage?.image_url || product.images?.[0]?.image_url || '/placeholder-product.jpg';
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const discount = calculateDiscount(product.price, product.original_price || undefined);
  const primaryImage = getPrimaryImage(product);
  const isNew = product.created_at && new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // New if created within 30 days
  
  const [showSizeDialog, setShowSizeDialog] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [sizeStock, setSizeStock] = useState<Record<string, number>>({});
  const [loadingStock, setLoadingStock] = useState(false);

  // Fetch size stock when dialog opens
  useEffect(() => {
    if (showSizeDialog) {
      fetchSizeStock();
    }
  }, [showSizeDialog]);

  const fetchSizeStock = async () => {
    setLoadingStock(true);
    try {
      const { data: variants, error } = await supabase
        .from('product_variants')
        .select(`
          size,
          inventory (
            quantity,
            reserved_quantity
          )
        `)
        .eq('product_id', product.id);

      if (error) throw error;

      const stockMap: Record<string, number> = {};
      variants?.forEach((variant: any) => {
        const available = (variant.inventory?.[0]?.quantity || 0) - (variant.inventory?.[0]?.reserved_quantity || 0);
        stockMap[variant.size] = available;
      });

      setSizeStock(stockMap);
    } catch (error) {
      console.error('Error fetching stock:', error);
      toast.error('Failed to load size availability');
    } finally {
      setLoadingStock(false);
    }
  };

  const handleBuyNowClick = () => {
    setShowSizeDialog(true);
  };

  const handleSizeSelect = (size: string) => {
    if (sizeStock[size] > 0) {
      setSelectedSize(size);
    }
  };

  const handleProceedToCheckout = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    localStorage.setItem(
      "checkoutItem",
      JSON.stringify({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.image_url,
        quantity: 1,
        size: selectedSize,
      })
    );
    navigate('/checkout');
  };

  return (
    <>
      <div className="group relative bg-white overflow-hidden border hover:shadow-lg transition-all duration-300">
        <Link to={`/product/${product.slug}`} className="block relative aspect-[4/5] bg-gray-100">
          <img src={getPrimaryImage(product)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        </Link>

        <div className="p-3 sm:p-4">
          <h3 className="font-medium text-black text-sm sm:text-base line-clamp-2 mb-1">{product.name}</h3>
          <p className="text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3">₹{product.price.toLocaleString()}</p>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              size="sm"
              className="flex-1 bg-black hover:bg-gray-800 text-white text-xs sm:text-sm h-8 sm:h-9"
              onClick={() =>
                addToCart({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: getPrimaryImage(product),
                  quantity: 1,
                })
              }
            >
              Add to Cart
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-gold hover:bg-gold-dark text-black text-xs sm:text-sm h-8 sm:h-9"
              onClick={handleBuyNowClick}
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>

      {/* Size Selection Dialog */}
      <Dialog open={showSizeDialog} onOpenChange={setShowSizeDialog}>
        <DialogContent className="sm:max-w-md max-w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Select Size</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Choose your size to proceed with purchase
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4">
            {/* Product Info */}
            <div className="flex gap-2 sm:gap-3 pb-3 sm:pb-4 border-b">
              <img
                src={primaryImage}
                alt={product.name}
                className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-xs sm:text-sm line-clamp-2">{product.name}</h4>
                <p className="text-xs sm:text-sm text-gray-600">₹{product.price.toLocaleString()}</p>
              </div>
            </div>

            {/* Size Selection */}
            {loadingStock ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-2 block">Select Size:</label>
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {['S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                      const stock = sizeStock[size] || 0;
                      const isAvailable = stock > 0;
                      const isSelected = selectedSize === size;

                      return (
                        <button
                          key={size}
                          onClick={() => handleSizeSelect(size)}
                          disabled={!isAvailable}
                          className={cn(
                            "relative py-2.5 sm:py-3 px-1 sm:px-2 border-2 rounded-lg text-xs sm:text-sm font-medium transition-all",
                            isSelected && "border-black bg-black text-white",
                            !isSelected && isAvailable && "border-gray-300 hover:border-black",
                            !isAvailable && "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                          )}
                        >
                          {size}
                          {!isAvailable && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[10px] sm:text-xs">Out</span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Stock Info */}
                {selectedSize && sizeStock[selectedSize] <= 10 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 sm:p-3">
                    <p className="text-xs sm:text-sm text-orange-800">
                      ⚠️ Hurry up! Only {sizeStock[selectedSize]} left in stock
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
                    onClick={() => setShowSizeDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-gold hover:bg-gold-dark text-black text-xs sm:text-sm h-9 sm:h-10"
                    onClick={handleProceedToCheckout}
                    disabled={!selectedSize}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};