import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Sparkles, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { useFeaturedProducts, useCategories } from "@/hooks/useProducts";
import heroBanner from "@/assets/hero-banner.jpg";

const Home = () => {
  const { products: featuredProducts, loading: productsLoading } = useFeaturedProducts(4);
  const { categories, loading: categoriesLoading } = useCategories();
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] bg-black overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBanner}
            alt="Bro Hood Fashion"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-3xl space-y-8 animate-fade-in">
            <div className="space-y-4">
              <p className="text-gold text-sm uppercase tracking-[0.3em] font-medium">Premium Men's Fashion</p>
              <h1 className="text-6xl md:text-8xl font-serif font-bold leading-[1.1] text-white">
                Redefine
                <span className="block text-gold">Elegance</span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-xl">
              Curated collections for the modern gentleman who values quality, style, and sophistication.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/products">
                <Button size="lg" className="text-base bg-gold hover:bg-gold-dark text-black font-semibold px-8 py-6 h-auto rounded-none tracking-wide">
                  EXPLORE COLLECTION
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/products?featured=true">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-black backdrop-blur-sm px-8 py-6 h-auto rounded-none tracking-wide font-semibold">
                  NEW ARRIVALS
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="flex flex-col items-center text-center gap-3 group">
              <div className="p-4 bg-gray-50 group-hover:bg-gold/10 transition-colors duration-300">
                <Truck className="h-8 w-8 text-black" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-black mb-1">Complimentary Shipping</h3>
                <p className="text-sm text-gray-600">On all orders above ₹999</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3 group">
              <div className="p-4 bg-gray-50 group-hover:bg-gold/10 transition-colors duration-300">
                <Sparkles className="h-8 w-8 text-black" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-black mb-1">Premium Craftsmanship</h3>
                <p className="text-sm text-gray-600">Finest materials & attention to detail</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3 group">
              <div className="p-4 bg-gray-50 group-hover:bg-gold/10 transition-colors duration-300">
                <ShoppingBag className="h-8 w-8 text-black" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-black mb-1">Effortless Returns</h3>
                <p className="text-sm text-gray-600">7-day hassle-free returns</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-gold text-sm uppercase tracking-[0.3em] font-medium mb-4">Discover</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-black">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Curated collections for every occasion
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categoriesLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-64 bg-gray-200 animate-pulse" />
              ))
            ) : (
              categories.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.slug}`}
                  className="group relative h-64 overflow-hidden bg-gray-100 hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)] transition-all duration-500"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/70 transition-all duration-500" />
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-6 text-white">
                    <h3 className="text-2xl font-serif font-bold mb-2 group-hover:text-gold transition-colors duration-300">
                      {category.name}
                    </h3>
                    <div className="w-12 h-0.5 bg-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-16">
            <div>
              <p className="text-gold text-sm uppercase tracking-[0.3em] font-medium mb-4">Curated Selection</p>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-black">Featured Collection</h2>
            </div>
            <Link to="/products">
              <Button variant="outline" className="text-black border-2 border-black hover:bg-black hover:text-white transition-all duration-300 px-6 py-6 h-auto rounded-none tracking-wide font-semibold">
                VIEW ALL
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {productsLoading ? (
              // Loading skeleton for products
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-card rounded-lg overflow-hidden border border-border">
                  <div className="aspect-[3/4] bg-muted animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-muted animate-pulse rounded" />
                    <div className="h-4 bg-muted animate-pulse rounded" />
                    <div className="h-5 bg-muted animate-pulse rounded w-20" />
                  </div>
                </div>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No featured products available</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6 text-secondary-foreground">
            <h2 className="text-4xl md:text-5xl font-bold">
              Join the Brotherhood
            </h2>
            <p className="text-lg md:text-xl opacity-90">
              Subscribe to get exclusive offers, style tips, and early access to new collections
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-md border border-secondary-foreground/20 bg-secondary-foreground/10 text-secondary-foreground placeholder:text-secondary-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button size="lg" variant="premium">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
