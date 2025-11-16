import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingCart, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Logo is in public directory
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";

const categories = [
  "All",
  "Shirts",
  "T-Shirts",
  "Jeans",
  "Trousers",
  "Shorts",
  "Jackets",
  "Hoodies",
  "Accessories",
  "Footwear",
];

export const Navbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const { cartCount } = useCart();

  useEffect(() => {
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const getUserInitial = () => {
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Top Bar */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="Bro Hood" className="h-12 lg:h-16 w-auto" />
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for products, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 bg-gray-50 border-gray-200 text-black placeholder:text-gray-500 focus-visible:ring-black"
              />
            </form>
          </div>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center gap-6">
            {/* Wishlist */}
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Button>
            </Link>

            {/* ✅ Dynamic Cart Badge */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Account Dropdown */}
            <div className="relative group">
              {user ? (
                <>
                  <Button variant="ghost" size="icon" className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {getUserInitial()}
                    </div>
                  </Button>
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-semibold truncate">{user.email}</p>
                    </div>
                    <Link to="/account" className="block px-4 py-2 hover:bg-gray-50 text-sm">
                      My Account
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 hover:bg-gray-50 text-sm">
                      My Orders
                    </Link>
                    <Link to="/wishlist" className="block px-4 py-2 hover:bg-gray-50 text-sm">
                      Wishlist
                    </Link>
                  </div>
                </>
              ) : (
                <Link to="/login">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Icons */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <div className="md:hidden py-3 border-t">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch(e as any);
                  }
                }}
                className="w-full pl-10"
              />
            </div>
          </div>
        )}

        {/* Desktop Categories */}
        <nav className="hidden lg:flex items-center gap-8 py-4 border-t overflow-x-auto">
          {categories.map((category) => (
            <Link
              key={category}
              to={`/products?category=${category.toLowerCase()}`}
              className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap"
            >
              {category}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {categories.map((category) => (
              <Link
                key={category}
                to={`/products?category=${category.toLowerCase()}`}
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {category}
              </Link>
            ))}
            <div className="border-t pt-4 flex flex-col gap-4">
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Heart className="h-5 w-5 mr-2" />
                  Wishlist
                </Button>
              </Link>
              <Link to="/account" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <User className="h-5 w-5 mr-2" />
                  My Account
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
