-- Razorpay Integration Migration
-- This migration adds functions and updates for Razorpay payment integration

-- Function to create a new order with Razorpay
CREATE OR REPLACE FUNCTION create_order_with_razorpay(
  p_customer_id UUID,
  p_items JSONB,
  p_shipping_address JSONB,
  p_billing_address JSONB,
  p_subtotal DECIMAL(10,2),
  p_shipping_amount DECIMAL(10,2),
  p_tax_amount DECIMAL(10,2),
  p_discount_amount DECIMAL(10,2),
  p_total_amount DECIMAL(10,2),
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(order_id UUID, order_number TEXT, razorpay_order_id TEXT) AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_razorpay_order_id TEXT;
  v_item JSONB;
BEGIN
  -- Generate order number
  v_order_number := generate_order_number();
  
  -- Create order
  INSERT INTO orders (
    order_number,
    customer_id,
    status,
    payment_status,
    subtotal,
    tax_amount,
    shipping_amount,
    discount_amount,
    total_amount,
    shipping_address,
    billing_address,
    notes
  ) VALUES (
    v_order_number,
    p_customer_id,
    'pending',
    'pending',
    p_subtotal,
    p_tax_amount,
    p_shipping_amount,
    p_discount_amount,
    p_total_amount,
    p_shipping_address,
    p_billing_address,
    p_notes
  ) RETURNING id INTO v_order_id;
  
  -- Insert order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (
      order_id,
      product_id,
      variant_id,
      quantity,
      unit_price,
      total_price,
      product_snapshot
    ) VALUES (
      v_order_id,
      (v_item->>'product_id')::UUID,
      CASE WHEN v_item->>'variant_id' IS NOT NULL 
        THEN (v_item->>'variant_id')::UUID 
        ELSE NULL 
      END,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'unit_price')::DECIMAL(10,2),
      (v_item->>'total_price')::DECIMAL(10,2),
      v_item->'product_snapshot'
    );
  END LOOP;
  
  -- Generate Razorpay order ID placeholder (will be updated by backend)
  v_razorpay_order_id := 'pending_' || v_order_id;
  
  -- Create payment record
  INSERT INTO payments (
    order_id,
    razorpay_order_id,
    amount,
    currency,
    status
  ) VALUES (
    v_order_id,
    v_razorpay_order_id,
    p_total_amount,
    'INR',
    'pending'
  );
  
  RETURN QUERY SELECT v_order_id, v_order_number, v_razorpay_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update payment status after Razorpay verification
CREATE OR REPLACE FUNCTION update_payment_status(
  p_order_id UUID,
  p_razorpay_order_id TEXT,
  p_razorpay_payment_id TEXT,
  p_razorpay_signature TEXT,
  p_status payment_status,
  p_payment_method TEXT DEFAULT NULL,
  p_failure_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_success BOOLEAN := FALSE;
BEGIN
  -- Update payment record
  UPDATE payments
  SET 
    razorpay_order_id = p_razorpay_order_id,
    razorpay_payment_id = p_razorpay_payment_id,
    razorpay_signature = p_razorpay_signature,
    status = p_status,
    payment_method = p_payment_method,
    failure_reason = p_failure_reason,
    updated_at = NOW()
  WHERE order_id = p_order_id;
  
  -- Update order status based on payment status
  IF p_status = 'paid' THEN
    UPDATE orders
    SET 
      status = 'confirmed',
      payment_status = 'paid',
      updated_at = NOW()
    WHERE id = p_order_id;
    v_success := TRUE;
  ELSIF p_status = 'failed' THEN
    UPDATE orders
    SET 
      payment_status = 'failed',
      updated_at = NOW()
    WHERE id = p_order_id;
    v_success := FALSE;
  END IF;
  
  RETURN v_success;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get order details with items
CREATE OR REPLACE FUNCTION get_order_details(p_order_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'order', row_to_json(o.*),
    'items', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'variant_id', oi.variant_id,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'total_price', oi.total_price,
          'product_snapshot', oi.product_snapshot,
          'product', (
            SELECT row_to_json(p.*)
            FROM products p
            WHERE p.id = oi.product_id
          )
        )
      )
      FROM order_items oi
      WHERE oi.order_id = o.id
    ),
    'payment', (
      SELECT row_to_json(pay.*)
      FROM payments pay
      WHERE pay.order_id = o.id
      ORDER BY pay.created_at DESC
      LIMIT 1
    )
  ) INTO v_result
  FROM orders o
  WHERE o.id = p_order_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user orders
CREATE OR REPLACE FUNCTION get_user_orders(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  order_number TEXT,
  status order_status,
  payment_status payment_status,
  total_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE,
  items_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.order_number,
    o.status,
    o.payment_status,
    o.total_amount,
    o.created_at,
    COUNT(oi.id) as items_count
  FROM orders o
  LEFT JOIN order_items oi ON oi.order_id = o.id
  WHERE o.customer_id = p_user_id
  GROUP BY o.id, o.order_number, o.status, o.payment_status, o.total_amount, o.created_at
  ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_order_with_razorpay TO authenticated;
GRANT EXECUTE ON FUNCTION update_payment_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_order_details TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_orders TO authenticated;

-- Add RLS policies for orders (if not already exists)
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view own orders" ON orders;
  DROP POLICY IF EXISTS "Users can create own orders" ON orders;
  DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
  
  -- Create new policies
  CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (customer_id = auth.uid());
    
  CREATE POLICY "Users can create own orders" ON orders
    FOR INSERT WITH CHECK (customer_id = auth.uid());
    
  CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM admin_users 
        WHERE admin_users.user_id = auth.uid() 
        AND active = TRUE
      )
    );
END $$;

-- Add RLS policies for payments
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view own payments" ON payments;
  DROP POLICY IF EXISTS "Users can create own payments" ON payments;
  DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
  
  CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = payments.order_id 
        AND orders.customer_id = auth.uid()
      )
    );
    
  CREATE POLICY "Users can create own payments" ON payments
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = payments.order_id 
        AND orders.customer_id = auth.uid()
      )
    );
    
  CREATE POLICY "Admins can view all payments" ON payments
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM admin_users 
        WHERE admin_users.user_id = auth.uid() 
        AND active = TRUE
      )
    );
END $$;

-- Add RLS policies for order_items
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
  DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
  
  CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND orders.customer_id = auth.uid()
      )
    );
    
  CREATE POLICY "Admins can view all order items" ON order_items
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM admin_users 
        WHERE admin_users.user_id = auth.uid() 
        AND active = TRUE
      )
    );
END $$;

-- Create index for faster order lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_created ON orders(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);

COMMENT ON FUNCTION create_order_with_razorpay IS 'Creates a new order with items and payment record for Razorpay integration';
COMMENT ON FUNCTION update_payment_status IS 'Updates payment and order status after Razorpay payment verification';
COMMENT ON FUNCTION get_order_details IS 'Retrieves complete order details including items and payment info';
COMMENT ON FUNCTION get_user_orders IS 'Gets all orders for a specific user';
