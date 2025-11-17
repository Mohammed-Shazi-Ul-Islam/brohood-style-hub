// src/context/CartContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string; // ✅ Added size support
}

interface CartContextValue {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, size?: string) => void;
  clearCart: () => void;
  cartCount: number;
}

export type { CartItem };

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load existing cart
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch {
        setCart([]);
      }
    }
  }, []);

  // Persist cart
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ✅ Merge logic with size support
  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      // Match by both id AND size (if size exists)
      const existing = prev.find((p) => 
        p.id === newItem.id && p.size === newItem.size
      );
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((p) =>
          p.id === newItem.id && p.size === newItem.size
            ? { ...p, quantity: p.quantity + newItem.quantity }
            : p
        );
      } else {
        updated = [...prev, newItem];
      }
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCart = (id: string, size?: string) => {
    const updated = cart.filter((item) => 
      !(item.id === id && (size === undefined || item.size === size))
    );
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        cartCount: cart.reduce((sum, i) => sum + i.quantity, 0),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
