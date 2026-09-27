export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount: number;
}

export interface ProductOption {
  name: string; // e.g. "Size", "Finish", "Material"
  values: string[]; // e.g. ["40mm", "44mm"] or ["Standard", "Large"] or ["Matte Black", "Brushed Silver"]
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
  isAvailable: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  images: string[];
  sizes: string[];
  colors: string[];
  variants?: ProductVariant[];
  stock: number;
  isAvailable: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
  rating?: number;
  specs?: Record<string, string>;
}

export interface CartItem {
  id: string; // unique item cart key (e.g. `${product.id}-${size}-${color}`)
  productId: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  price: number;
}

export interface OrderCustomer {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  wilaya?: string;
  commune?: string;
  deliveryType?: 'home' | 'office';
  address?: string;
  notes?: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  customer: OrderCustomer;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  status: OrderStatus;
}

export interface FilterState {
  category?: string;
  size?: string;
  priceRange?: string; // "all" | "under-100" | "100-300" | "300-600" | "600-plus"
  availability?: string; // "all" | "in-stock"
  sortBy?: string; // "featured" | "price-asc" | "price-desc" | "name-asc"
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  inquiryType?: string;
  orderNumber?: string;
  message: string;
  createdAt: string;
  status: "unread" | "read" | "replied";
  isRead?: boolean;
  notes?: string;
}

