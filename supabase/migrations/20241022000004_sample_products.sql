-- Sample products and categories for BroHood e-commerce site
-- This migration adds sample data to test the frontend

-- Insert sample categories (if not already exists)
INSERT INTO categories (name, description, slug, sort_order, active) VALUES
('T-Shirts', 'Comfortable and stylish t-shirts for everyday wear', 't-shirts', 1, true),
('Shirts', 'Formal and casual shirts for all occasions', 'shirts', 2, true),
('Jeans', 'Premium denim jeans in various fits and styles', 'jeans', 3, true),
('Hoodies', 'Cozy hoodies and sweatshirts for casual comfort', 'hoodies', 4, true),
('Trousers', 'Formal and casual trousers for professional look', 'trousers', 5, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, original_price, category_id, status, featured, tags, seo_title, seo_description, slug) VALUES
-- T-Shirts
(
  'Premium Black T-Shirt',
  'Ultra-soft premium cotton t-shirt with perfect fit. Made from 100% organic cotton for maximum comfort and durability.',
  999,
  1499,
  (SELECT id FROM categories WHERE slug = 't-shirts'),
  'active',
  true,
  ARRAY['premium', 'cotton', 'black', 'casual'],
  'Premium Black T-Shirt - BroHood',
  'Shop premium black t-shirt made from organic cotton. Comfortable, stylish and perfect for everyday wear.',
  'premium-black-t-shirt'
),
(
  'Classic White T-Shirt',
  'Essential white t-shirt made from breathable cotton blend. Perfect for layering or wearing on its own.',
  899,
  1299,
  (SELECT id FROM categories WHERE slug = 't-shirts'),
  'active',
  true,
  ARRAY['classic', 'white', 'cotton', 'essential'],
  'Classic White T-Shirt - BroHood',
  'Essential white t-shirt for your wardrobe. Made from premium cotton blend for comfort.',
  'classic-white-t-shirt'
),
(
  'Graphic Print T-Shirt',
  'Trendy graphic print t-shirt with unique design. Made from soft cotton with vibrant colors.',
  1199,
  1699,
  (SELECT id FROM categories WHERE slug = 't-shirts'),
  'active',
  false,
  ARRAY['graphic', 'print', 'trendy', 'colorful'],
  'Graphic Print T-Shirt - BroHood',
  'Trendy graphic print t-shirt with unique designs. Express your style with vibrant colors.',
  'graphic-print-t-shirt'
),

-- Shirts
(
  'Elegant White Casual Shirt',
  'Sophisticated white casual shirt perfect for both office and casual outings. Made from premium cotton fabric.',
  1799,
  2299,
  (SELECT id FROM categories WHERE slug = 'shirts'),
  'active',
  true,
  ARRAY['white', 'casual', 'elegant', 'cotton'],
  'Elegant White Casual Shirt - BroHood',
  'Sophisticated white casual shirt for office and casual wear. Premium cotton fabric.',
  'elegant-white-casual-shirt'
),
(
  'Blue Formal Shirt',
  'Professional blue formal shirt with perfect tailoring. Ideal for business meetings and formal events.',
  2199,
  2799,
  (SELECT id FROM categories WHERE slug = 'shirts'),
  'active',
  false,
  ARRAY['blue', 'formal', 'professional', 'business'],
  'Blue Formal Shirt - BroHood',
  'Professional blue formal shirt with perfect tailoring for business and formal events.',
  'blue-formal-shirt'
),
(
  'Checkered Casual Shirt',
  'Stylish checkered casual shirt with modern fit. Perfect for weekend outings and casual meetings.',
  1599,
  2099,
  (SELECT id FROM categories WHERE slug = 'shirts'),
  'active',
  false,
  ARRAY['checkered', 'casual', 'modern', 'weekend'],
  'Checkered Casual Shirt - BroHood',
  'Stylish checkered casual shirt with modern fit for weekend and casual occasions.',
  'checkered-casual-shirt'
),

-- Jeans
(
  'Classic Blue Denim Jeans',
  'Timeless blue denim jeans with perfect fit and comfort. Made from premium denim fabric with stretch.',
  2499,
  3499,
  (SELECT id FROM categories WHERE slug = 'jeans'),
  'active',
  true,
  ARRAY['blue', 'denim', 'classic', 'stretch'],
  'Classic Blue Denim Jeans - BroHood',
  'Timeless blue denim jeans with perfect fit. Premium denim fabric with stretch for comfort.',
  'classic-blue-denim-jeans'
),
(
  'Black Skinny Jeans',
  'Modern black skinny jeans with sleek silhouette. Perfect for contemporary fashion and night outs.',
  2299,
  2999,
  (SELECT id FROM categories WHERE slug = 'jeans'),
  'active',
  false,
  ARRAY['black', 'skinny', 'modern', 'sleek'],
  'Black Skinny Jeans - BroHood',
  'Modern black skinny jeans with sleek silhouette for contemporary fashion.',
  'black-skinny-jeans'
),
(
  'Distressed Denim Jeans',
  'Trendy distressed denim jeans with vintage appeal. Comfortable fit with stylish distressed details.',
  2799,
  3599,
  (SELECT id FROM categories WHERE slug = 'jeans'),
  'active',
  false,
  ARRAY['distressed', 'vintage', 'trendy', 'denim'],
  'Distressed Denim Jeans - BroHood',
  'Trendy distressed denim jeans with vintage appeal and stylish details.',
  'distressed-denim-jeans'
),

-- Hoodies
(
  'Modern Black Hoodie',
  'Comfortable black hoodie with premium fleece lining. Perfect for casual wear and layering.',
  1999,
  2999,
  (SELECT id FROM categories WHERE slug = 'hoodies'),
  'active',
  true,
  ARRAY['black', 'hoodie', 'fleece', 'comfortable'],
  'Modern Black Hoodie - BroHood',
  'Comfortable black hoodie with premium fleece lining for casual wear and layering.',
  'modern-black-hoodie'
),
(
  'Grey Pullover Hoodie',
  'Cozy grey pullover hoodie with soft interior. Ideal for cool weather and relaxed occasions.',
  1799,
  2399,
  (SELECT id FROM categories WHERE slug = 'hoodies'),
  'active',
  false,
  ARRAY['grey', 'pullover', 'cozy', 'soft'],
  'Grey Pullover Hoodie - BroHood',
  'Cozy grey pullover hoodie with soft interior for cool weather and relaxed occasions.',
  'grey-pullover-hoodie'
),

-- Trousers
(
  'Formal Black Trousers',
  'Professional black formal trousers with perfect tailoring. Essential for business and formal occasions.',
  1899,
  2499,
  (SELECT id FROM categories WHERE slug = 'trousers'),
  'active',
  false,
  ARRAY['black', 'formal', 'professional', 'tailored'],
  'Formal Black Trousers - BroHood',
  'Professional black formal trousers with perfect tailoring for business occasions.',
  'formal-black-trousers'
),
(
  'Casual Khaki Chinos',
  'Versatile khaki chinos perfect for casual and semi-formal occasions. Comfortable fit with modern styling.',
  1699,
  2199,
  (SELECT id FROM categories WHERE slug = 'trousers'),
  'active',
  false,
  ARRAY['khaki', 'chinos', 'casual', 'versatile'],
  'Casual Khaki Chinos - BroHood',
  'Versatile khaki chinos for casual and semi-formal occasions with comfortable fit.',
  'casual-khaki-chinos'
);

-- Insert product images
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES
-- T-Shirts images
((SELECT id FROM products WHERE slug = 'premium-black-t-shirt'), '/assets/product-tshirt-1.jpg', 'Premium Black T-Shirt Front View', 1, true),
((SELECT id FROM products WHERE slug = 'classic-white-t-shirt'), '/assets/product-tshirt-1.jpg', 'Classic White T-Shirt Front View', 1, true),
((SELECT id FROM products WHERE slug = 'graphic-print-t-shirt'), '/assets/product-tshirt-1.jpg', 'Graphic Print T-Shirt Front View', 1, true),

-- Shirts images
((SELECT id FROM products WHERE slug = 'elegant-white-casual-shirt'), '/assets/product-shirt-1.jpg', 'Elegant White Casual Shirt Front View', 1, true),
((SELECT id FROM products WHERE slug = 'blue-formal-shirt'), '/assets/product-shirt-1.jpg', 'Blue Formal Shirt Front View', 1, true),
((SELECT id FROM products WHERE slug = 'checkered-casual-shirt'), '/assets/product-shirt-1.jpg', 'Checkered Casual Shirt Front View', 1, true),

-- Jeans images
((SELECT id FROM products WHERE slug = 'classic-blue-denim-jeans'), '/assets/product-jeans-1.jpg', 'Classic Blue Denim Jeans Front View', 1, true),
((SELECT id FROM products WHERE slug = 'black-skinny-jeans'), '/assets/product-jeans-1.jpg', 'Black Skinny Jeans Front View', 1, true),
((SELECT id FROM products WHERE slug = 'distressed-denim-jeans'), '/assets/product-jeans-1.jpg', 'Distressed Denim Jeans Front View', 1, true),

-- Hoodies images
((SELECT id FROM products WHERE slug = 'modern-black-hoodie'), '/assets/product-hoodie-1.jpg', 'Modern Black Hoodie Front View', 1, true),
((SELECT id FROM products WHERE slug = 'grey-pullover-hoodie'), '/assets/product-hoodie-1.jpg', 'Grey Pullover Hoodie Front View', 1, true),

-- Trousers images
((SELECT id FROM products WHERE slug = 'formal-black-trousers'), '/assets/product-shirt-1.jpg', 'Formal Black Trousers Front View', 1, true),
((SELECT id FROM products WHERE slug = 'casual-khaki-chinos'), '/assets/product-shirt-1.jpg', 'Casual Khaki Chinos Front View', 1, true);

-- Insert product variants (sizes)
INSERT INTO product_variants (product_id, size, sku, price_adjustment) VALUES
-- T-Shirts variants
((SELECT id FROM products WHERE slug = 'premium-black-t-shirt'), 'S', 'PBT-S-001', 0),
((SELECT id FROM products WHERE slug = 'premium-black-t-shirt'), 'M', 'PBT-M-001', 0),
((SELECT id FROM products WHERE slug = 'premium-black-t-shirt'), 'L', 'PBT-L-001', 0),
((SELECT id FROM products WHERE slug = 'premium-black-t-shirt'), 'XL', 'PBT-XL-001', 0),
((SELECT id FROM products WHERE slug = 'premium-black-t-shirt'), 'XXL', 'PBT-XXL-001', 100),

((SELECT id FROM products WHERE slug = 'classic-white-t-shirt'), 'S', 'CWT-S-001', 0),
((SELECT id FROM products WHERE slug = 'classic-white-t-shirt'), 'M', 'CWT-M-001', 0),
((SELECT id FROM products WHERE slug = 'classic-white-t-shirt'), 'L', 'CWT-L-001', 0),
((SELECT id FROM products WHERE slug = 'classic-white-t-shirt'), 'XL', 'CWT-XL-001', 0),
((SELECT id FROM products WHERE slug = 'classic-white-t-shirt'), 'XXL', 'CWT-XXL-001', 100),

-- Shirts variants
((SELECT id FROM products WHERE slug = 'elegant-white-casual-shirt'), 'S', 'EWCS-S-001', 0),
((SELECT id FROM products WHERE slug = 'elegant-white-casual-shirt'), 'M', 'EWCS-M-001', 0),
((SELECT id FROM products WHERE slug = 'elegant-white-casual-shirt'), 'L', 'EWCS-L-001', 0),
((SELECT id FROM products WHERE slug = 'elegant-white-casual-shirt'), 'XL', 'EWCS-XL-001', 0),
((SELECT id FROM products WHERE slug = 'elegant-white-casual-shirt'), 'XXL', 'EWCS-XXL-001', 200),

-- Jeans variants
((SELECT id FROM products WHERE slug = 'classic-blue-denim-jeans'), '30', 'CBDJ-30-001', 0),
((SELECT id FROM products WHERE slug = 'classic-blue-denim-jeans'), '32', 'CBDJ-32-001', 0),
((SELECT id FROM products WHERE slug = 'classic-blue-denim-jeans'), '34', 'CBDJ-34-001', 0),
((SELECT id FROM products WHERE slug = 'classic-blue-denim-jeans'), '36', 'CBDJ-36-001', 0),
((SELECT id FROM products WHERE slug = 'classic-blue-denim-jeans'), '38', 'CBDJ-38-001', 0),

-- Hoodies variants
((SELECT id FROM products WHERE slug = 'modern-black-hoodie'), 'S', 'MBH-S-001', 0),
((SELECT id FROM products WHERE slug = 'modern-black-hoodie'), 'M', 'MBH-M-001', 0),
((SELECT id FROM products WHERE slug = 'modern-black-hoodie'), 'L', 'MBH-L-001', 0),
((SELECT id FROM products WHERE slug = 'modern-black-hoodie'), 'XL', 'MBH-XL-001', 0),
((SELECT id FROM products WHERE slug = 'modern-black-hoodie'), 'XXL', 'MBH-XXL-001', 200);

-- Insert inventory for products
INSERT INTO inventory (product_id, variant_id, quantity, low_stock_threshold) VALUES
-- T-Shirts inventory
((SELECT id FROM products WHERE slug = 'premium-black-t-shirt'), (SELECT id FROM product_variants WHERE sku = 'PBT-S-001'), 25, 5),
((SELECT id FROM products WHERE slug = 'premium-black-t-shirt'), (SELECT id FROM product_variants WHERE sku = 'PBT-M-001'), 30, 5),
((SELECT id FROM products WHERE slug = 'premium-black-t-shirt'), (SELECT id FROM product_variants WHERE sku = 'PBT-L-001'), 35, 5),
((SELECT id FROM products WHERE slug = 'premium-black-t-shirt'), (SELECT id FROM product_variants WHERE sku = 'PBT-XL-001'), 20, 5),
((SELECT id FROM products WHERE slug = 'premium-black-t-shirt'), (SELECT id FROM product_variants WHERE sku = 'PBT-XXL-001'), 15, 5),

((SELECT id FROM products WHERE slug = 'classic-white-t-shirt'), (SELECT id FROM product_variants WHERE sku = 'CWT-S-001'), 20, 5),
((SELECT id FROM products WHERE slug = 'classic-white-t-shirt'), (SELECT id FROM product_variants WHERE sku = 'CWT-M-001'), 25, 5),
((SELECT id FROM products WHERE slug = 'classic-white-t-shirt'), (SELECT id FROM product_variants WHERE sku = 'CWT-L-001'), 30, 5),
((SELECT id FROM products WHERE slug = 'classic-white-t-shirt'), (SELECT id FROM product_variants WHERE sku = 'CWT-XL-001'), 18, 5),
((SELECT id FROM products WHERE slug = 'classic-white-t-shirt'), (SELECT id FROM product_variants WHERE sku = 'CWT-XXL-001'), 12, 5),

-- Shirts inventory
((SELECT id FROM products WHERE slug = 'elegant-white-casual-shirt'), (SELECT id FROM product_variants WHERE sku = 'EWCS-S-001'), 15, 3),
((SELECT id FROM products WHERE slug = 'elegant-white-casual-shirt'), (SELECT id FROM product_variants WHERE sku = 'EWCS-M-001'), 20, 3),
((SELECT id FROM products WHERE slug = 'elegant-white-casual-shirt'), (SELECT id FROM product_variants WHERE sku = 'EWCS-L-001'), 25, 3),
((SELECT id FROM products WHERE slug = 'elegant-white-casual-shirt'), (SELECT id FROM product_variants WHERE sku = 'EWCS-XL-001'), 18, 3),
((SELECT id FROM products WHERE slug = 'elegant-white-casual-shirt'), (SELECT id FROM product_variants WHERE sku = 'EWCS-XXL-001'), 10, 3),

-- Jeans inventory
((SELECT id FROM products WHERE slug = 'classic-blue-denim-jeans'), (SELECT id FROM product_variants WHERE sku = 'CBDJ-30-001'), 12, 3),
((SELECT id FROM products WHERE slug = 'classic-blue-denim-jeans'), (SELECT id FROM product_variants WHERE sku = 'CBDJ-32-001'), 18, 3),
((SELECT id FROM products WHERE slug = 'classic-blue-denim-jeans'), (SELECT id FROM product_variants WHERE sku = 'CBDJ-34-001'), 22, 3),
((SELECT id FROM products WHERE slug = 'classic-blue-denim-jeans'), (SELECT id FROM product_variants WHERE sku = 'CBDJ-36-001'), 15, 3),
((SELECT id FROM products WHERE slug = 'classic-blue-denim-jeans'), (SELECT id FROM product_variants WHERE sku = 'CBDJ-38-001'), 10, 3),

-- Hoodies inventory
((SELECT id FROM products WHERE slug = 'modern-black-hoodie'), (SELECT id FROM product_variants WHERE sku = 'MBH-S-001'), 18, 4),
((SELECT id FROM products WHERE slug = 'modern-black-hoodie'), (SELECT id FROM product_variants WHERE sku = 'MBH-M-001'), 25, 4),
((SELECT id FROM products WHERE slug = 'modern-black-hoodie'), (SELECT id FROM product_variants WHERE sku = 'MBH-L-001'), 30, 4),
((SELECT id FROM products WHERE slug = 'modern-black-hoodie'), (SELECT id FROM product_variants WHERE sku = 'MBH-XL-001'), 20, 4),
((SELECT id FROM products WHERE slug = 'modern-black-hoodie'), (SELECT id FROM product_variants WHERE sku = 'MBH-XXL-001'), 12, 4);