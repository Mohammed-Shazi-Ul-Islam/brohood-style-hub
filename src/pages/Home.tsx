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
<<<<<<< HEAD
      <section className="relative h-[85vh] bg-black overflow-hidden">
=======
      <section className="relative h-[85vh] md:h-[90vh] bg-gradient-hero overflow-hidden">
>>>>>>> f556f8f6e1a0362a29760b00b0cabc63e32d896d
        <div className="absolute inset-0">
          <img
            src={heroBanner}
            alt="Bro Hood Fashion"
<<<<<<< HEAD
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
=======
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20" />
>>>>>>> f556f8f6e1a0362a29760b00b0cabc63e32d896d
        </div>
        
        {/* Animated accent elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl float" style={{ animationDelay: '1.5s' }} />
        
        <div className="relative container mx-auto px-4 h-full flex items-center">
<<<<<<< HEAD
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
=======
          <div className="max-w-3xl space-y-8 fade-in-up">
            <div className="inline-block px-4 py-2 bg-primary/10 backdrop-blur-sm rounded-full border border-primary/20 mb-4">
              <span className="text-primary font-semibold text-sm tracking-wide uppercase">Premium Collection 2024</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold leading-tight tracking-tight">
              <span className="text-foreground">Redefine</span>
              <span className="block text-gradient-gold mt-2">Elegance</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
              Experience luxury fashion crafted for the discerning gentleman. 
              Where timeless sophistication meets contemporary style.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/products">
                <Button size="lg" variant="premium" className="text-base hover-glow group">
                  Explore Collection
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/products?sale=true">
                <Button size="lg" variant="outline" className="text-base backdrop-blur-sm bg-background/50 hover:bg-background/80">
                  Limited Offers
>>>>>>> f556f8f6e1a0362a29760b00b0cabc63e32d896d
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features */}
<<<<<<< HEAD
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
=======
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-gold transition-all duration-500 hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-gradient-gold rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Trending Styles</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Stay ahead with the latest fashion trends curated by our experts</p>
                </div>
              </div>
            </div>
            <div className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-gold transition-all duration-500 hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-gradient-gold rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Premium Quality</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Handcrafted excellence with the finest materials and attention to detail</p>
                </div>
              </div>
            </div>
            <div className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-gold transition-all duration-500 hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-gradient-gold rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <ShoppingBag className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Free Shipping</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Complimentary delivery on all orders above ₹999 across India</p>
                </div>
>>>>>>> f556f8f6e1a0362a29760b00b0cabc63e32d896d
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
<<<<<<< HEAD
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
=======
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-4">
              <span className="text-primary font-semibold text-sm tracking-wide uppercase">Collections</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Discover curated collections that define modern luxury
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                to={category.link}
                className="group relative h-64 rounded-2xl overflow-hidden bg-gradient-premium hover:shadow-premium transition-all duration-500 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background/90 group-hover:to-background/70 transition-all duration-500" />
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative h-full flex flex-col items-center justify-end p-6 text-foreground">
                  <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-bold text-primary-foreground">{category.count}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">Explore Collection</p>
                </div>
              </Link>
            ))}
>>>>>>> f556f8f6e1a0362a29760b00b0cabc63e32d896d
          </div>
        </div>
      </section>

      {/* Featured Products */}
<<<<<<< HEAD
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
=======
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-4">
                <span className="text-primary font-semibold text-sm tracking-wide uppercase">Featured</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Signature Collection</h2>
              <p className="text-muted-foreground text-lg">Meticulously selected pieces that embody exceptional style and craftsmanship</p>
            </div>
            <Link to="/products">
              <Button variant="outline" size="lg" className="group hover:border-primary hover:text-primary">
                View All Collection
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
>>>>>>> f556f8f6e1a0362a29760b00b0cabc63e32d896d
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgyMTIsIDE3NSwgNTUsIDAuMSkiLz48L2c+PC9zdmc+')] opacity-20" />
        
        <div className="absolute top-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-block px-4 py-2 bg-primary/20 backdrop-blur-sm rounded-full border border-primary/30 mb-4">
              <span className="text-primary font-semibold text-sm tracking-wide uppercase">Exclusive Access</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
              Join the
              <span className="block text-gradient-gold mt-2">Brotherhood</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Unlock exclusive offers, insider style tips, and early access to limited editions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto pt-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-xl border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
              <Button size="lg" variant="premium" className="hover-glow whitespace-nowrap">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Join 50,000+ members worldwide</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
