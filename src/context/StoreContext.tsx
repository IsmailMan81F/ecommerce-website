import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, Category, Order, OrderStatus } from "@/types";
import { PRODUCTS, CATEGORIES, INITIAL_ORDERS } from "@/lib/data";

interface StoreContextType {
  products: Product[];
  categories: Category[];
  orders: Order[];
  toggleProductAvailability: (productId: string) => void;
  addProduct: (productData: Omit<Product, "id" | "slug"> & { slug?: string }) => Product;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  addCategory: (name: string, description?: string) => Category;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  createOrder: (order: Omit<Order, "id" | "createdAt">) => Order;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const PRODUCTS_STORAGE_KEY = "kord_store_products";
const CATEGORIES_STORAGE_KEY = "kord_store_categories";
const ORDERS_STORAGE_KEY = "kord_store_orders";

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = sessionStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const stored = sessionStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return CATEGORIES;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = sessionStorage.getItem(ORDERS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return INITIAL_ORDERS;
  });

  // Sync to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  useEffect(() => {
    try {
      sessionStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch {
      // ignore
    }
  }, [categories]);

  useEffect(() => {
    try {
      sessionStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  const toggleProductAvailability = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return { ...p, isAvailable: !p.isAvailable };
        }
        return p;
      })
    );
  };

  const addProduct = (
    productData: Omit<Product, "id" | "slug"> & { slug?: string }
  ): Product => {
    const slug =
      productData.slug ||
      productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      slug: slug || `prod-${Date.now()}`,
    };

    setProducts((prev) => [newProduct, ...prev]);

    // Update category item count
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.slug === newProduct.categorySlug) {
          return { ...cat, itemCount: cat.itemCount + 1 };
        }
        return cat;
      })
    );

    return newProduct;
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return { ...p, ...updates };
        }
        return p;
      })
    );
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => {
      const target = prev.find((p) => p.id === productId);
      if (target) {
        setCategories((prevCats) =>
          prevCats.map((cat) => {
            if (cat.slug === target.categorySlug) {
              return { ...cat, itemCount: Math.max(0, cat.itemCount - 1) };
            }
            return cat;
          })
        );
      }
      return prev.filter((p) => p.id !== productId);
    });
  };

  const addCategory = (name: string, description: string = ""): Category => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name,
      slug: slug || `cat-${Date.now()}`,
      description: description || `Curated ${name} collection.`,
      image: products[0]?.images[0] || "",
      itemCount: 0,
    };

    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return { ...o, status };
        }
        return o;
      })
    );
  };

  const createOrder = (orderData: Omit<Order, "id" | "createdAt">): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `KRD-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        orders,
        toggleProductAvailability,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateOrderStatus,
        createOrder,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
