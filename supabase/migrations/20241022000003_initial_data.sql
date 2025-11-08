-- Initial data and default configurations for BroHood admin dashboard
-- This migration inserts default categories, site settings, and sample data

-- Insert default categories
INSERT INTO categories (name, description, slug, sort_order) VALUES
('Men', 'Men''s fashion and accessories', 'men', 1),
('Women', 'Women''s fashion and accessories', 'women', 2),
('Accessories', 'Fashion accessories for all', 'accessories', 3),
('Footwear', 'Shoes and footwear collection', 'footwear', 4);

-- Insert subcategories for Men
INSERT INTO categories (name, description, slug, parent_id, sort_order) VALUES
('T-Shirts', 'Men''s t-shirts and casual wear', 'mens-tshirts', (SELECT id FROM categories WHERE slug = 'men'), 1),
('Shirts', 'Men''s formal and casual shirts', 'mens-shirts', (SELECT id FROM categories WHERE slug = 'men'), 2),
('Jeans', 'Men''s jeans and denim', 'mens-jeans', (SELECT id FROM categories WHERE slug = 'men'), 3),
('Jackets', 'Men''s jackets and outerwear', 'mens-jackets', (SELECT id FROM categories WHERE slug = 'men'), 4);

-- Insert subcategories for Women
INSERT INTO categories (name, description, slug, parent_id, sort_order) VALUES
('Tops', 'Women''s tops and blouses', 'womens-tops', (SELECT id FROM categories WHERE slug = 'women'), 1),
('Dresses', 'Women''s dresses and gowns', 'womens-dresses', (SELECT id FROM categories WHERE slug = 'women'), 2),
('Jeans', 'Women''s jeans and denim', 'womens-jeans', (SELECT id FROM categories WHERE slug = 'women'), 3),
('Ethnic Wear', 'Traditional and ethnic clothing', 'womens-ethnic', (SELECT id FROM categories WHERE slug = 'women'), 4);

-- Insert default site settings
INSERT INTO site_settings (key, value, description) VALUES
('site_name', '"BroHood"', 'Website name'),
('site_description', '"Fashion for the modern generation"', 'Website description'),
('currency', '"INR"', 'Default currency'),
('tax_rate', '18.0', 'Default tax rate percentage'),
('shipping_fee', '99.0', 'Default shipping fee'),
('free_shipping_threshold', '999.0', 'Minimum order value for free shipping'),
('razorpay_key_id', '""', 'Razorpay public key ID'),
('razorpay_key_secret', '""', 'Razorpay secret key (encrypted)'),
('razorpay_webhook_secret', '""', 'Razorpay webhook secret'),
('payment_methods', '["card", "netbanking", "wallet", "upi"]', 'Enabled payment methods'),
('order_statuses', '["pending", "confirmed", "processing", "shipped", "delivered"]', 'Available order statuses'),
('low_stock_threshold', '10', 'Global low stock threshold'),
('admin_email', '""', 'Admin notification email'),
('support_email', '"support@brohood.com"', 'Customer support email'),
('company_address', '{"line1": "", "line2": "", "city": "", "state": "", "pincode": "", "country": "India"}', 'Company address for invoices'),
('social_media', '{"instagram": "", "facebook": "", "twitter": "", "youtube": ""}', 'Social media links'),
('seo_meta', '{"title": "BroHood - Fashion for Everyone", "description": "Discover the latest fashion trends at BroHood", "keywords": "fashion, clothing, men, women, accessories"}', 'SEO meta information'),
('homepage_banner', '{"title": "Welcome to BroHood", "subtitle": "Fashion for the modern generation", "cta_text": "Shop Now", "cta_link": "/products", "image_url": ""}', 'Homepage banner content'),
('featured_categories', '[]', 'Featured categories for homepage'),
('newsletter_enabled', 'true', 'Enable newsletter signup'),
('reviews_enabled', 'true', 'Enable product reviews'),
('wishlist_enabled', 'true', 'Enable wishlist functionality'),
('guest_checkout_enabled', 'false', 'Allow guest checkout'),
('inventory_tracking', 'true', 'Enable inventory tracking'),
('backorder_enabled', 'false', 'Allow backorders when out of stock'),
('email_notifications', '{"order_confirmation": true, "order_shipped": true, "order_delivered": true, "low_stock_alert": true}', 'Email notification settings'),
('maintenance_mode', 'false', 'Enable maintenance mode');

-- Insert sample discount codes
INSERT INTO discounts (code, name, description, type, value, minimum_amount, usage_limit, valid_from, valid_until) VALUES
('WELCOME10', 'Welcome Discount', 'Get 10% off on your first order', 'percentage', 10.00, 500.00, 1000, NOW(), NOW() + INTERVAL '30 days'),
('FLAT100', 'Flat 100 Off', 'Get flat ₹100 off on orders above ₹999', 'fixed', 100.00, 999.00, 500, NOW(), NOW() + INTERVAL '15 days'),
('SUMMER20', 'Summer Sale', 'Summer special - 20% off on all items', 'percentage', 20.00, 1000.00, NULL, NOW(), NOW() + INTERVAL '60 days');

-- Create function to create first admin user
CREATE OR REPLACE FUNCTION create_admin_user(
    admin_email TEXT,
    admin_password TEXT,
    admin_role admin_role DEFAULT 'super_admin'
)
RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
    new_admin_id UUID;
BEGIN
    -- This function should be called manually after user registration
    -- It's here as a helper for setting up the first admin
    
    -- Find user by email
    SELECT id INTO new_user_id 
    FROM auth.users 
    WHERE email = admin_email;
    
    IF new_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found. Please register first.', admin_email;
    END IF;
    
    -- Check if user is already an admin
    IF EXISTS (SELECT 1 FROM admin_users WHERE user_id = new_user_id) THEN
        RAISE EXCEPTION 'User % is already an admin', admin_email;
    END IF;
    
    -- Create admin user record
    INSERT INTO admin_users (user_id, role, active)
    VALUES (new_user_id, admin_role, TRUE)
    RETURNING id INTO new_admin_id;
    
    -- Log the action
    INSERT INTO audit_logs (action, resource_type, resource_id, new_values)
    VALUES ('CREATE_ADMIN', 'admin_users', new_admin_id, jsonb_build_object('user_id', new_user_id, 'role', admin_role));
    
    RETURN new_admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update admin last login
CREATE OR REPLACE FUNCTION update_admin_last_login(user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE admin_users 
    SET last_login = NOW() 
    WHERE admin_users.user_id = update_admin_last_login.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check inventory and reserve stock
CREATE OR REPLACE FUNCTION reserve_inventory(
    p_product_id UUID,
    p_variant_id UUID,
    p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    available_qty INTEGER;
BEGIN
    -- Get available quantity
    SELECT (quantity - reserved_quantity) INTO available_qty
    FROM inventory
    WHERE product_id = p_product_id 
    AND (variant_id = p_variant_id OR (variant_id IS NULL AND p_variant_id IS NULL));
    
    -- Check if enough stock is available
    IF available_qty >= p_quantity THEN
        -- Reserve the stock
        UPDATE inventory
        SET reserved_quantity = reserved_quantity + p_quantity
        WHERE product_id = p_product_id 
        AND (variant_id = p_variant_id OR (variant_id IS NULL AND p_variant_id IS NULL));
        
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to release reserved inventory
CREATE OR REPLACE FUNCTION release_inventory(
    p_product_id UUID,
    p_variant_id UUID,
    p_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE inventory
    SET reserved_quantity = GREATEST(0, reserved_quantity - p_quantity)
    WHERE product_id = p_product_id 
    AND (variant_id = p_variant_id OR (variant_id IS NULL AND p_variant_id IS NULL));
END;
$$ LANGUAGE plpgsql;

-- Create function to confirm inventory (convert reserved to sold)
CREATE OR REPLACE FUNCTION confirm_inventory(
    p_product_id UUID,
    p_variant_id UUID,
    p_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE inventory
    SET 
        quantity = quantity - p_quantity,
        reserved_quantity = GREATEST(0, reserved_quantity - p_quantity)
    WHERE product_id = p_product_id 
    AND (variant_id = p_variant_id OR (variant_id IS NULL AND p_variant_id IS NULL));
END;
$$ LANGUAGE plpgsql;

-- Create function to get low stock products
CREATE OR REPLACE FUNCTION get_low_stock_products()
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    variant_id UUID,
    variant_sku TEXT,
    current_quantity INTEGER,
    threshold INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        pv.id,
        pv.sku,
        i.quantity,
        i.low_stock_threshold
    FROM inventory i
    JOIN products p ON p.id = i.product_id
    LEFT JOIN product_variants pv ON pv.id = i.variant_id
    WHERE i.quantity <= i.low_stock_threshold
    AND p.status = 'active'
    ORDER BY i.quantity ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate order totals
CREATE OR REPLACE FUNCTION calculate_order_total(
    p_subtotal DECIMAL,
    p_discount_code TEXT DEFAULT NULL,
    p_shipping_amount DECIMAL DEFAULT 0
)
RETURNS TABLE (
    subtotal DECIMAL,
    discount_amount DECIMAL,
    tax_amount DECIMAL,
    shipping_amount DECIMAL,
    total_amount DECIMAL
) AS $$
DECLARE
    v_discount_amount DECIMAL := 0;
    v_tax_rate DECIMAL;
    v_tax_amount DECIMAL;
    v_total DECIMAL;
BEGIN
    -- Get tax rate from settings
    SELECT (value::DECIMAL) INTO v_tax_rate
    FROM site_settings
    WHERE key = 'tax_rate';
    
    v_tax_rate := COALESCE(v_tax_rate, 18.0);
    
    -- Calculate discount if code provided
    IF p_discount_code IS NOT NULL THEN
        SELECT 
            CASE 
                WHEN d.type = 'percentage' THEN 
                    LEAST(p_subtotal * d.value / 100, COALESCE(d.maximum_discount, p_subtotal))
                WHEN d.type = 'fixed' THEN 
                    LEAST(d.value, p_subtotal)
                ELSE 0
            END
        INTO v_discount_amount
        FROM discounts d
        WHERE d.code = p_discount_code
        AND d.active = TRUE
        AND (d.minimum_amount IS NULL OR p_subtotal >= d.minimum_amount)
        AND (d.valid_from IS NULL OR d.valid_from <= NOW())
        AND (d.valid_until IS NULL OR d.valid_until >= NOW())
        AND (d.usage_limit IS NULL OR d.used_count < d.usage_limit);
        
        v_discount_amount := COALESCE(v_discount_amount, 0);
    END IF;
    
    -- Calculate tax on discounted amount
    v_tax_amount := (p_subtotal - v_discount_amount) * v_tax_rate / 100;
    
    -- Calculate total
    v_total := p_subtotal - v_discount_amount + v_tax_amount + p_shipping_amount;
    
    RETURN QUERY SELECT 
        p_subtotal,
        v_discount_amount,
        v_tax_amount,
        p_shipping_amount,
        v_total;
END;
$$ LANGUAGE plpgsql;