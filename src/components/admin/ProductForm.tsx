// Product creation and editing form for admin
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, X, Plus, Trash2 } from 'lucide-react';
import { ProductWithDetails, ProductInsert, ProductUpdate } from '@/types/database';
import { useAdminCategories } from '@/hooks/useAdminProducts';
import { uploadProductImage, validateFile, deleteProductImage } from '@/lib/storage';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
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

interface ProductFormProps {
  product?: ProductWithDetails;
  onSubmit: (data: ProductInsert | ProductUpdate) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

export function ProductForm({ product, onSubmit, onCancel, loading = false }: ProductFormProps) {
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState(product?.images || []);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState('');

  const { categories, loading: categoriesLoading } = useAdminCategories();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
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

  const handleAddTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      setValue('tags', [...watchedTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate files
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const error = validateFile(file, 5, ['image/jpeg', 'image/png', 'image/webp']);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
      return;
    }

    setImages(prev => [...prev, ...validFiles]);
    setError('');
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = async (imageId: string) => {
    const success = await deleteProductImage(imageId);
    if (success) {
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    }
  };

  const onFormSubmit = async (data: ProductFormData) => {
    try {
      setError('');
      
      // Submit product data first
      const success = await onSubmit(data);
      
      if (success && images.length > 0 && product) {
        // Upload new images if editing existing product
        setUploadingImages(true);
        
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const isPrimary = existingImages.length === 0 && i === 0; // First image is primary if no existing images
          
          await uploadProductImage(product.id, file, isPrimary, file.name);
        }
        
        setUploadingImages(false);
        setImages([]);
      }
      
      if (success) {
        reset();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
      setUploadingImages(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Enter product description"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                {...register('slug')}
                placeholder="product-url-slug"
              />
              {errors.slug && (
                <p className="text-sm text-red-600 mt-1">{errors.slug.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={watch('category_id')}
                onValueChange={(value) => setValue('category_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesLoading ? (
                    <SelectItem value="" disabled>Loading...</SelectItem>
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
          </CardContent>
        </Card>

        {/* Pricing & Status */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="original_price">Original Price (₹)</Label>
              <Input
                id="original_price"
                type="number"
                step="0.01"
                {...register('original_price', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(value: any) => setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={watch('featured')}
                onCheckedChange={(checked) => setValue('featured', checked)}
              />
              <Label htmlFor="featured">Featured Product</Label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="seo_title">SEO Title</Label>
            <Input
              id="seo_title"
              {...register('seo_title')}
              placeholder="SEO optimized title"
            />
          </div>
          <div>
            <Label htmlFor="seo_description">SEO Description</Label>
            <Textarea
              id="seo_description"
              {...register('seo_description')}
              placeholder="SEO meta description"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Product Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div>
              <Label>Current Images</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {existingImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.image_url}
                      alt={image.alt_text || 'Product image'}
                      className="w-full h-32 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveExistingImage(image.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    {image.is_primary && (
                      <Badge className="absolute bottom-1 left-1 text-xs">Primary</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          <div>
            <Label htmlFor="images">Upload New Images</Label>
            <Input
              id="images"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Upload JPEG, PNG, or WebP images. Max 5MB each.
            </p>
          </div>

          {/* Preview New Images */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || uploadingImages}>
          {loading || uploadingImages ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploadingImages ? 'Uploading Images...' : 'Saving...'}
            </>
          ) : (
            product ? 'Update Product' : 'Create Product'
          )}
        </Button>
      </div>
    </form>
  );
}