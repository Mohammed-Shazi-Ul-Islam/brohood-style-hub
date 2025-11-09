// Database types and interfaces for BroHood admin dashboard
import { Database } from '@/integrations/supabase/types';

// Extract table types for easier use
export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

// Product types
export type Product = Tables['products']['Row'];
export type ProductInsert = Tables['products']['Insert'];
export type ProductUpdate = Tables['products']['Update'];
export type ProductStatus = Enums['product_status'];

export type ProductVariant = Tables['product_variants']['Row'];
export type ProductVariantInsert = Tables['product_variants']['Insert'];
export type ProductVariantUpdate = Tables['product_variants']['Update'];

export type ProductImage = Tables['product_images']['Row'];
export type ProductImageInsert = Tables['product_images']['Insert'];
export type ProductImageUpdate = Tables['product_images']['Update'];

// Category types
export type Category = Tables['categories']['Row'];
export type CategoryInsert = Tables['categories']['Insert'];
export type CategoryUpdate = Tables['categories']['Update'];

// Order types
export type Order = Tables['orders']['Row'];
export type OrderInsert = Tables['orders']['Insert'];
export type OrderUpdate = Tables['orders']['Update'];
export type OrderStatus = Enums['order_status'];

export type OrderItem = Tables['order_items']['Row'];
export type OrderItemInsert = Tables['order_items']['Insert'];
export type OrderItemUpdate = Tables['order_items']['Update'];

// Payment types
export type Payment = Tables['payments']['Row'];
export type PaymentInsert = Tables['payments']['Insert'];
export type PaymentUpdate = Tables['payments']['Update'];
export type PaymentStatus = Enums['payment_status'];

// Admin types
export type AdminUser = Tables['admin_users']['Row'];
export type AdminUserInsert = Tables['admin_users']['Insert'];
export type AdminUserUpdate = Tables['admin_users']['Update'];
export type AdminRole = Enums['admin_role'];

// Customer types
export type CustomerProfile = Tables['customer_profiles']['Row'];
export type CustomerProfileInsert = Tables['customer_profiles']['Insert'];
export type CustomerProfileUpdate = Tables['customer_profiles']['Update'];

export type Address = Tables['addresses']['Row'];
export type AddressInsert = Tables['addresses']['Insert'];
export type AddressUpdate = Tables['addresses']['Update'];

// Inventory types
export type Inventory = Tables['inventory']['Row'];
export type InventoryInsert = Tables['inventory']['Insert'];
export type InventoryUpdate = Tables['inventory']['Update'];

// Discount types
export type Discount = Tables['discounts']['Row'];
export type DiscountInsert = Tables['discounts']['Insert'];
export type DiscountUpdate = Tables['discounts']['Update'];
export type DiscountType = Enums['discount_type'];

export type DiscountUsage = Tables['discount_usage']['Row'];
export type DiscountUsageInsert = Tables['discount_usage']['Insert'];
export type DiscountUsageUpdate = Tables['discount_usage']['Update'];

// Cart and Wishlist types
export type CartItem = Tables['cart_items']['Row'];
export type CartItemInsert = Tables['cart_items']['Insert'];
export type CartItemUpdate = Tables['cart_items']['Update'];

export type WishlistItem = Tables['wishlist_items']['Row'];
export type WishlistItemInsert = Tables['wishlist_items']['Insert'];
export type WishlistItemUpdate = Tables['wishlist_items']['Update'];

// Site settings types
export type SiteSetting = Tables['site_settings']['Row'];
export type SiteSettingInsert = Tables['site_settings']['Insert'];
export type SiteSettingUpdate = Tables['site_settings']['Update'];

// Audit log types
export type AuditLog = Tables['audit_logs']['Row'];
export type AuditLogInsert = Tables['audit_logs']['Insert'];
export type AuditLogUpdate = Tables['audit_logs']['Update'];

// Extended types with relationships
export interface ProductWithDetails extends Product {
  category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
  inventory?: Inventory[];
}

export interface OrderWithDetails extends Order {
  items?: (OrderItem & {
    product?: Product;
    variant?: ProductVariant;
  })[];
  payments?: Payment[];
  customer?: CustomerProfile;
}

export interface CategoryWithChildren extends Category {
  children?: Category[];
  parent?: Category;
  products_count?: number;
}

export interface AdminUserWithProfile extends AdminUser {
  email?: string;
  created_at_auth?: string;
}

// Dashboard statistics types
export interface DashboardStats {
  total_orders: number;
  total_revenue: number;
  total_customers: number;
  total_products: number;
  pending_orders: number;
  low_stock_products: number;
  recent_orders: OrderWithDetails[];
  top_products: (Product & { sales_count: number })[];
}

// Filter and pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface ProductFilters {
  category_id?: string;
  category_slug?: string; 
  status?: ProductStatus;
  featured?: boolean;
  price_min?: number;
  price_max?: number;
  search?: string;
  tags?: string[];
}

export interface OrderFilters {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  customer_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Form types
export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  category_id?: string;
  status: ProductStatus;
  featured: boolean;
  tags: string[];
  seo_title?: string;
  seo_description?: string;
  slug: string;
  variants: Omit<ProductVariantInsert, 'id' | 'product_id'>[];
  images: Omit<ProductImageInsert, 'id' | 'product_id'>[];
  inventory: Omit<InventoryInsert, 'id' | 'product_id' | 'variant_id'>[];
}

export interface OrderFormData {
  customer_id: string;
  items: {
    product_id: string;
    variant_id?: string;
    quantity: number;
    unit_price: number;
  }[];
  shipping_address: Address;
  billing_address: Address;
  notes?: string;
  discount_code?: string;
}

export interface DiscountFormData {
  code: string;
  name: string;
  description?: string;
  type: DiscountType;
  value: number;
  minimum_amount?: number;
  maximum_discount?: number;
  usage_limit?: number;
  valid_from?: string;
  valid_until?: string;
  active: boolean;
}

// Razorpay integration types
export interface RazorpayOrderData {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayPaymentData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Notification types
export interface NotificationData {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Search and autocomplete types
export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'product' | 'category' | 'order' | 'customer';
  url: string;
}

// Export utility types
export type DatabaseFunction<T extends keyof Database['public']['Functions']> = 
  Database['public']['Functions'][T];

export type LowStockProduct = DatabaseFunction<'get_low_stock_products'>['Returns'][0];
export type OrderTotal = DatabaseFunction<'calculate_order_total'>['Returns'][0];