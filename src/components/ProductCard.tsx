import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ProductWithDetails } from "@/types/database";

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
  const discount = calculateDiscount(product.price, product.original_price || undefined);
  const primaryImage = getPrimaryImage(product);
  const isNew = product.created_at && new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // New if created within 30 days
  return (
    <div className="group relative bg-white overflow-hidden border-0 hover:-translate-y-1 transition-all duration-300 animate-fade-in hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
      {/* Image Container */}
      <Link to={`/product/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-100">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-0 flex flex-col gap-2">
          {isNew && (
            <div className="bg-gold text-black font-semibold px-4 py-1.5 text-xs tracking-wider">
              NEW ARRIVAL
            </div>
          )}
          {discount > 0 && (
            <div className="bg-black text-white font-semibold px-4 py-1.5 text-xs tracking-wider">
              SAVE {discount}%
            </div>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-white hover:bg-white opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full h-10 w-10 shadow-lg"
        >
          <Heart className="h-4 w-4 text-black" />
        </Button>
      </Link>

      {/* Product Info */}
      <div className="p-6 space-y-2 bg-white">
        <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-medium">
          {product.category?.name || 'Product'}
        </div>
        
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-medium text-sm line-clamp-2 text-black hover:text-gray-600 transition-colors duration-200 leading-relaxed min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-3 pt-2">
          <span className="text-lg font-semibold text-black tracking-tight">₹{product.price.toLocaleString()}</span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-sm text-gray-400 line-through">
              ₹{product.original_price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
