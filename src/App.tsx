import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/context/CartContext";
import { Loader2 } from "lucide-react";

// ✅ Always load these (critical for initial render)
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import Home from "./pages/Home";

// ✅ Lazy load everything else (code splitting)
const AIChatbot = lazy(() => import("./components/AIChatbot").then(m => ({ default: m.AIChatbot })));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Account = lazy(() => import("./pages/AccountNew"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Login = lazy(() => import("./pages/Login"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const Orders = lazy(() => import("./pages/Orders"));

// Admin pages (rarely used, definitely lazy load)
const AdminLogin = lazy(() => import("./components/auth/AdminLogin").then(m => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const AdminRedirect = lazy(() => import("./pages/admin/AdminRedirect").then(m => ({ default: m.AdminRedirect })));
const AdminProducts = lazy(() => import("./pages/admin/Products").then(m => ({ default: m.AdminProducts })));
const AdminCategories = lazy(() => import("./pages/admin/Categories").then(m => ({ default: m.AdminCategories })));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const WorkingAdminDashboard = lazy(() => import("./pages/admin/WorkingAdminDashboard").then(m => ({ default: m.WorkingAdminDashboard })));

// Info pages (rarely visited, lazy load)
const Contact = lazy(() => import("./pages/Contact"));
const About = lazy(() => import("./pages/About"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Shipping = lazy(() => import("./pages/Shipping"));
const Returns = lazy(() => import("./pages/Returns"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const SizeGuide = lazy(() => import("./pages/SizeGuide"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TestRazorpay = lazy(() => import("./pages/TestRazorpay"));
const TestAdmin = lazy(() => import("./pages/admin/TestAdmin").then(m => ({ default: m.TestAdmin })));

// ✅ Optimized QueryClient with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// ✅ Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Loader2 className="h-10 w-10 animate-spin text-black mx-auto mb-3" />
      <p className="text-sm text-gray-600">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter future={{ v7_relativeSplatPath: true }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
          {/* ========================= ADMIN ROUTES ========================= */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/test" element={<TestAdmin />} />
          <Route path="/admin" element={<AdminRedirect />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/settings" element={<WorkingAdminDashboard />} />

          {/* ========================= PUBLIC ROUTES ========================= */}
          <Route
            path="/"
            element={
              <AuthProvider>
                <CartProvider>
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <Home />
                    </main>
                    <Footer />
                    <AIChatbot />
                  </div>
                </CartProvider>
              </AuthProvider>
            }
          />

          <Route
            path="/products"
            element={
              <AuthProvider>
                <CartProvider>
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <Products />
                    </main>
                    <Footer />
                    <AIChatbot />
                  </div>
                </CartProvider>
              </AuthProvider>
            }
          />

          <Route
            path="/product/:id"
            element={
              <AuthProvider>
                <CartProvider>
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <ProductDetail />
                    </main>
                    <Footer />
                    <AIChatbot />
                  </div>
                </CartProvider>
              </AuthProvider>
            }
          />

          <Route
            path="/cart"
            element={
              <AuthProvider>
                <CartProvider>
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <Cart />
                    </main>
                    <Footer />
                    <AIChatbot />
                  </div>
                </CartProvider>
              </AuthProvider>
            }
          />

          <Route
            path="/checkout"
            element={
              <AuthProvider>
                <CartProvider>
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <Checkout />
                    </main>
                    <Footer />
                    <AIChatbot />
                  </div>
                </CartProvider>
              </AuthProvider>
            }
          />

          <Route path="/account" element={
            <AuthProvider>
              <CartProvider>
                <Account />
              </CartProvider>
            </AuthProvider>
          } />

          <Route path="/wishlist" element={
            <AuthProvider>
              <CartProvider>
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1">
                    <Wishlist />
                  </main>
                  <Footer />
                </div>
              </CartProvider>
            </AuthProvider>
          } />

          <Route
            path="/orders"
            element={
              <AuthProvider>
                <CartProvider>
                  <Orders />
                </CartProvider>
              </AuthProvider>
            }
          />

          <Route path="/login" element={<Login />} />

          <Route path="/test-razorpay" element={<TestRazorpay />} />

          <Route
            path="/order-success"
            element={
              <AuthProvider>
                <CartProvider>
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <OrderSuccess />
                    </main>
                    <Footer />
                  </div>
                </CartProvider>
              </AuthProvider>
            }
          />

          {/* ========================= INFO PAGES ========================= */}
          <Route path="/contact" element={<AuthProvider><CartProvider><div className="flex flex-col min-h-screen"><Navbar /><main className="flex-1"><Contact /></main><Footer /></div></CartProvider></AuthProvider>} />
          <Route path="/about" element={<AuthProvider><CartProvider><div className="flex flex-col min-h-screen"><Navbar /><main className="flex-1"><About /></main><Footer /></div></CartProvider></AuthProvider>} />
          <Route path="/faq" element={<AuthProvider><CartProvider><div className="flex flex-col min-h-screen"><Navbar /><main className="flex-1"><FAQ /></main><Footer /></div></CartProvider></AuthProvider>} />
          <Route path="/shipping" element={<AuthProvider><CartProvider><div className="flex flex-col min-h-screen"><Navbar /><main className="flex-1"><Shipping /></main><Footer /></div></CartProvider></AuthProvider>} />
          <Route path="/returns" element={<AuthProvider><CartProvider><div className="flex flex-col min-h-screen"><Navbar /><main className="flex-1"><Returns /></main><Footer /></div></CartProvider></AuthProvider>} />
          <Route path="/terms" element={<AuthProvider><CartProvider><div className="flex flex-col min-h-screen"><Navbar /><main className="flex-1"><Terms /></main><Footer /></div></CartProvider></AuthProvider>} />
          <Route path="/privacy" element={<AuthProvider><CartProvider><div className="flex flex-col min-h-screen"><Navbar /><main className="flex-1"><Privacy /></main><Footer /></div></CartProvider></AuthProvider>} />
          <Route path="/size-guide" element={<AuthProvider><CartProvider><div className="flex flex-col min-h-screen"><Navbar /><main className="flex-1"><SizeGuide /></main><Footer /></div></CartProvider></AuthProvider>} />

          {/* ========================= FALLBACK ========================= */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
