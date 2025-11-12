-- Create a new customer_addresses table for storing delivery addresses
-- This is separate from the problematic addresses table

CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'home' CHECK (type IN ('home', 'work', 'other')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  phone TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_customer_addresses_user_id ON customer_addresses(user_id);
CREATE INDEX idx_customer_addresses_is_default ON customer_addresses(user_id, is_default);
CREATE INDEX idx_customer_addresses_created_at ON customer_addresses(created_at DESC);

-- Enable RLS
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own addresses
CREATE POLICY "Users can view own addresses" ON customer_addresses
    FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own addresses
CREATE POLICY "Users can insert own addresses" ON customer_addresses
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own addresses
CREATE POLICY "Users can update own addresses" ON customer_addresses
    FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own addresses
CREATE POLICY "Users can delete own addresses" ON customer_addresses
    FOR DELETE USING (user_id = auth.uid());

-- Admins can view all addresses
CREATE POLICY "Admins can view all addresses" ON customer_addresses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND active = TRUE
        )
    );

-- Create updated_at trigger
CREATE TRIGGER update_customer_addresses_updated_at 
    BEFORE UPDATE ON customer_addresses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
    -- If this address is being set as default
    IF NEW.is_default = TRUE THEN
        -- Set all other addresses for this user to non-default
        UPDATE customer_addresses 
        SET is_default = FALSE 
        WHERE user_id = NEW.user_id 
        AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure single default
CREATE TRIGGER ensure_single_default_address_trigger
    BEFORE INSERT OR UPDATE ON customer_addresses
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_default_address();

-- Add helpful comment
COMMENT ON TABLE customer_addresses IS 'Customer shipping and billing addresses - stores delivery information';
COMMENT ON COLUMN customer_addresses.is_default IS 'Only one address per user can be default';
