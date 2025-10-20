import { useState } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import productTshirt from "@/assets/product-tshirt-1.jpg";
import productJeans from "@/assets/product-jeans-1.jpg";
import productShirt from "@/assets/product-shirt-1.jpg";
import productHoodie from "@/assets/product-hoodie-1.jpg";

// Mock products - expanded
const allProducts = [
  {
    id: "1",
    name: "Premium Black T-Shirt",
    image: productTshirt,
    price: 999,
    originalPrice: 1499,
    discount: 33,
    rating: 4.5,
    category: "T-Shirts",
    isNew: true,
  },
  {
    id: "2",
    name: "Classic Blue Denim Jeans",
    image: productJeans,
    price: 2499,
    originalPrice: 3499,
    discount: 29,
    rating: 4.7,
    category: "Jeans",
  },
  {
    id: "3",
    name: "Elegant White Casual Shirt",
    image: productShirt,
    price: 1799,
    originalPrice: 2299,
    discount: 22,
    rating: 4.6,
    category: "Shirts",
    isNew: true,
  },
  {
    id: "4",
    name: "Modern Black Hoodie",
    image: productHoodie,
    price: 1999,
    originalPrice: 2999,
    discount: 33,
    rating: 4.8,
    category: "Hoodies",
  },
  {
    id: "5",
    name: "Classic Black T-Shirt",
    image: productTshirt,
    price: 899,
    rating: 4.3,
    category: "T-Shirts",
  },
  {
    id: "6",
    name: "Dark Blue Jeans",
    image: productJeans,
    price: 2199,
    rating: 4.4,
    category: "Jeans",
  },
];

const Products = () => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">All Products</h1>
            <p className="text-muted-foreground">Showing {allProducts.length} products</p>
          </div>
          <div className="flex items-center gap-4">
            <Select defaultValue="relevance">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="discount">Discount</SelectItem>
                <SelectItem value="rating">Customer Rating</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside
            className={`lg:w-64 space-y-6 ${
              filtersOpen ? "block" : "hidden lg:block"
            }`}
          >
            <div className="bg-card p-6 rounded-lg border border-border space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </h3>
                <Button variant="link" size="sm" className="text-primary">
                  Clear All
                </Button>
              </div>

              {/* Category Filter */}
              <div className="space-y-3">
                <h4 className="font-medium">Category</h4>
                <div className="space-y-2">
                  {["All", "Shirts", "T-Shirts", "Jeans", "Hoodies", "Trousers"].map(
                    (category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox id={category} />
                        <Label
                          htmlFor={category}
                          className="text-sm cursor-pointer"
                        >
                          {category}
                        </Label>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <h4 className="font-medium">Price Range</h4>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={5000}
                  step={100}
                  className="mt-2"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>

              {/* Size Filter */}
              <div className="space-y-3">
                <h4 className="font-medium">Size</h4>
                <div className="grid grid-cols-4 gap-2">
                  {["S", "M", "L", "XL", "XXL"].map((size) => (
                    <Button
                      key={size}
                      variant="outline"
                      size="sm"
                      className="h-10"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Discount Filter */}
              <div className="space-y-3">
                <h4 className="font-medium">Discount</h4>
                <div className="space-y-2">
                  {["10% and above", "20% and above", "30% and above", "50% and above"].map(
                    (discount) => (
                      <div key={discount} className="flex items-center space-x-2">
                        <Checkbox id={discount} />
                        <Label
                          htmlFor={discount}
                          className="text-sm cursor-pointer"
                        >
                          {discount}
                        </Label>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-3">
                <h4 className="font-medium">Customer Rating</h4>
                <div className="space-y-2">
                  {["4★ & above", "3★ & above", "2★ & above"].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <Checkbox id={rating} />
                      <Label htmlFor={rating} className="text-sm cursor-pointer">
                        {rating}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {allProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Previous
                </Button>
                {[1, 2, 3, 4, 5].map((page) => (
                  <Button
                    key={page}
                    variant={page === 1 ? "default" : "outline"}
                    size="sm"
                    className="w-10"
                  >
                    {page}
                  </Button>
                ))}
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
