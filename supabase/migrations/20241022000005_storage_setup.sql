-- Set up Supabase Storage for product images and other assets
-- This migration creates storage buckets and policies

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for category images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'category-images',
  'category-images',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for general assets (banners, logos, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assets',
  'assets',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for product images
-- Allow public read access
CREATE POLICY "Public read access for product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

-- Allow admins to update/delete product images
CREATE POLICY "Admins can manage product images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'product-images' 
    AND EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND active = true
    )
  );

-- Storage policies for category images
-- Allow public read access
CREATE POLICY "Public read access for category images" ON storage.objects
  FOR SELECT USING (bucket_id = 'category-images');

-- Allow admins to manage category images
CREATE POLICY "Admins can manage category images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'category-images' 
    AND EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND active = true
    )
  );

-- Storage policies for general assets
-- Allow public read access
CREATE POLICY "Public read access for assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'assets');

-- Allow admins to manage assets
CREATE POLICY "Admins can manage assets" ON storage.objects
  FOR ALL USING (
    bucket_id = 'assets' 
    AND EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND active = true
    )
  );

-- Function to get storage URL for images
CREATE OR REPLACE FUNCTION get_storage_url(bucket_name TEXT, file_path TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://' || (SELECT project_ref FROM pg_stat_statements LIMIT 1) || '.supabase.co/storage/v1/object/public/' || bucket_name || '/' || file_path;
END;
$$ LANGUAGE plpgsql;

-- Function to delete old product images when product is deleted
CREATE OR REPLACE FUNCTION cleanup_product_images()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete associated images from storage
  DELETE FROM storage.objects 
  WHERE bucket_id = 'product-images' 
  AND name LIKE 'products/' || OLD.id::text || '/%';
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to cleanup images when product is deleted
CREATE TRIGGER cleanup_product_images_trigger
  AFTER DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_product_images();

-- Function to generate unique filename for uploads
CREATE OR REPLACE FUNCTION generate_unique_filename(
  original_filename TEXT,
  folder_path TEXT DEFAULT ''
)
RETURNS TEXT AS $$
DECLARE
  file_extension TEXT;
  base_name TEXT;
  unique_name TEXT;
BEGIN
  -- Extract file extension
  file_extension := LOWER(RIGHT(original_filename, 4));
  
  -- Generate unique filename with timestamp and random string
  base_name := REPLACE(LOWER(LEFT(original_filename, LENGTH(original_filename) - 4)), ' ', '-');
  unique_name := folder_path || base_name || '-' || EXTRACT(EPOCH FROM NOW())::TEXT || '-' || SUBSTR(MD5(RANDOM()::TEXT), 1, 8) || file_extension;
  
  RETURN unique_name;
END;
$$ LANGUAGE plpgsql;