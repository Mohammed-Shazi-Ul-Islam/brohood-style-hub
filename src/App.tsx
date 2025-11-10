import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/context/CartContext";

import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import Login from "./pages/Login";

import { WorkingAdminDashboard } from "./pages/admin/WorkingAdminDashboard";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminRedirect } from "./pages/admin/AdminRedirect";
import { AdminProducts } from "./pages/admin/Products";
import { AdminCategories } from "./pages/admin/Categories";
import { AdminLogin } from "./components/auth/AdminLogin";
import { TestAdmin } from "./pages/admin/TestAdmin";
import NotFound from "./pages/NotFound";

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
          <Route path="/admin/orders" element={<WorkingAdminDashboard />} />
          <Route path="/admin/customers" element={<WorkingAdminDashboard />} />
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
                  </div>
                </CartProvider>
              </AuthProvider>
            }
          />

          <Route
            path="/account"
            element={
              <AuthProvider>
                <main className="flex-1">
                  <Account />
                </main>
              </AuthProvider>
            }
          />

          <Route path="/login" element={<Login />} />

          {/* ========================= FALLBACK ========================= */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
