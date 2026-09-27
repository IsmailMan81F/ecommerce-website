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
  addCategory: (
    categoryDataOrName: string | { name: string; description?: string; image?: string; slug?: string },
    descriptionArg?: string,
    imageArg?: string
  ) => Category;
  updateCategory: (categoryId: string, updates: Partial<Category>) => void;
  deleteCategory: (categoryId: string) => { deletedProductsCount: number };
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

  // Auto-sync category itemCount with active products
  useEffect(() => {
    setCategories((prev) => {
      let changed = false;
      const next = prev.map((cat) => {
        const count = products.filter((p) => p.categorySlug === cat.slug).length;
        if (cat.itemCount !== count) {
          changed = true;
          return { ...cat, itemCount: count };
        }
        return cat;
      });
      return changed ? next : prev;
    });
  }, [products]);

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

  const addCategory = (
    categoryDataOrName: string | { name: string; description?: string; image?: string; slug?: string },
    descriptionArg?: string,
    imageArg?: string
  ): Category => {
    let name = "";
    let description = "";
    let image = "";
    let customSlug = "";

    if (typeof categoryDataOrName === "object" && categoryDataOrName !== null) {
      name = categoryDataOrName.name;
      description = categoryDataOrName.description || "";
      image = categoryDataOrName.image || "";
      customSlug = categoryDataOrName.slug || "";
    } else {
      name = categoryDataOrName;
      description = descriptionArg || "";
      image = imageArg || "";
    }

    const baseSlug = (
      customSlug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
    ) || `cat-${Date.now()}`;

    // ensure slug uniqueness
    let finalSlug = baseSlug;
    let counter = 1;
    while (categories.some((c) => c.slug === finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const fallbackImage =
      image ||
      products[0]?.images[0] ||
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80";

    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      slug: finalSlug,
      description: description.trim() || `Curated ${name} collection.`,
      image: fallbackImage,
      itemCount: 0,
    };

    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  };

  const updateCategory = (categoryId: string, updates: Partial<Category>) => {
    const oldCat = categories.find((c) => c.id === categoryId);
    if (!oldCat) return;

    const oldSlug = oldCat.slug;
    const newName = updates.name !== undefined ? updates.name.trim() : oldCat.name;
    const newSlug = updates.slug
      ? updates.slug
      : updates.name && updates.name !== oldCat.name
      ? updates.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
      : oldSlug;

    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === categoryId) {
          return {
            ...c,
            ...updates,
            name: newName,
            slug: newSlug,
            description: updates.description !== undefined ? updates.description.trim() : c.description,
            image: updates.image !== undefined ? updates.image : c.image,
          };
        }
        return c;
      })
    );

    // If slug or name changed, cascade update to corresponding products
    if (newSlug !== oldSlug || newName !== oldCat.name) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.categorySlug === oldSlug) {
            return {
              ...p,
              categorySlug: newSlug,
              categoryName: newName,
            };
          }
          return p;
        })
      );
    }
  };

  const deleteCategory = (categoryId: string): { deletedProductsCount: number } => {
    const target = categories.find((c) => c.id === categoryId);
    if (!target) return { deletedProductsCount: 0 };

    const targetSlug = target.slug;
    const affectedProducts = products.filter((p) => p.categorySlug === targetSlug);
    const deletedProductsCount = affectedProducts.length;

    // Delete all products belonging to this category
    setProducts((prev) => prev.filter((p) => p.categorySlug !== targetSlug));

    // Delete category
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));

    return { deletedProductsCount };
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
        updateCategory,
        deleteCategory,
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
