import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ShoppingBag, Truck } from "lucide-react";
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
      <section className="relative h-[70vh] sm:h-[80vh] lg:h-[85vh] bg-black overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBanner}
            alt="Bro Hood Fashion"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 h-full flex items-center">
          <div className="max-w-3xl space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
            <div className="space-y-2 sm:space-y-4">
              <p className="text-gold text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] font-medium">
                Premium Men's Fashion
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-serif font-bold leading-[1.1] text-white">
                Redefine <span className="block text-gold">Elegance</span>
              </h1>
            </div>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-xl">
              Curated collections for the modern gentleman who values quality, style, and sophistication.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <Link to="/products" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-sm sm:text-base bg-gold hover:bg-gold-dark text-black font-semibold px-6 sm:px-8 py-4 sm:py-6 h-auto rounded-none tracking-wide"
                >
                  EXPLORE COLLECTION
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link to="/products?featured=true" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-white bg-white/10 text-white hover:bg-white hover:text-black backdrop-blur-sm px-6 sm:px-8 py-4 sm:py-6 h-auto rounded-none tracking-wide font-semibold text-sm sm:text-base"
                >
                  NEW ARRIVALS
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-8 sm:py-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
            <div className="flex flex-col items-center text-center gap-2 sm:gap-3 group">
              <div className="p-3 sm:p-4 bg-gray-50 group-hover:bg-gold/10 transition-colors duration-300">
                <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
              </div>
              <div>
                <h3 className="font-serif text-base sm:text-lg font-semibold text-black mb-1">
                  Complimentary Shipping
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">On all orders above ₹999</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-2 sm:gap-3 group">
              <div className="p-3 sm:p-4 bg-gray-50 group-hover:bg-gold/10 transition-colors duration-300">
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
              </div>
              <div>
                <h3 className="font-serif text-base sm:text-lg font-semibold text-black mb-1">
                  Premium Craftsmanship
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Finest materials & attention to detail
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-2 sm:gap-3 group">
              <div className="p-3 sm:p-4 bg-gray-50 group-hover:bg-gold/10 transition-colors duration-300">
                <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
              </div>
              <div>
                <h3 className="font-serif text-base sm:text-lg font-semibold text-black mb-1">
                  Effortless Returns
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">7-day hassle-free returns</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category - now only two cards: Men's Top Wear & Men's Bottom Wear */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <p className="text-gold text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] font-medium mb-2 sm:mb-4">
              Discover
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-2 sm:mb-4 text-black">
              Shop by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg px-4">
              Curated collections for every occasion
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Men's Top Wear */}
            <Link
              to={`/products?category=mens-topwear`}
              className="group relative h-64 sm:h-72 lg:h-80 overflow-hidden bg-gray-100 hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)] transition-all duration-500 rounded-lg"
            >
              <img
                src="https://images.unsplash.com/photo-1520975661806-78b6a7a12b87?auto=format&fit=crop&w=1400&q=80"
                alt="Men's Top Wear"
                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1080&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-all duration-500" />
              <div className="absolute inset-0 flex flex-col items-center justify-end p-4 sm:p-6 text-white">
                <h3 className="text-2xl sm:text-3xl font-serif font-bold mb-2 group-hover:text-gold transition-colors duration-300">
                  Men's Top Wear
                </h3>
                <div className="w-12 h-0.5 bg-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            </Link>

            {/* Men's Bottom Wear */}
            <Link
              to={`/products?category=mens-bottomwear`}
              className="group relative h-64 sm:h-72 lg:h-80 overflow-hidden bg-gray-100 hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)] transition-all duration-500 rounded-lg"
            >
              <img
                src="https://images.unsplash.com/photo-1520962918058-4a8a6b7f9f63?auto=format&fit=crop&w=1400&q=80"
                alt="Men's Bottom Wear"
                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1080&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-all duration-500" />
              <div className="absolute inset-0 flex flex-col items-center justify-end p-4 sm:p-6 text-white">
                <h3 className="text-2xl sm:text-3xl font-serif font-bold mb-2 group-hover:text-gold transition-colors duration-300">
                  Men's Bottom Wear
                </h3>
                <div className="w-12 h-0.5 bg-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ✅ Trending Now Section */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-gold text-sm uppercase tracking-[0.3em] font-medium mb-3">
              Curated Picks
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-black">
              Trending Now
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Explore the styles everyone’s talking about this season.
            </p>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[300px] sm:h-[350px] lg:h-[400px] bg-gray-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-8 sm:mt-10">
            <Link to="/products?featured=true">
              <Button
                size="lg"
                className="text-sm sm:text-base bg-black hover:bg-gray-900 text-white font-semibold px-6 sm:px-8 py-4 sm:py-6 h-auto rounded-none tracking-wide"
              >
                View All Featured
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Visit Our Store Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-gold text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] font-medium mb-2 sm:mb-4">
              Experience In Person
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-3 sm:mb-4 text-black">
              Visit Our Store
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg px-4">
              Come experience our premium collection in person. Our expert stylists are ready to help you find the perfect look.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
              {/* Store Info */}
              <div className="space-y-4 sm:space-y-6 order-2 md:order-1">
                <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-gray-100">
                  <h3 className="text-xl sm:text-2xl font-serif font-bold mb-4 sm:mb-6 text-black">
                    BroHood Men's Fashion
                  </h3>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-black mb-1">Address</p>
                        <p className="text-sm sm:text-base text-gray-600">
                          Bangalore, Karnataka, India
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-black mb-1">Store Hours</p>
                        <p className="text-sm sm:text-base text-gray-600">
                          Mon - Sat: 10:00 AM - 9:00 PM<br />
                          Sunday: 11:00 AM - 8:00 PM
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-black mb-1">Contact</p>
                        <p className="text-sm sm:text-base text-gray-600">
                          Phone: +91 96862 20727<br />
                          Email: info@brohood.com
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <a
                      href="https://www.google.com/maps/place/Brohoodmensfashionupdate/@12.9050919,77.6299754,17z"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block"
                    >
                      <Button className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-black font-semibold">
                        Get Directions
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              {/* Google Maps */}
              <div className="order-1 md:order-2">
                <div className="rounded-lg overflow-hidden shadow-2xl border-4 border-white">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.0408960630966!2d77.62997537464967!3d12.90509188740416!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae151e228deddd%3A0xe2de04ce2553ff67!2sBrohoodmensfashionupdate!5e0!3m2!1sen!2sin!4v1763308177024!5m2!1sen!2sin"
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-[300px] sm:h-[400px] md:h-[450px]"
                    title="BroHood Store Location"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
