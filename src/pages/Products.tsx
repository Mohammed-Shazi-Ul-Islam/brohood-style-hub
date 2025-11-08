import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, SlidersHorizontal, Loader2 } from "lucide-react";
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
import { useProducts, useCategories } from "@/hooks/useProducts";
import { ProductFilters } from "@/types/database";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("created_at");
  const [currentPage, setCurrentPage] = useState(1);

  // Build filters object
  const filters: ProductFilters = {
    price_min: priceRange[0],
    price_max: priceRange[1],
    search: searchParams.get('search') || undefined,
  };

  // Add category filter if selected
  if (selectedCategories.length > 0) {
    // Find category ID from slug
    const categorySlug = selectedCategories[0];
    const category = categories.find(c => c.slug === categorySlug);
    if (category) {
      filters.category_id = category.id;
    }
  }

  // Add category from URL params
  const categoryFromUrl = searchParams.get('category');
  if (categoryFromUrl && selectedCategories.length === 0) {
    const category = categories.find(c => c.slug === categoryFromUrl);
    if (category) {
      filters.category_id = category.id;
    }
  }

  // Fetch data
  const { products, loading, error, total } = useProducts({
    filters,
    pagination: { page: currentPage, limit: 12 },
    sortBy
  });

  const { categories, loading: categoriesLoading } = useCategories();

  // Update selected categories when URL changes
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && !selectedCategories.includes(categoryFromUrl)) {
      setSelectedCategories([categoryFromUrl]);
    }
  }, [searchParams]);

  // Calculate total pages
  const totalPages = Math.ceil(total / 12);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedDiscounts([]);
    setSelectedRatings([]);
    setPriceRange([0, 5000]);
    setSortBy("relevance");
  };

  // Toggle filter selections
  const toggleCategory = (categorySlug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categorySlug) ? prev.filter((c) => c !== categorySlug) : [...prev, categorySlug]
    );
    setCurrentPage(1); // Reset to first page when filters change
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleDiscount = (discount: string) => {
    setSelectedDiscounts((prev) =>
      prev.includes(discount) ? prev.filter((d) => d !== discount) : [...prev, discount]
    );
  };

  const toggleRating = (rating: string) => {
    setSelectedRatings((prev) =>
      prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]
    );
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-black">All Products</h1>
            <p className="text-gray-600">
              {loading ? 'Loading...' : `Showing ${products.length} of ${total} products`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
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
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2 text-black">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </h3>
                <Button variant="link" size="sm" className="text-black hover:text-gray-600" onClick={clearAllFilters}>
                  Clear All
                </Button>
              </div>

              {/* Category Filter */}
              <div className="space-y-3">
                <h4 className="font-medium text-black">Category</h4>
                <div className="space-y-2">
                  {categoriesLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="h-5 bg-gray-200 animate-pulse rounded" />
                    ))
                  ) : categories.length === 0 ? (
                    <p className="text-sm text-gray-500">No categories available</p>
                  ) : (
                    categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={category.slug} 
                          checked={selectedCategories.includes(category.slug)}
                          onCheckedChange={() => toggleCategory(category.slug)}
                        />
                        <Label
                          htmlFor={category.slug}
                          className="text-sm cursor-pointer text-gray-700 hover:text-black"
                        >
                          {category.name}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <h4 className="font-medium text-black">Price Range</h4>
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
                <h4 className="font-medium text-black">Size</h4>
                <div className="grid grid-cols-4 gap-2">
                  {["S", "M", "L", "XL", "XXL"].map((size) => (
                    <Button
                      key={size}
                      variant={selectedSizes.includes(size) ? "default" : "outline"}
                      size="sm"
                      className="h-10"
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Discount Filter */}
              <div className="space-y-3">
                <h4 className="font-medium text-black">Discount</h4>
                <div className="space-y-2">
                  {["10% and above", "20% and above", "30% and above", "50% and above"].map(
                    (discount) => (
                      <div key={discount} className="flex items-center space-x-2">
                        <Checkbox 
                          id={discount}
                          checked={selectedDiscounts.includes(discount)}
                          onCheckedChange={() => toggleDiscount(discount)}
                        />
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
                <h4 className="font-medium text-black">Customer Rating</h4>
                <div className="space-y-2">
                  {["4★ & above", "3★ & above", "2★ & above"].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <Checkbox 
                        id={rating}
                        checked={selectedRatings.includes(rating)}
                        onCheckedChange={() => toggleRating(rating)}
                      />
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
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="bg-card rounded-lg overflow-hidden border border-border">
                    <div className="aspect-[3/4] bg-muted animate-pulse" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-muted animate-pulse rounded" />
                      <div className="h-4 bg-muted animate-pulse rounded" />
                      <div className="h-5 bg-muted animate-pulse rounded w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-xl text-red-600 mb-4">Error: {error}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground mb-4">No products found</p>
                <Button onClick={clearAllFilters}>Clear Filters</Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        className="w-10"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
