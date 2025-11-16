import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/context/CartContext";

import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { AIChatbot } from "./components/AIChatbot";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Account from "./pages/AccountNew";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import OrderSuccess from "./pages/OrderSuccess";
import TestRazorpay from "./pages/TestRazorpay";
import Orders from "./pages/Orders";

import { WorkingAdminDashboard } from "./pages/admin/WorkingAdminDashboard";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminRedirect } from "./pages/admin/AdminRedirect";
import { AdminProducts } from "./pages/admin/Products";
import { AdminCategories } from "./pages/admin/Categories";
import { AdminLogin } from "./components/auth/AdminLogin";
import { TestAdmin } from "./pages/admin/TestAdmin";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Shipping from "./pages/Shipping";
import Returns from "./pages/Returns";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import SizeGuide from "./pages/SizeGuide";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter future={{ v7_relativeSplatPath: true }}>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
