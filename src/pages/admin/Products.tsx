// Dynamic admin products page with full CRUD operations
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { EnhancedProductForm } from '@/components/admin/EnhancedProductForm';
import { useAdminProducts, useAdminCategories } from '@/hooks/useAdminProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Package,
  Filter,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { ProductWithDetails, ProductInsert, ProductUpdate } from '@/types/database';

export function AdminProducts() {
  const navigate = useNavigate();
  const { products, loading, error, fetchProducts, createProduct, updateProduct, deleteProduct } = useAdminProducts();
  const { categories } = useAdminCategories();
  
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithDetails | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login', { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreateProduct = async (data: ProductInsert, images?: File[], stockQty?: number) => {
    setActionLoading(true);
    try {
      const newProduct = await createProduct(data);
      if (newProduct) {
        // Upload images if provided
        if (images && images.length > 0) {
          await uploadProductImages(newProduct.id, images);
        }
        
        // Create inventory record if stock quantity provided
        if (stockQty !== undefined && stockQty > 0) {
          await createInventoryRecord(newProduct.id, stockQty);
        }
        
        setSuccessMessage('Product created successfully!');
        setShowForm(false);
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Refresh the products list to show the new product
        await fetchProducts();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error creating product:', err);
      setError(err.message || 'Failed to create product');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const uploadProductImages = async (productId: string, images: File[]) => {
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `products/${productId}/${Date.now()}-${i}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        continue;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      // Save to product_images table
      const { error: dbError } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          image_url: publicUrl,
          alt_text: file.name,
          sort_order: i,
          is_primary: i === 0 // First image is primary
        });

      if (dbError) {
        console.error('Error saving image record:', dbError);
      }
    }
  };

  const createInventoryRecord = async (productId: string, quantity: number) => {
    const { error } = await supabase
      .from('inventory')
      .insert({
        product_id: productId,
        variant_id: null, // No variant for simple products
        quantity: quantity,
        reserved_quantity: 0,
        low_stock_threshold: 10
      });

    if (error) {
      console.error('Error creating inventory:', error);
      throw error;
    }
  };

  const handleUpdateProduct = async (data: ProductUpdate, images?: File[], stockQty?: number) => {
    if (!editingProduct) return false;
    
    setActionLoading(true);
    try {
      const success = await updateProduct(editingProduct.id, data);
      if (success) {
        // Upload new images if provided
        if (images && images.length > 0) {
          await uploadProductImages(editingProduct.id, images);
        }
        
        // Update inventory if stock quantity provided
        if (stockQty !== undefined) {
          await updateInventoryRecord(editingProduct.id, stockQty);
        }
        
        setSuccessMessage('Product updated successfully!');
        setShowForm(false);
        setEditingProduct(undefined);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
      return success;
    } finally {
      setActionLoading(false);
    }
  };

  const updateInventoryRecord = async (productId: string, quantity: number) => {
    // Check if inventory record exists
    const { data: existing } = await supabase
      .from('inventory')
      .select('id')
      .eq('product_id', productId)
      .is('variant_id', null)
      .maybeSingle();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('inventory')
        .update({ quantity })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Create new
      await createInventoryRecord(productId, quantity);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setActionLoading(true);
    try {
      const success = await deleteProduct(id);
      if (success) {
        setSuccessMessage('Product deleted successfully!');
        setDeleteConfirm(null);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (product: ProductWithDetails) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(undefined);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      active: 'default',
      inactive: 'secondary',
      draft: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Products</h1>
            <p className="text-gray-500 mt-2 text-lg">
              Manage your product catalog
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-black hover:bg-gray-800 text-white px-6 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Product
          </Button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="border-gray-100 shadow-sm animate-slide-up">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchProducts}
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="border-gray-100 shadow-sm animate-slide-up">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center text-xl">
              <Package className="mr-3 h-6 w-6 text-gray-700" />
              Product List
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && products.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Get started by creating a new product'}
                </p>
                {!searchQuery && statusFilter === 'all' && categoryFilter === 'all' && (
                  <Button onClick={() => setShowForm(true)} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const primaryImage = product.images?.find(img => img.is_primary);
                      const totalStock = product.inventory?.reduce((sum, inv) => sum + inv.quantity, 0) || 0;
                      
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            {primaryImage ? (
                              <img
                                src={primaryImage.image_url}
                                alt={product.name}
                                className="h-12 w-12 object-cover rounded"
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">₹{product.price}</div>
                              {product.original_price && (
                                <div className="text-sm text-gray-500 line-through">
                                  ₹{product.original_price}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(product.status)}</TableCell>
                          <TableCell>
                            <span className={totalStock < 10 ? 'text-red-600 font-medium' : ''}>
                              {totalStock}
                            </span>
                          </TableCell>
                          <TableCell>
                            {product.featured && (
                              <Badge variant="secondary">Featured</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`/product/${product.slug}`, '_blank')}
                                title="View Product"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClick(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteConfirm(product.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Form Dialog */}
        <Dialog open={showForm} onOpenChange={handleCloseForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Create New Product'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct
                  ? 'Update product information and settings'
                  : 'Add a new product to your catalog'}
              </DialogDescription>
            </DialogHeader>
            <EnhancedProductForm
              product={editingProduct}
              onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
              onCancel={handleCloseForm}
              loading={actionLoading}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this product? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-4 mt-4">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDeleteProduct(deleteConfirm)}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Product'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
