import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  Product,
  Category,
  Order,
  OrderStatus,
  ContactMessage,
  StoreSettings,
  StoreGeneralInfo,
  StoreLocationInfo,
  StoreHours,
  StoreSocialMedia,
  StoreDeliverySettings,
  StoreVariantOptions,
} from "@/types";
import { supabase } from "@/lib/supabase";
import {
  PRODUCTS,
  CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_CONTACT_MESSAGES,
  INITIAL_STORE_SETTINGS,
} from "@/lib/data";

interface FooterStoreData {
  location: Pick<StoreLocationInfo, "country" | "city" | "address" | "googleMapsUrl">;
  hours: StoreHours;
  social: Pick<StoreSocialMedia, "facebook" | "instagram">;
}

interface SupabaseFooterCategoryRow {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

interface SupabaseFooterStoreRow {
  country: string;
  commune: string | null;
  street_address: string | null;
  google_maps_url: string;
  instagram_url: string;
  facebook_url: string;
  opening_schedule: unknown;
}

const CLOSED_FOOTER_HOURS: StoreHours = {
  saturdayToThursday: { isOpen: false, openTime: "", closeTime: "" },
  friday: { isOpen: false, openTime: "", closeTime: "" },
};

interface StoreContextType {
  products: Product[];
  categories: Category[];
  orders: Order[];
  messages: ContactMessage[];
  unreadMessagesCount: number;
  storeSettings: StoreSettings;
  footerCategories: Category[] | null;
  footerStoreData: FooterStoreData | null;
  footerDataLoading: boolean;
  updateStoreGeneral: (general: Partial<StoreGeneralInfo>) => void;
  updateStoreLocation: (location: Partial<StoreLocationInfo>) => void;
  updateStoreHours: (hours: StoreHours) => void;
  updateStoreSocial: (social: Partial<StoreSocialMedia>) => void;
  updateStoreDelivery: (delivery: Partial<StoreDeliverySettings>) => void;
  updateStoreVariantOptions: (variantOptions: StoreVariantOptions) => void;
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
  addMessage: (
    messageData: Omit<ContactMessage, "id" | "createdAt" | "status" | "isRead"> & {
      status?: "unread" | "read" | "replied";
      isRead?: boolean;
    }
  ) => ContactMessage;
  markMessageRead: (messageId: string, isRead?: boolean) => void;
  toggleMessageRead: (messageId: string) => void;
  updateMessageStatus: (messageId: string, status: "unread" | "read" | "replied") => void;
  deleteMessage: (messageId: string) => void;
  updateMessageNotes: (messageId: string, notes: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const PRODUCTS_STORAGE_KEY = "kord_clothing_store_products_v3";
const CATEGORIES_STORAGE_KEY = "kord_clothing_store_categories_v3";
const ORDERS_STORAGE_KEY = "kord_clothing_store_orders_v3";
const MESSAGES_STORAGE_KEY = "kord_clothing_store_messages_v3";
const STORE_SETTINGS_STORAGE_KEY = "kord_clothing_store_settings_v3";

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

  const [messages, setMessages] = useState<ContactMessage[]>(() => {
    try {
      const stored = sessionStorage.getItem(MESSAGES_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return INITIAL_CONTACT_MESSAGES;
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const stored =
        localStorage.getItem(STORE_SETTINGS_STORAGE_KEY) ||
        sessionStorage.getItem(STORE_SETTINGS_STORAGE_KEY);
      if (stored) {
        return { ...INITIAL_STORE_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return INITIAL_STORE_SETTINGS;
  });
  const [footerCategories, setFooterCategories] = useState<Category[] | null>(null);
  const [footerStoreData, setFooterStoreData] = useState<FooterStoreData | null>(null);
  const [footerDataLoading, setFooterDataLoading] = useState(true);

  // Sync to sessionStorage & localStorage
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

  useEffect(() => {
    try {
      sessionStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORE_SETTINGS_STORAGE_KEY, JSON.stringify(storeSettings));
      sessionStorage.setItem(STORE_SETTINGS_STORAGE_KEY, JSON.stringify(storeSettings));
    } catch {
      // ignore
    }
  }, [storeSettings]);

  useEffect(() => {
    let isMounted = true;

    const loadFooterData = async () => {
      const [categoryResult, storeResult] = await Promise.all([
        supabase
          .from("category")
          .select("id,name,description,image_url")
          .order("created_at", { ascending: true })
          .limit(3),
        supabase
          .from("store")
          .select("country,commune,street_address,google_maps_url,instagram_url,facebook_url,opening_schedule")
          .order("id", { ascending: true })
          .limit(1)
          .maybeSingle(),
      ]);

      if (!isMounted) return;

      if (categoryResult.error) {
        console.error("Failed to load footer categories:", categoryResult.error);
      } else {
        const rows = (categoryResult.data ?? []) as unknown as SupabaseFooterCategoryRow[];
        setFooterCategories(
          rows.map((row) => ({
            id: row.id,
            name: row.name,
            slug: row.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || row.id,
            description: row.description ?? "",
            image: row.image_url ?? "",
            itemCount: 0,
          }))
        );
      }

      if (storeResult.error) {
        console.error("Failed to load footer store settings:", storeResult.error);
      } else if (storeResult.data) {
        const row = storeResult.data as unknown as SupabaseFooterStoreRow;
        const schedule = row.opening_schedule as Partial<StoreHours> | null;
        const hours = schedule?.saturdayToThursday && schedule.friday
          ? schedule as StoreHours
          : CLOSED_FOOTER_HOURS;

        setFooterStoreData({
          location: {
            country: row.country,
            city: row.commune ?? "",
            address: row.street_address ?? "",
            googleMapsUrl: row.google_maps_url,
          },
          hours,
          social: {
            instagram: row.instagram_url,
            facebook: row.facebook_url,
          },
        });
      }

      setFooterDataLoading(false);
    };

    void loadFooterData().catch((error: unknown) => {
      console.error("Failed to load footer data:", error);
      if (isMounted) setFooterDataLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const unreadMessagesCount = useMemo(() => {
    return messages.filter((m) => m.status === "unread" || m.isRead === false).length;
  }, [messages]);

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

  const addMessage = (
    messageData: Omit<ContactMessage, "id" | "createdAt" | "status" | "isRead"> & {
      status?: "unread" | "read" | "replied";
      isRead?: boolean;
    }
  ): ContactMessage => {
    const newMessage: ContactMessage = {
      ...messageData,
      id: `msg-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      status: messageData.status || "unread",
      isRead: messageData.isRead ?? false,
    };
    setMessages((prev) => [newMessage, ...prev]);
    return newMessage;
  };

  const markMessageRead = (messageId: string, isRead = true) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              isRead,
              status: isRead ? (msg.status === "unread" ? "read" : msg.status) : "unread",
            }
          : msg
      )
    );
  };

  const toggleMessageRead = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const nextIsRead = !(msg.status === "read" || msg.isRead === true);
          return {
            ...msg,
            isRead: nextIsRead,
            status: nextIsRead ? "read" : "unread",
          };
        }
        return msg;
      })
    );
  };

  const updateMessageStatus = (
    messageId: string,
    status: "unread" | "read" | "replied"
  ) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              status,
              isRead: status !== "unread",
            }
          : msg
      )
    );
  };

  const deleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  };

  const updateMessageNotes = (messageId: string, notes: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, notes } : msg))
    );
  };

  const updateStoreGeneral = (general: Partial<StoreGeneralInfo>) => {
    setStoreSettings((prev) => ({
      ...prev,
      general: { ...prev.general, ...general },
    }));
  };

  const updateStoreLocation = (location: Partial<StoreLocationInfo>) => {
    setStoreSettings((prev) => ({
      ...prev,
      location: { ...prev.location, ...location },
    }));
  };

  const updateStoreHours = (hours: StoreHours) => {
    setStoreSettings((prev) => ({
      ...prev,
      hours,
    }));
  };

  const updateStoreSocial = (social: Partial<StoreSocialMedia>) => {
    setStoreSettings((prev) => ({
      ...prev,
      social: { ...prev.social, ...social },
    }));
  };

  const updateStoreDelivery = (delivery: Partial<StoreDeliverySettings>) => {
    setStoreSettings((prev) => ({
      ...prev,
      delivery: { ...prev.delivery, ...delivery },
    }));
  };

  const updateStoreVariantOptions = (variantOptions: StoreVariantOptions) => {
    setStoreSettings((prev) => ({
      ...prev,
      variantOptions,
    }));
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        orders,
        messages,
        unreadMessagesCount,
        storeSettings,
        footerCategories,
        footerStoreData,
        footerDataLoading,
        updateStoreGeneral,
        updateStoreLocation,
        updateStoreHours,
        updateStoreSocial,
        updateStoreDelivery,
        updateStoreVariantOptions,
        toggleProductAvailability,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        updateOrderStatus,
        createOrder,
        addMessage,
        markMessageRead,
        toggleMessageRead,
        updateMessageStatus,
        deleteMessage,
        updateMessageNotes,
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
