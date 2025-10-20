import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Sparkles, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import heroBanner from "@/assets/hero-banner.jpg";
import productTshirt from "@/assets/product-tshirt-1.jpg";
import productJeans from "@/assets/product-jeans-1.jpg";
import productShirt from "@/assets/product-shirt-1.jpg";
import productHoodie from "@/assets/product-hoodie-1.jpg";

// Mock product data
const featuredProducts = [
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
];

const categories = [
  { name: "Shirts", count: 45, link: "/products?category=shirts" },
  { name: "T-Shirts", count: 78, link: "/products?category=t-shirts" },
  { name: "Jeans", count: 32, link: "/products?category=jeans" },
  { name: "Hoodies", count: 24, link: "/products?category=hoodies" },
];

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[80vh] bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBanner}
            alt="Bro Hood Fashion"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl space-y-6 text-secondary-foreground">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Elevate Your
              <span className="block text-primary">Style</span>
            </h1>
            <p className="text-lg md:text-xl text-secondary-foreground/90">
              Discover premium men's fashion designed for the modern gentleman. 
              Quality meets style in every piece.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button size="lg" variant="premium" className="text-base">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/products?sale=true">
                <Button size="lg" variant="outline" className="border-secondary-foreground text-secondary-foreground hover:bg-secondary-foreground/10">
                  View Sale
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-8 bg-muted/50 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Trending Styles</h3>
                <p className="text-sm text-muted-foreground">Latest fashion trends</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Premium Quality</h3>
                <p className="text-sm text-muted-foreground">Best materials & craftsmanship</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Free Shipping</h3>
                <p className="text-sm text-muted-foreground">On orders above ₹999</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our curated collections designed to elevate your wardrobe
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.link}
                className="group relative h-48 rounded-lg overflow-hidden bg-muted hover:shadow-card-hover transition-all"
              >
                <div className="absolute inset-0 bg-gradient-dark opacity-40 group-hover:opacity-30 transition-opacity" />
                <div className="relative h-full flex flex-col items-center justify-center text-white">
                  <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                  <p className="text-sm opacity-90">{category.count} Products</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Collection</h2>
              <p className="text-muted-foreground">Handpicked styles just for you</p>
            </div>
            <Link to="/products">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
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
