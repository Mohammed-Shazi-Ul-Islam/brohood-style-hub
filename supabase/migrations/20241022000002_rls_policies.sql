-- Row Level Security (RLS) policies for BroHood admin dashboard
-- This migration sets up security policies for all tables

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE admin_users.user_id = is_admin.user_id 
        AND active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has specific admin role
CREATE OR REPLACE FUNCTION has_admin_role(user_id UUID, required_role admin_role)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE admin_users.user_id = has_admin_role.user_id 
        AND active = TRUE
        AND (role = required_role OR role = 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Categories policies
-- Public read access for active categories
CREATE POLICY "Public can view active categories" ON categories
    FOR SELECT USING (active = TRUE);

-- Admin full access
CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (is_admin(auth.uid()));

-- Products policies
-- Public read access for active products
CREATE POLICY "Public can view active products" ON products
    FOR SELECT USING (status = 'active');

-- Admin full access
CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (is_admin(auth.uid()));

-- Product images policies
-- Public read access for images of active products
CREATE POLICY "Public can view product images" ON product_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = product_images.product_id 
            AND products.status = 'active'
        )
    );

-- Admin full access
CREATE POLICY "Admins can manage product images" ON product_images
    FOR ALL USING (is_admin(auth.uid()));

-- Product variants policies
-- Public read access for variants of active products
CREATE POLICY "Public can view product variants" ON product_variants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = product_variants.product_id 
            AND products.status = 'active'
        )
    );

-- Admin full access
CREATE POLICY "Admins can manage product variants" ON product_variants
    FOR ALL USING (is_admin(auth.uid()));

-- Inventory policies
-- Public read access for inventory of active products (for stock checking)
CREATE POLICY "Public can view inventory" ON inventory
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = inventory.product_id 
            AND products.status = 'active'
        )
    );

-- Admin full access
CREATE POLICY "Admins can manage inventory" ON inventory
    FOR ALL USING (is_admin(auth.uid()));

-- Admin users policies
-- Only super admins can manage admin users
CREATE POLICY "Super admins can manage admin users" ON admin_users
    FOR ALL USING (has_admin_role(auth.uid(), 'super_admin'));

-- Admins can view their own record
CREATE POLICY "Admins can view own record" ON admin_users
    FOR SELECT USING (user_id = auth.uid());

-- Customer profiles policies
-- Users can manage their own profile
CREATE POLICY "Users can manage own profile" ON customer_profiles
    FOR ALL USING (user_id = auth.uid());

-- Admins can view all customer profiles
CREATE POLICY "Admins can view customer profiles" ON customer_profiles
    FOR SELECT USING (is_admin(auth.uid()));

-- Addresses policies
-- Users can manage their own addresses
CREATE POLICY "Users can manage own addresses" ON addresses
    FOR ALL USING (user_id = auth.uid());

-- Admins can view all addresses
CREATE POLICY "Admins can view addresses" ON addresses
    FOR SELECT USING (is_admin(auth.uid()));

-- Orders policies
-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (customer_id = auth.uid());

-- Users can create orders for themselves
CREATE POLICY "Users can create own orders" ON orders
    FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Admins can manage all orders
CREATE POLICY "Admins can manage orders" ON orders
    FOR ALL USING (is_admin(auth.uid()));

-- Order items policies
-- Users can view order items for their own orders
CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.customer_id = auth.uid()
        )
    );

-- Users can create order items for their own orders
CREATE POLICY "Users can create own order items" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.customer_id = auth.uid()
        )
    );

-- Admins can manage all order items
CREATE POLICY "Admins can manage order items" ON order_items
    FOR ALL USING (is_admin(auth.uid()));

-- Payments policies
-- Users can view payments for their own orders
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = payments.order_id 
            AND orders.customer_id = auth.uid()
        )
    );

-- System can create payments (for webhook handling)
CREATE POLICY "System can create payments" ON payments
    FOR INSERT WITH CHECK (TRUE);

-- System can update payments (for webhook handling)
CREATE POLICY "System can update payments" ON payments
    FOR UPDATE USING (TRUE);

-- Admins can manage all payments
CREATE POLICY "Admins can manage payments" ON payments
    FOR ALL USING (is_admin(auth.uid()));

-- Discounts policies
-- Public read access for active discounts (for code validation)
CREATE POLICY "Public can view active discounts" ON discounts
    FOR SELECT USING (active = TRUE);

-- Admins can manage all discounts
CREATE POLICY "Admins can manage discounts" ON discounts
    FOR ALL USING (is_admin(auth.uid()));

-- Discount usage policies
-- Users can view their own discount usage
CREATE POLICY "Users can view own discount usage" ON discount_usage
    FOR SELECT USING (user_id = auth.uid());

-- System can create discount usage records
CREATE POLICY "System can create discount usage" ON discount_usage
    FOR INSERT WITH CHECK (TRUE);

-- Admins can view all discount usage
CREATE POLICY "Admins can view discount usage" ON discount_usage
    FOR SELECT USING (is_admin(auth.uid()));

-- Cart items policies
-- Users can manage their own cart items
CREATE POLICY "Users can manage own cart" ON cart_items
    FOR ALL USING (user_id = auth.uid());

-- Wishlist items policies
-- Users can manage their own wishlist items
CREATE POLICY "Users can manage own wishlist" ON wishlist_items
    FOR ALL USING (user_id = auth.uid());

-- Site settings policies
-- Public read access for public settings
CREATE POLICY "Public can view public settings" ON site_settings
    FOR SELECT USING (key NOT LIKE 'admin_%' AND key NOT LIKE 'payment_%');

-- Admins can manage all settings
CREATE POLICY "Admins can manage settings" ON site_settings
    FOR ALL USING (is_admin(auth.uid()));

-- Audit logs policies
-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (is_admin(auth.uid()));

-- System can create audit logs
CREATE POLICY "System can create audit logs" ON audit_logs
    FOR INSERT WITH CHECK (TRUE);

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if the user is an admin
    IF is_admin(auth.uid()) THEN
        INSERT INTO audit_logs (
            admin_user_id,
            action,
            resource_type,
            resource_id,
            old_values,
            new_values,
            ip_address
        ) VALUES (
            (SELECT id FROM admin_users WHERE user_id = auth.uid()),
            TG_OP,
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
            CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
            inet_client_addr()
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for important tables
CREATE TRIGGER audit_products AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION log_admin_action();

CREATE TRIGGER audit_categories AFTER INSERT OR UPDATE OR DELETE ON categories
    FOR EACH ROW EXECUTE FUNCTION log_admin_action();

CREATE TRIGGER audit_orders AFTER UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION log_admin_action();

CREATE TRIGGER audit_discounts AFTER INSERT OR UPDATE OR DELETE ON discounts
    FOR EACH ROW EXECUTE FUNCTION log_admin_action();

CREATE TRIGGER audit_admin_users AFTER INSERT OR UPDATE OR DELETE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION log_admin_action();