// Admin hooks for managing products, inventory, and categories
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  ProductWithDetails, 
  ProductInsert, 
  ProductUpdate, 
  Category, 
  CategoryInsert,
  CategoryUpdate,
  Inventory,
  InventoryUpdate,
  ProductVariant,
  ProductVariantInsert
} from '@/types/database';

export function useAdminProducts() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          variants:product_variants(*),
          images:product_images(*),
          inventory(*)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setProducts(data || []);
    } catch (err: any) {
      console.error('Error fetching admin products:', err);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: ProductInsert): Promise<ProductWithDetails | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select(`
          *,
          category:categories(*),
          variants:product_variants(*),
          images:product_images(*),
          inventory(*)
        `)
        .single();

      if (error) {
        throw error;
      }

      setProducts(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      console.error('Error creating product:', err);
      setError(err.message || 'Failed to create product');
      return null;
    }
  };

  const updateProduct = async (id: string, updates: ProductUpdate): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Refresh products list
      await fetchProducts();
      return true;
    } catch (err: any) {
      console.error('Error updating product:', err);
      setError(err.message || 'Failed to update product');
      return false;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setProducts(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError(err.message || 'Failed to delete product');
      return false;
    }
  };

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  };
}

export function useAdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setCategories(data || []);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData: CategoryInsert): Promise<Category | null> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setCategories(prev => [...prev, data]);
      return data;
    } catch (err: any) {
      console.error('Error creating category:', err);
      setError(err.message || 'Failed to create category');
      return null;
    }
  };

  const updateCategory = async (id: string, updates: CategoryUpdate): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id);

      if (error) {
        throw error;
      }

      await fetchCategories();
      return true;
    } catch (err: any) {
      console.error('Error updating category:', err);
      setError(err.message || 'Failed to update category');
      return false;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setCategories(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError(err.message || 'Failed to delete category');
      return false;
    }
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
}

export function useInventoryManagement() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async (productId?: string) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('inventory')
        .select(`
          *,
          product:products(*),
          variant:product_variants(*)
        `);

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setInventory(data || []);
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      setError(err.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const updateInventory = async (id: string, updates: InventoryUpdate): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('inventory')
        .update(updates)
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state
      setInventory(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));

      return true;
    } catch (err: any) {
      console.error('Error updating inventory:', err);
      setError(err.message || 'Failed to update inventory');
      return false;
    }
  };

  const bulkUpdateInventory = async (updates: { id: string; quantity: number }[]): Promise<boolean> => {
    try {
      const promises = updates.map(({ id, quantity }) =>
        supabase
          .from('inventory')
          .update({ quantity })
          .eq('id', id)
      );

      const results = await Promise.all(promises);
      
      // Check if any failed
      const hasError = results.some(result => result.error);
      if (hasError) {
        throw new Error('Some inventory updates failed');
      }

      // Refresh inventory
      await fetchInventory();
      return true;
    } catch (err: any) {
      console.error('Error bulk updating inventory:', err);
      setError(err.message || 'Failed to update inventory');
      return false;
    }
  };

  const getLowStockItems = async (): Promise<Inventory[]> => {
    try {
      const { data, error } = await supabase
        .rpc('get_low_stock_products');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err: any) {
      console.error('Error getting low stock items:', err);
      return [];
    }
  };

  return {
    inventory,
    loading,
    error,
    fetchInventory,
    updateInventory,
    bulkUpdateInventory,
    getLowStockItems
  };
}

export function useProductVariants(productId: string) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      fetchVariants();
    }
  }, [productId]);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setVariants(data || []);
    } catch (err: any) {
      console.error('Error fetching variants:', err);
      setError(err.message || 'Failed to fetch variants');
    } finally {
      setLoading(false);
    }
  };

  const createVariant = async (variantData: ProductVariantInsert): Promise<ProductVariant | null> => {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .insert({ ...variantData, product_id: productId })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setVariants(prev => [...prev, data]);
      return data;
    } catch (err: any) {
      console.error('Error creating variant:', err);
      setError(err.message || 'Failed to create variant');
      return null;
    }
  };

  const updateVariant = async (id: string, updates: Partial<ProductVariant>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('product_variants')
        .update(updates)
        .eq('id', id);

      if (error) {
        throw error;
      }

      setVariants(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
      return true;
    } catch (err: any) {
      console.error('Error updating variant:', err);
      setError(err.message || 'Failed to update variant');
      return false;
    }
  };

  const deleteVariant = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setVariants(prev => prev.filter(v => v.id !== id));
      return true;
    } catch (err: any) {
      console.error('Error deleting variant:', err);
      setError(err.message || 'Failed to delete variant');
      return false;
    }
  };

  return {
    variants,
    loading,
    error,
    fetchVariants,
    createVariant,
    updateVariant,
    deleteVariant
  };
}