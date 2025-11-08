# BroHood Admin Dashboard Setup

This document explains how to set up the database schema and create the first admin user for the BroHood admin dashboard.

## Database Setup

### 1. Run Migrations

The database schema has been created in the following migration files:

- `supabase/migrations/20241022000001_initial_schema.sql` - Creates all tables and basic structure
- `supabase/migrations/20241022000002_rls_policies.sql` - Sets up Row Level Security policies
- `supabase/migrations/20241022000003_initial_data.sql` - Inserts initial data and helper functions

To apply these migrations to your Supabase project:

```bash
# If using Supabase CLI
supabase db push

# Or apply them manually through the Supabase Dashboard SQL Editor
```

### 2. Verify Database Setup

After running the migrations, you should have the following tables:
- `categories` - Product categories
- `products` - Product catalog
- `product_variants` - Product size/color variants
- `product_images` - Product images
- `inventory` - Stock management
- `orders` - Customer orders
- `order_items` - Order line items
- `payments` - Payment records
- `admin_users` - Admin user management
- `customer_profiles` - Customer information
- `addresses` - Customer addresses
- `discounts` - Discount codes
- `cart_items` - Shopping cart
- `wishlist_items` - Customer wishlist
- `site_settings` - Application settings
- `audit_logs` - Admin action logging

## Admin User Setup

### Method 1: Create First Admin User

1. **Register a user** through Supabase Auth (you can use the Supabase Dashboard or create a simple registration form)

2. **Make the user an admin** by running this SQL in the Supabase SQL Editor:

```sql
-- Replace 'admin@brohood.com' with your actual email
SELECT create_admin_user('admin@brohood.com', 'super_admin');
```

### Method 2: Manual Admin Creation

If the RPC function doesn't work, you can manually insert the admin record:

```sql
-- First, get the user ID from auth.users
SELECT id, email FROM auth.users WHERE email = 'admin@brohood.com';

-- Then insert into admin_users (replace the user_id with the actual UUID)
INSERT INTO admin_users (user_id, role, active) 
VALUES ('your-user-id-here', 'super_admin', true);

```

## Environment Variables

Make sure your `.env` file has the correct Supabase configuration:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

## Testing the Setup

1. **Start the development server**:
```bash
npm run dev
```

2. **Access the admin dashboard**:
   - Go to `http://localhost:5173/admin/login`
   - Login with your admin credentials
   - You should see the admin dashboard

3. **Verify admin access**:
   - Check that you can access `/admin` route
   - Verify that the dashboard loads without errors
   - Check that the user menu shows your admin role

## Admin Roles

The system supports three admin roles:

- **super_admin**: Full access to all features including user management
- **admin**: Access to most features except user management
- **moderator**: Limited access to content management

## Security Features

- **Row Level Security (RLS)**: All tables have RLS policies
- **Admin-only access**: Admin routes are protected by authentication
- **Role-based permissions**: Different admin roles have different access levels
- **Audit logging**: Admin actions are automatically logged
- **Secure functions**: Database functions use SECURITY DEFINER

## Troubleshooting

### Common Issues

1. **"User not found" error**: Make sure the user is registered in `auth.users` first
2. **"Insufficient permissions"**: Check that RLS policies are applied correctly
3. **Migration errors**: Ensure you have the correct Supabase project permissions

### Checking Admin Status

To verify if a user is an admin:

```sql
SELECT 
  au.*,
  u.email 
FROM admin_users au 
JOIN auth.users u ON u.id = au.user_id 
WHERE u.email = 'admin@brohood.com';
```

### Resetting Admin Access

To remove admin access:

```sql
DELETE FROM admin_users WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'admin@brohood.com'
);
```

## Next Steps

After setting up the database and admin user:

1. **Configure site settings** through the admin dashboard
2. **Add product categories** and initial products
3. **Set up payment gateway** (Razorpay) credentials
4. **Configure email notifications**
5. **Test the complete order flow**

## Support

If you encounter issues during setup, check:
1. Supabase project permissions
2. Database migration status
3. Environment variable configuration
4. Browser console for JavaScript errors