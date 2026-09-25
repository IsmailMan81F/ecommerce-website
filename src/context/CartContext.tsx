import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { CartItem, Product } from "@/types";

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  total: number;
  addToCart: (
    product: Product,
    quantity?: number,
    selectedSize?: string,
    selectedColor?: string
  ) => void;
  updateQuantity: (id: string, deltaOrValue: number, isAbsolute?: boolean) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "kord_cart_state_v1";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore storage access errors
    }
    // Initial sample item for instant realism if empty
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage error
    }
  }, [items]);

  const addToCart = (
    product: Product,
    quantity: number = 1,
    selectedSize?: string,
    selectedColor?: string
  ) => {
    const size = selectedSize || product.sizes[0] || "Standard";
    const color = selectedColor || product.colors[0] || "Default";
    const itemId = `${product.id}-${size}-${color}`;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === itemId);
      if (existingIndex > -1) {
        const next = [...prevItems];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      } else {
        return [
          ...prevItems,
          {
            id: itemId,
            productId: product.id,
            product,
            quantity,
            selectedSize: size,
            selectedColor: color,
            price: product.price,
          },
        ];
      }
    });

    toast.success("Added to Bag", {
      description: `${product.name} (${size}${color ? `, ${color}` : ""})`,
      duration: 2600,
    });
  };

  const updateQuantity = (
    id: string,
    deltaOrValue: number,
    isAbsolute = false
  ) => {
    setItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.id === id) {
            const nextQty = isAbsolute
              ? deltaOrValue
              : item.quantity + deltaOrValue;
            return {
              ...item,
              quantity: Math.max(0, nextQty),
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    toast.error("Item Removed", {
      description: "Item removed from your cart bag.",
      duration: 2000,
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal === 0 ? 0 : subtotal >= 500 ? 0 : 25;
  const total = subtotal + shippingFee;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        shippingFee,
        total,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
