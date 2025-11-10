import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ProductWithDetails } from "@/types/database";
import { useCart } from "@/context/CartContext";


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
  const discount = calculateDiscount(product.price, product.original_price || undefined);
  const primaryImage = getPrimaryImage(product);
  const isNew = product.created_at && new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // New if created within 30 days
  const handleBuyNow = (product: ProductWithDetails) => {
    localStorage.setItem(
      "checkoutItem",
      JSON.stringify({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.image_url,
        quantity: 1,
      })
    );
    window.location.href = "/checkout";
  };

  return (
    <div className="group relative bg-white overflow-hidden border hover:shadow-lg transition-all duration-300">
      <Link to={`/product/${product.slug}`} className="block relative aspect-[4/5] bg-gray-100">
        <img src={getPrimaryImage(product)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
      </Link>

      <div className="p-4">
        <h3 className="font-medium text-black">{product.name}</h3>
        <p className="text-gray-500 text-sm">₹{product.price.toLocaleString()}</p>

        <div className="flex gap-2 mt-3">
          <Button
            className="flex-1 bg-black hover:bg-gray-800 text-white"
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
            className="flex-1 bg-gold hover:bg-gold-dark text-black"
            onClick={() => handleBuyNow(product)}
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
};