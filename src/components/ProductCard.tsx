import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  category: string;
  isNew?: boolean;
}

export const ProductCard = ({
  id,
  name,
  image,
  price,
  originalPrice,
  discount,
  rating = 0,
  category,
  isNew,
}: ProductCardProps) => {
  return (
    <div className="group relative bg-card rounded-lg overflow-hidden border border-border hover:shadow-card-hover transition-all duration-300">
      {/* Image Container */}
      <Link to={`/product/${id}`} className="block relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {isNew && (
            <Badge className="bg-primary text-primary-foreground shadow-gold">
              NEW
            </Badge>
          )}
          {discount && discount > 0 && (
            <Badge variant="destructive">
              {discount}% OFF
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </Link>

      {/* Product Info */}
      <div className="p-4 space-y-2">
        <div className="text-xs text-muted-foreground uppercase tracking-wide">
          {category}
        </div>
        
        <Link to={`/product/${id}`}>
          <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-primary text-primary" />
            <span className="text-xs font-medium">{rating.toFixed(1)}</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">₹{price.toLocaleString()}</span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
