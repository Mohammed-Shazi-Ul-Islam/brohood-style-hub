-- Add sizes to existing products
-- This migration adds standard clothing sizes to products

-- First, let's add variants for products that don't have them
-- We'll add sizes: S, M, L, XL, XXL for clothing items

DO $$
DECLARE
  product_record RECORD;
  size_array TEXT[] := ARRAY['S', 'M', 'L', 'XL', 'XXL'];
  size_text TEXT;
  variant_id UUID;
BEGIN
  -- Loop through all active products
  FOR product_record IN 
    SELECT id, name, slug FROM products WHERE status = 'active'
  LOOP
    -- Check if product already has variants
    IF NOT EXISTS (SELECT 1 FROM product_variants WHERE product_id = product_record.id) THEN
      -- Add variants for each size
      FOREACH size_text IN ARRAY size_array
      LOOP
        -- Insert variant
        INSERT INTO product_variants (product_id, size, sku, price_adjustment)
        VALUES (
          product_record.id,
          size_text,
          product_record.slug || '-' || LOWER(size_text),
          0
        )
        RETURNING id INTO variant_id;
        
        -- Add inventory for this variant
        INSERT INTO inventory (product_id, variant_id, quantity, reserved_quantity, low_stock_threshold)
        VALUES (
          product_record.id,
          variant_id,
          CASE 
            WHEN size_text IN ('M', 'L') THEN 50  -- More stock for popular sizes
            WHEN size_text IN ('S', 'XL') THEN 30
            ELSE 20  -- Less stock for XXL
          END,
          0,
          10
        );
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- Create function to get available stock for a variant
CREATE OR REPLACE FUNCTION get_available_stock(variant_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  available INTEGER;
BEGIN
  SELECT (quantity - reserved_quantity) INTO available
  FROM inventory
  WHERE variant_id = variant_uuid;
  
  RETURN COALESCE(available, 0);
END;
$$ LANGUAGE plpgsql;

-- Create function to reserve stock when order is placed
CREATE OR REPLACE FUNCTION reserve_stock(variant_uuid UUID, qty INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  available INTEGER;
BEGIN
  -- Get available stock
  available := get_available_stock(variant_uuid);
  
  -- Check if enough stock
  IF available >= qty THEN
    -- Reserve the stock
    UPDATE inventory
    SET reserved_quantity = reserved_quantity + qty
    WHERE variant_id = variant_uuid;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to deduct stock after successful order
CREATE OR REPLACE FUNCTION deduct_stock(variant_uuid UUID, qty INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE inventory
  SET 
    quantity = quantity - qty,
    reserved_quantity = GREATEST(0, reserved_quantity - qty)
  WHERE variant_id = variant_uuid;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add index for faster stock queries
CREATE INDEX IF NOT EXISTS idx_inventory_variant_id ON inventory(variant_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id_size ON product_variants(product_id, size);
