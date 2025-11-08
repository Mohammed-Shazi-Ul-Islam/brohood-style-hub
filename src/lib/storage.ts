// Supabase Storage utilities for file uploads and management
import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  bucket: string,
  folder: string = '',
  customName?: string
): Promise<UploadResult> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = customName || `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    const filePath = folder ? `${folder}/${fileName}.${fileExt}` : `${fileName}.${fileExt}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    return {
      url: '',
      path: '',
      error: error.message || 'Upload failed'
    };
  }
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  bucket: string,
  folder: string = ''
): Promise<UploadResult[]> {
  const uploadPromises = files.map(file => uploadFile(file, bucket, folder));
  return Promise.all(uploadPromises);
}

/**
 * Delete file from storage
 */
export async function deleteFile(bucket: string, filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

/**
 * Delete multiple files
 */
export async function deleteMultipleFiles(bucket: string, filePaths: string[]): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove(filePaths);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Delete multiple files error:', error);
    return false;
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(bucket: string, filePath: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}

/**
 * List files in a folder
 */
export async function listFiles(bucket: string, folder: string = '') {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: 100,
        offset: 0
      });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('List files error:', error);
    return [];
  }
}

/**
 * Upload product image and update product record
 */
export async function uploadProductImage(
  productId: string,
  file: File,
  isPrimary: boolean = false,
  altText?: string
): Promise<UploadResult & { imageId?: string }> {
  try {
    // Upload to storage
    const uploadResult = await uploadFile(file, 'product-images', `products/${productId}`);
    
    if (uploadResult.error) {
      return uploadResult;
    }

    // Save to database
    const { data: imageData, error: dbError } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        image_url: uploadResult.url,
        alt_text: altText || file.name,
        is_primary: isPrimary,
        sort_order: isPrimary ? 0 : 999
      })
      .select()
      .single();

    if (dbError) {
      // If database insert fails, cleanup uploaded file
      await deleteFile('product-images', uploadResult.path);
      throw dbError;
    }

    // If this is primary image, update other images to not be primary
    if (isPrimary) {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId)
        .neq('id', imageData.id);
    }

    return {
      ...uploadResult,
      imageId: imageData.id
    };
  } catch (error: any) {
    console.error('Upload product image error:', error);
    return {
      url: '',
      path: '',
      error: error.message || 'Failed to upload product image'
    };
  }
}

/**
 * Delete product image
 */
export async function deleteProductImage(imageId: string): Promise<boolean> {
  try {
    // Get image details first
    const { data: image, error: fetchError } = await supabase
      .from('product_images')
      .select('image_url')
      .eq('id', imageId)
      .single();

    if (fetchError || !image) {
      throw new Error('Image not found');
    }

    // Extract path from URL
    const url = new URL(image.image_url);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(-3).join('/'); // Get last 3 parts: products/id/filename

    // Delete from database first
    const { error: dbError } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId);

    if (dbError) {
      throw dbError;
    }

    // Delete from storage
    await deleteFile('product-images', filePath);

    return true;
  } catch (error) {
    console.error('Delete product image error:', error);
    return false;
  }
}

/**
 * Validate file type and size
 */
export function validateFile(file: File, maxSizeMB: number = 5, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']): string | null {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File size too large. Maximum size: ${maxSizeMB}MB`;
  }

  return null;
}

/**
 * Compress image before upload (optional utility)
 */
export function compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      }, file.type, quality);
    };

    img.src = URL.createObjectURL(file);
  });
}