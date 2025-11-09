import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Sparkles, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFeaturedProducts, useCategories } from "@/hooks/useProducts";
import heroBanner from "@/assets/hero-banner.jpg";

const Home = () => {
  const { products: featuredProducts, loading: productsLoading } = useFeaturedProducts(4);
  const { categories, loading: categoriesLoading } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ Filter only "Men" and "Women" categories
  const mainCategories = categories.filter(
    (c) => c.slug === "men" || c.slug === "women"
  );

  // ✅ Detect neutral categories (like T-Shirts, Jeans, etc.)
  const neutralCategories = [
    "t-shirts",
    "shirts",
    "jeans",
    "jackets",
    "trousers",
    "shorts",
    "hoodies",
    "footwear",
    "accessories",
  ];
  const categoryFromUrl = searchParams.get("category");
  const isNeutralCategory =
    categoryFromUrl && neutralCategories.includes(categoryFromUrl.toLowerCase());

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
              <p className="text-gold text-sm uppercase tracking-[0.3em] font-medium">
                Premium Men's Fashion
              </p>
              <h1 className="text-6xl md:text-8xl font-serif font-bold leading-[1.1] text-white">
                Redefine <span className="block text-gold">Elegance</span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-xl">
              Curated collections for the modern gentleman who values quality,
              style, and sophistication.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/products">
                <Button
                  size="lg"
                  className="text-base bg-gold hover:bg-gold-dark text-black font-semibold px-8 py-6 h-auto rounded-none tracking-wide"
                >
                  EXPLORE COLLECTION
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/products?featured=true">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-black backdrop-blur-sm px-8 py-6 h-auto rounded-none tracking-wide font-semibold"
                >
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
                <h3 className="font-serif text-lg font-semibold text-black mb-1">
                  Complimentary Shipping
                </h3>
                <p className="text-sm text-gray-600">On all orders above ₹999</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3 group">
              <div className="p-4 bg-gray-50 group-hover:bg-gold/10 transition-colors duration-300">
                <Sparkles className="h-8 w-8 text-black" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-black mb-1">
                  Premium Craftsmanship
                </h3>
                <p className="text-sm text-gray-600">
                  Finest materials & attention to detail
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3 group">
              <div className="p-4 bg-gray-50 group-hover:bg-gold/10 transition-colors duration-300">
                <ShoppingBag className="h-8 w-8 text-black" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-black mb-1">
                  Effortless Returns
                </h3>
                <p className="text-sm text-gray-600">
                  7-day hassle-free returns
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Gender Selection Prompt if coming from neutral category */}
      {isNeutralCategory && (
        <section className="py-20 bg-gray-50 border-t border-gray-100">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-serif font-bold mb-6 text-gray-900">
              Choose Your Collection
            </h2>
            <p className="text-gray-600 mb-12 text-lg">
              Are you shopping for the Men’s or Women’s {categoryFromUrl}?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* For Men */}
              <div
                onClick={() =>
                  setSearchParams({ category: `mens-${categoryFromUrl}` })
                }
                className="group relative h-80 rounded-lg overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <img
                  src="https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1080&q=80"
                  alt="For Men"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-500" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <h3 className="text-3xl font-serif font-bold mb-2">
                    Shop Men’s {categoryFromUrl}
                  </h3>
                  <div className="w-12 h-0.5 bg-gold group-hover:scale-x-100 transform scale-x-0 transition-transform duration-500" />
                </div>
              </div>

              {/* For Women */}
              <div
                onClick={() =>
                  setSearchParams({ category: `womens-${categoryFromUrl}` })
                }
                className="group relative h-80 rounded-lg overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <img
                  src="https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&cs=tinysrgb&w=1080"
                  alt="For Women"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-500" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <h3 className="text-3xl font-serif font-bold mb-2">
                    Shop Women’s {categoryFromUrl}
                  </h3>
                  <div className="w-12 h-0.5 bg-gold group-hover:scale-x-100 transform scale-x-0 transition-transform duration-500" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Shop by Category */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-gold text-sm uppercase tracking-[0.3em] font-medium mb-4">
              Discover
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-black">
              Shop by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Curated collections for every occasion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoriesLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-lg" />
              ))
            ) : (
              mainCategories.map((category) => {
                const fallbackImage =
                  category.slug === "men"
                    ? "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1080&q=80"
                    : "https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&cs=tinysrgb&w=1080";

                return (
                  <Link
                    key={category.id}
                    to={`/products?category=${category.slug}`}
                    className="group relative h-80 overflow-hidden bg-gray-100 hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)] transition-all duration-500 rounded-lg"
                  >
                    <img
                      src={category.image_url || fallbackImage}
                      alt={category.name}
                      className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        e.currentTarget.src = fallbackImage;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/70 transition-all duration-500" />
                    <div className="absolute inset-0 flex flex-col items-center justify-end p-6 text-white">
                      <h3 className="text-3xl font-serif font-bold mb-2 group-hover:text-gold transition-colors duration-300">
                        For {category.name}
                      </h3>
                      <div className="w-12 h-0.5 bg-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
