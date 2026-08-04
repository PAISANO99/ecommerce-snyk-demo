import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCategoriesRequest,
  getFeaturedProductsRequest,
  getProductByIdRequest,
  getProductsRequest,
} from "../services/api";
import type { Category, PaginatedResponse, Product, ProductFilters } from "../types/catalog";

export function useProducts(initialFilters: ProductFilters = {}) {
  const [products, setProducts] = useState<PaginatedResponse<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({ page: 1, limit: 12, ...initialFilters });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProductsRequest(filters);
      setProducts({
        data: data.data,
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  return {
    products,
    loading,
    error,
    filters,
    updateFilters,
    setPage,
    refetch: fetchProducts,
  };
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const data = await getFeaturedProductsRequest();
        if (mounted) setProducts(data.data);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Error al cargar destacados");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void run();
    return () => {
      mounted = false;
    };
  }, []);

  return { products, loading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const data = await getCategoriesRequest();
        if (mounted) setCategories(data.data);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Error al cargar categorías");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void run();
    return () => {
      mounted = false;
    };
  }, []);

  return { categories, loading, error };
}

export function useProduct(productId: number) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId || Number.isNaN(productId)) {
      setLoading(false);
      setError("Producto inválido");
      return;
    }

    let mounted = true;

    const run = async () => {
      try {
        setLoading(true);
        const data = await getProductByIdRequest(productId);
        if (mounted) setProduct(data.data);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Producto no encontrado");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void run();
    return () => {
      mounted = false;
    };
  }, [productId]);

  const hasDiscount = useMemo(() => {
    if (!product?.comparePrice) return false;
    return product.comparePrice > product.price;
  }, [product]);

  return { product, loading, error, hasDiscount };
}
