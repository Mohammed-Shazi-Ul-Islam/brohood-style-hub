// Hooks for fetching products from Supabase
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ProductWithDetails,
  Category,
  ProductFilters,
  PaginationParams,
} from "@/types/database";
import { useCategories } from "@/hooks/useProducts";

export interface UseProductsOptions {
  filters?: ProductFilters;
  pagination?: PaginationParams;
  sortBy?: string;
}

// ===========================
// ✅ MAIN PRODUCTS FETCH HOOK
// ===========================
export function useProducts(options: UseProductsOptions = {}) {
  const { categories: allCategories, loading: categoriesLoading } = useCategories();
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const {
    filters = {},
    pagination = { page: 1, limit: 12 },
    sortBy = "created_at",
  } = options;

  const fetchProducts = async () => {
    try {
      if (categoriesLoading) return; // wait for categories

      setLoading(true);
      setError(null);

      let query = supabase
        .from("products")
        .select(
          `
          *,
          category:categories(*),
          variants:product_variants(*),
          images:product_images(*),
          inventory(*)
        `,
          { count: "exact" }
        );

      // ✅ Always active products
      query = query.eq("status", filters.status || "active");

      // ✅ Price filters
      if (filters.price_min !== undefined)
        query = query.gte("price", filters.price_min);
      if (filters.price_max !== undefined)
        query = query.lte("price", filters.price_max);

      // ✅ Search
      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      // ✅ Tags
      if (filters.tags && filters.tags.length > 0)
        query = query.overlaps("tags", filters.tags);

      // ✅ Featured
      if (filters.featured !== undefined)
        query = query.eq("featured", filters.featured);

      // ✅ CATEGORY FILTER FIX
      if (filters.category_id) {
        query = query.eq("category_id", filters.category_id);
      } else if (filters.category_slug && allCategories.length > 0) {
        const current = allCategories.find(
          (c) => c.slug === filters.category_slug
        );

        if (current) {
          let categoryIds: string[] = [current.id];

          // Include subcategories (e.g. men → mens-tshirts)
          const subcats = allCategories.filter(
            (c) => c.parent_id === current.id
          );
          if (subcats.length > 0)
            categoryIds.push(...subcats.map((c) => c.id));

          // Neutral fallback (e.g. mens-tshirts → t-shirts)
          const neutralSlug = current.slug
            .replace(/^mens-/, "")
            .replace(/^womens-/, "");
          const neutral = allCategories.find(
            (c) => c.slug === neutralSlug
          );
          if (neutral && !categoryIds.includes(neutral.id))
            categoryIds.push(neutral.id);

          query = query.in("category_id", categoryIds);
        }
      }

      // ✅ Sorting
      switch (sortBy) {
        case "price-low":
          query = query.order("price", { ascending: true });
          break;
        case "price-high":
          query = query.order("price", { ascending: false });
          break;
        case "name":
          query = query.order("name", { ascending: true });
          break;
        case "featured":
          query = query.order("featured", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      // ✅ Pagination
      const offset = (pagination.page - 1) * pagination.limit;
      query = query.range(offset, offset + pagination.limit - 1);

      const { data, error: fetchError, count } = await query;
      if (fetchError) throw fetchError;

      setProducts(data || []);
      setTotal(count || 0);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [
    filters.category_id,
    filters.category_slug,
    filters.status,
    filters.featured,
    filters.price_min,
    filters.price_max,
    filters.search,
    filters.tags,
    pagination.page,
    pagination.limit,
    sortBy,
    categoriesLoading,
  ]);

  return { products, loading, error, total, refetch: fetchProducts };
}

// ===========================
// ✅ FEATURED PRODUCTS HOOK
// ===========================
export function useFeaturedProducts(limit: number = 4) {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedProducts();
  }, [limit]);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("products")
        .select(
          `
          *,
          category:categories(*),
          variants:product_variants(*),
          images:product_images(*),
          inventory(*)
        `
        )
        .eq("status", "active")
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;
      setProducts(data || []);
    } catch (err: any) {
      console.error("Error fetching featured products:", err);
      setError(err.message || "Failed to fetch featured products");
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch: fetchFeaturedProducts };
}

// ===========================
// ✅ SINGLE PRODUCT HOOK
// ===========================
export function useProduct(slug: string) {
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("products")
        .select(
          `
          *,
          category:categories(*),
          variants:product_variants(*),
          images:product_images(*),
          inventory(*)
        `
        )
        .eq("slug", slug)
        .eq("status", "active")
        .single();

      if (fetchError) throw fetchError;
      setProduct(data);
    } catch (err: any) {
      console.error("Error fetching product:", err);
      setError(err.message || "Failed to fetch product");
    } finally {
      setLoading(false);
    }
  };

  return { product, loading, error, refetch: fetchProduct };
}

// ===========================
// ✅ CATEGORIES HOOK
// ===========================
export function useCategories() {
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
        .from("categories")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });

      if (fetchError) throw fetchError;
      setCategories(data || []);
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      setError(err.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading, error, refetch: fetchCategories };
}
