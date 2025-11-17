// Enhanced product form with better UX
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, X, Plus, Image as ImageIcon, Tag as TagIcon, Search, DollarSign, Package } from 'lucide-react';
import { ProductWithDetails, ProductInsert, ProductUpdate } from '@/types/database';
import { useAdminCategories } from '@/hooks/useAdminProducts';
import { supabase } from '@/integrations/supabase/client';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  original_price: z.number().optional(),
  category_id: z.string().min(1, 'Category is required'),
  status: z.enum(['active', 'inactive', 'draft']),
  featured: z.boolean(),
  tags: z.array(z.string()),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  slug: z.string().min(1, 'Slug is required')
});

type ProductFormData = z.infer<typeof productSchema>;

interface EnhancedProductFormProps {
  product?: ProductWithDetails;
  onSubmit: (data: ProductInsert | ProductUpdate, images?: File[], sizeStock?: Record<string, number>) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

export function EnhancedProductForm({ product, onSubmit, onCancel, loading = false }: EnhancedProductFormProps) {
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [sizeStock, setSizeStock] = useState<Record<string, number>>({
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    XXL: 0
  });

  const { categories, loading: categoriesLoading } = useAdminCategories();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      original_price: product?.original_price || undefined,
      category_id: product?.category_id || '',
      status: product?.status || 'draft',
      featured: product?.featured || false,
      tags: product?.tags || [],
      seo_title: product?.seo_title || '',
      seo_description: product?.seo_description || '',
      slug: product?.slug || ''
    }
  });

  const watchedName = watch('name');
  const watchedTags = watch('tags');
  const watchedPrice = watch('price');
  const watchedOriginalPrice = watch('original_price');

  // Auto-generate slug from name
  useEffect(() => {
    if (watchedName && !product) {
      const slug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', slug);
    }
  }, [watchedName, setValue, product]);

  // Auto-generate SEO title from name
  useEffect(() => {
    if (watchedName && !product && !watch('seo_title')) {
      setValue('seo_title', `${watchedName} - BroHood`);
    }
  }, [watchedName, setValue, product, watch]);

  const handleAddTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      setValue('tags', [...watchedTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  const onFormSubmit = async (data: ProductFormData) => {
    try {
      setError('');
      
      // Pass images and size stock to the parent handler
      const success = await onSubmit(data, imageFiles, sizeStock);
      if (!success) {
        setError('Failed to save product. Please try again.');
        return;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    }
  };

  const calculateDiscount = () => {
    if (watchedOriginalPrice && watchedPrice && watchedOriginalPrice > watchedPrice) {
      const discount = ((watchedOriginalPrice - watchedPrice) / watchedOriginalPrice) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Images & Stock
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            SEO
          </TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="space-y-4">
            {/* Product Name */}
            <div>
              <Label htmlFor="name" className="text-base font-semibold">
                Product Name *
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., Premium Cotton T-Shirt"
                className="mt-1.5"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-base font-semibold">
                Description
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe your product in detail..."
                rows={4}
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Highlight key features, materials, and benefits
              </p>
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className="text-base font-semibold">
                Category *
              </Label>
              <Select
                value={watch('category_id')}
                onValueChange={(value) => setValue('category_id', value)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesLoading ? (
                    <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                  ) : categories.length === 0 ? (
                    <SelectItem value="none" disabled>No categories available</SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <p className="text-sm text-red-600 mt-1">{errors.category_id.message}</p>
              )}
            </div>

            {/* URL Slug */}
            <div>
              <Label htmlFor="slug" className="text-base font-semibold">
                URL Slug *
              </Label>
              <Input
                id="slug"
                {...register('slug')}
                placeholder="product-url-slug"
                className="mt-1.5 font-mono text-sm"
              />
              {errors.slug && (
                <p className="text-sm text-red-600 mt-1">{errors.slug.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Auto-generated from product name. Use lowercase and hyphens.
              </p>
            </div>

            {/* Tags */}
            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                <TagIcon className="h-4 w-4" />
                Tags
              </Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag (e.g., cotton, casual)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag} variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {watchedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {watchedTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-600"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Add tags to help customers find your product
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-4 mt-4">
          <div className="space-y-4">
            {/* Price */}
            <div>
              <Label htmlFor="price" className="text-base font-semibold">
                Selling Price (₹) *
              </Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <Input
                  id="price"
                  type="number"
                  step="1"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="999"
                  className="pl-8"
                />
              </div>
              {errors.price && (
                <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
              )}
            </div>

            {/* Original Price */}
            <div>
              <Label htmlFor="original_price" className="text-base font-semibold">
                Original Price (₹)
              </Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <Input
                  id="original_price"
                  type="number"
                  step="1"
                  {...register('original_price', { valueAsNumber: true })}
                  placeholder="1499"
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Show original price to display discount
              </p>
              {calculateDiscount() > 0 && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800 font-medium">
                    💰 {calculateDiscount()}% discount will be displayed
                  </p>
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status" className="text-base font-semibold">
                Product Status
              </Label>
              <Select
                value={watch('status')}
                onValueChange={(value: any) => setValue('status', value)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      Draft - Not visible to customers
                    </div>
                  </SelectItem>
                  <SelectItem value="active">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Active - Visible and purchasable
                    </div>
                  </SelectItem>
                  <SelectItem value="inactive">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      Inactive - Hidden from customers
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Featured Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="featured" className="text-base font-semibold cursor-pointer">
                  Featured Product
                </Label>
                <p className="text-sm text-gray-500">
                  Display this product on the homepage
                </p>
              </div>
              <Switch
                id="featured"
                checked={watch('featured')}
                onCheckedChange={(checked) => setValue('featured', checked)}
              />
            </div>
          </div>
        </TabsContent>

        {/* Images & Stock Tab */}
        <TabsContent value="media" className="space-y-4 mt-4">
          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Product Images
              </Label>
              <div className="mt-2">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setImageFiles(prev => [...prev, ...files]);
                      
                      // Create previews
                      files.forEach(file => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImagePreviews(prev => [...prev, reader.result as string]);
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                    className="hidden"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      Click to upload images
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG, WEBP up to 5MB each
                    </p>
                  </label>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFiles(prev => prev.filter((_, i) => i !== index));
                            setImagePreviews(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {index === 0 && (
                          <Badge className="absolute bottom-2 left-2 bg-blue-500">
                            Primary
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  First image will be the primary product image
                </p>
              </div>
            </div>

            {/* Stock Management - Size-wise */}
            <div className="border-t pt-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                Size-wise Stock Management
              </Label>
              
              <div className="mt-3 space-y-4">
                {/* Size Stock Inputs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <div key={size} className="space-y-2">
                      <Label htmlFor={`stock-${size}`} className="text-sm font-medium">
                        Size {size}
                      </Label>
                      <Input
                        id={`stock-${size}`}
                        type="number"
                        min="0"
                        value={sizeStock[size]}
                        onChange={(e) => setSizeStock({
                          ...sizeStock,
                          [size]: parseInt(e.target.value) || 0
                        })}
                        placeholder="0"
                        className="text-center"
                      />
                      <div className="text-center">
                        {sizeStock[size] === 0 ? (
                          <Badge variant="destructive" className="text-xs">Out</Badge>
                        ) : sizeStock[size] <= 10 ? (
                          <Badge className="bg-orange-500 text-xs">Low</Badge>
                        ) : (
                          <Badge className="bg-green-500 text-xs">In Stock</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Stock Summary */}
                <div className="p-3 sm:p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">Total Stock</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Across all sizes
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {Object.values(sizeStock).reduce((sum, qty) => sum + qty, 0)}
                      </p>
                      <p className="text-xs text-gray-500">units</p>
                    </div>
                  </div>
                  
                  {/* Size Breakdown */}
                  <div className="mt-3 pt-3 border-t">
                    <div className="grid grid-cols-5 gap-1 sm:gap-2 text-center text-xs">
                      {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                        <div key={size}>
                          <p className="font-medium text-gray-600">{size}</p>
                          <p className={`font-bold ${
                            sizeStock[size] === 0 ? 'text-red-600' :
                            sizeStock[size] <= 10 ? 'text-orange-600' :
                            'text-green-600'
                          }`}>
                            {sizeStock[size]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stock Guidelines */}
                <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs sm:text-sm font-semibold text-blue-900 mb-2">📋 Stock Guidelines:</p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• <strong>Popular sizes (M, L):</strong> Recommended 30-50 units</li>
                    <li>• <strong>Regular sizes (S, XL):</strong> Recommended 20-30 units</li>
                    <li>• <strong>Less common (XXL):</strong> Recommended 10-20 units</li>
                    <li>• <strong>Stock ≤ 10:</strong> Shows "Hurry up!" warning to customers</li>
                    <li>• <strong>Stock = 0:</strong> Size becomes unavailable for purchase</li>
                  </ul>
                </div>

                {/* Low Stock Warning */}
                {Object.entries(sizeStock).some(([_, qty]) => qty > 0 && qty <= 10) && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-orange-800">
                      ⚠️ <strong>Low Stock Alert:</strong> {
                        Object.entries(sizeStock)
                          .filter(([_, qty]) => qty > 0 && qty <= 10)
                          .map(([size]) => size)
                          .join(', ')
                      } {Object.entries(sizeStock).filter(([_, qty]) => qty > 0 && qty <= 10).length === 1 ? 'has' : 'have'} low stock
                    </p>
                  </div>
                )}

                {/* Out of Stock Warning */}
                {Object.entries(sizeStock).some(([_, qty]) => qty === 0) && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-red-800">
                      ❌ <strong>Out of Stock:</strong> {
                        Object.entries(sizeStock)
                          .filter(([_, qty]) => qty === 0)
                          .map(([size]) => size)
                          .join(', ')
                      } {Object.entries(sizeStock).filter(([_, qty]) => qty === 0).length === 1 ? 'is' : 'are'} out of stock
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>SEO Tip:</strong> Good SEO helps customers find your products on search engines like Google.
              </p>
            </div>

            {/* SEO Title */}
            <div>
              <Label htmlFor="seo_title" className="text-base font-semibold">
                SEO Title
              </Label>
              <Input
                id="seo_title"
                {...register('seo_title')}
                placeholder="Premium Cotton T-Shirt - BroHood"
                className="mt-1.5"
                maxLength={60}
              />
              <p className="text-xs text-gray-500 mt-1">
                {watch('seo_title')?.length || 0}/60 characters (optimal: 50-60)
              </p>
            </div>

            {/* SEO Description */}
            <div>
              <Label htmlFor="seo_description" className="text-base font-semibold">
                SEO Description
              </Label>
              <Textarea
                id="seo_description"
                {...register('seo_description')}
                placeholder="Shop premium cotton t-shirts at BroHood. Comfortable, stylish, and perfect for everyday wear."
                rows={3}
                className="mt-1.5"
                maxLength={160}
              />
              <p className="text-xs text-gray-500 mt-1">
                {watch('seo_description')?.length || 0}/160 characters (optimal: 150-160)
              </p>
            </div>

            {/* Preview */}
            <div className="p-4 border rounded-lg bg-gray-50">
              <p className="text-xs text-gray-500 mb-2">Search Engine Preview:</p>
              <div className="space-y-1">
                <p className="text-blue-600 text-sm font-medium">
                  {watch('seo_title') || watch('name') || 'Product Title'}
                </p>
                <p className="text-xs text-green-700">
                  brohood.com/product/{watch('slug') || 'product-slug'}
                </p>
                <p className="text-sm text-gray-600">
                  {watch('seo_description') || watch('description') || 'Product description will appear here...'}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="min-w-[120px]">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            product ? 'Update Product' : 'Create Product'
          )}
        </Button>
      </div>
    </form>
  );
}
