// Database utility functions for BroHood admin dashboard
import { supabase } from '@/integrations/supabase/client';
import { 
  PaginationParams, 
  ProductFilters, 
  OrderFilters,
  PaginatedResponse,
  ProductWithDetails,
  OrderWithDetails,
  LowStockProduct,
  OrderTotal
} from '@/types/database';

/**
 * Generic pagination helper
 */
export function getPaginationParams(page: number = 1, limit: number = 10): PaginationParams {
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * Build pagination response
 */
export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit)
    }
  };
}

/**
 * Get products with filters and pagination
 */
export async function getProducts(
  filters: ProductFilters = {},
  pagination: PaginationParams = getPaginationParams()
) {
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      variants:product_variants(*),
      images:product_images(*),
      inventory(*)
    `, { count: 'exact' });

  // Apply filters
  if (filters.category_id) {
    query = query.eq('category_id', filters.category_id);
  }
  
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters.featured !== undefined) {
    query = query.eq('featured', filters.featured);
  }
  
  if (filters.price_min !== undefined) {
    query = query.gte('price', filters.price_min);
  }
  
  if (filters.price_max !== undefined) {
    query = query.lte('price', filters.price_max);
  }
  
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }
  
  if (filters.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags);
  }

  // Apply pagination
  query = query
    .range(pagination.offset!, pagination.offset! + pagination.limit - 1)
    .order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return buildPaginatedResponse(
    data as ProductWithDetails[],
    count || 0,
    pagination.page,
    pagination.limit
  );
}

/**
 * Get orders with filters and pagination
 */
export async function getOrders(
  filters: OrderFilters = {},
  pagination: PaginationParams = getPaginationParams()
) {
  let query = supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product:products(*),
        variant:product_variants(*)
      ),
      payments(*),
      customer:customer_profiles(*)
    `, { count: 'exact' });

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters.payment_status) {
    query = query.eq('payment_status', filters.payment_status);
  }
  
  if (filters.customer_id) {
    query = query.eq('customer_id', filters.customer_id);
  }
  
  if (filters.date_from) {
    query = query.gte('created_at', filters.date_from);
  }
  
  if (filters.date_to) {
    query = query.lte('created_at', filters.date_to);
  }
  
  if (filters.search) {
    query = query.or(`order_number.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
  }

  // Apply pagination
  query = query
    .range(pagination.offset!, pagination.offset! + pagination.limit - 1)
    .order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return buildPaginatedResponse(
    data as OrderWithDetails[],
    count || 0,
    pagination.page,
    pagination.limit
  );
}

/**
 * Get categories with hierarchy
 */
export async function getCategories(includeInactive: boolean = false) {
  let query = supabase
    .from('categories')
    .select(`
      *,
      parent:parent_id(*),
      children:categories!parent_id(*)
    `)
    .order('sort_order');

  if (!includeInactive) {
    query = query.eq('active', true);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get low stock products
 */
export async function getLowStockProducts(): Promise<LowStockProduct[]> {
  const { data, error } = await supabase.rpc('get_low_stock_products');

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Calculate order total with discounts
 */
export async function calculateOrderTotal(
  subtotal: number,
  discountCode?: string,
  shippingAmount: number = 0
): Promise<OrderTotal> {
  const { data, error } = await supabase.rpc('calculate_order_total', {
    p_subtotal: subtotal,
    p_discount_code: discountCode,
    p_shipping_amount: shippingAmount
  });

  if (error) {
    throw error;
  }

  return data[0];
}

/**
 * Reserve inventory for order
 */
export async function reserveInventory(
  productId: string,
  variantId: string | null,
  quantity: number
): Promise<boolean> {
  const { data, error } = await supabase.rpc('reserve_inventory', {
    p_product_id: productId,
    p_variant_id: variantId,
    p_quantity: quantity
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Release reserved inventory
 */
export async function releaseInventory(
  productId: string,
  variantId: string | null,
  quantity: number
): Promise<void> {
  const { error } = await supabase.rpc('release_inventory', {
    p_product_id: productId,
    p_variant_id: variantId,
    p_quantity: quantity
  });

  if (error) {
    throw error;
  }
}

/**
 * Confirm inventory (convert reserved to sold)
 */
export async function confirmInventory(
  productId: string,
  variantId: string | null,
  quantity: number
): Promise<void> {
  const { error } = await supabase.rpc('confirm_inventory', {
    p_product_id: productId,
    p_variant_id: variantId,
    p_quantity: quantity
  });

  if (error) {
    throw error;
  }
}

/**
 * Get site settings
 */
export async function getSiteSettings() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .order('key');

  if (error) {
    throw error;
  }

  // Convert to key-value object
  const settings: Record<string, any> = {};
  data?.forEach(setting => {
    settings[setting.key] = setting.value;
  });

  return settings;
}

/**
 * Update site setting
 */
export async function updateSiteSetting(key: string, value: any, description?: string) {
  const { data, error } = await supabase
    .from('site_settings')
    .upsert({
      key,
      value,
      description
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  // Get total counts
  const [ordersResult, customersResult, productsResult] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('customer_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true })
  ]);

  // Get revenue (sum of total_amount from paid orders)
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('payment_status', 'paid');

  const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

  // Get pending orders count
  const { count: pendingOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Get low stock products count
  const lowStockProducts = await getLowStockProducts();

  // Get recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product:products(*),
        variant:product_variants(*)
      ),
      customer:customer_profiles(*)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    total_orders: ordersResult.count || 0,
    total_revenue: totalRevenue,
    total_customers: customersResult.count || 0,
    total_products: productsResult.count || 0,
    pending_orders: pendingOrders || 0,
    low_stock_products: lowStockProducts.length,
    recent_orders: recentOrders as OrderWithDetails[] || [],
    top_products: [] // TODO: Implement top products query
  };
}

/**
 * Search across multiple entities
 */
export async function globalSearch(query: string, limit: number = 10) {
  const searchTerm = `%${query}%`;
  
  const [productsResult, ordersResult, customersResult] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, slug')
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(limit),
    
    supabase
      .from('orders')
      .select('id, order_number')
      .ilike('order_number', searchTerm)
      .limit(limit),
    
    supabase
      .from('customer_profiles')
      .select('id, first_name, last_name, user_id')
      .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`)
      .limit(limit)
  ]);

  const results = [
    ...(productsResult.data || []).map(item => ({
      id: item.id,
      title: item.name,
      type: 'product' as const,
      url: `/admin/products/${item.id}`
    })),
    ...(ordersResult.data || []).map(item => ({
      id: item.id,
      title: item.order_number,
      type: 'order' as const,
      url: `/admin/orders/${item.id}`
    })),
    ...(customersResult.data || []).map(item => ({
      id: item.id,
      title: `${item.first_name || ''} ${item.last_name || ''}`.trim(),
      type: 'customer' as const,
      url: `/admin/customers/${item.user_id}`
    }))
  ];

  return results;
}