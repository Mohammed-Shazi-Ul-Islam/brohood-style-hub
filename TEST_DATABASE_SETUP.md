# ⚠️ IMPORTANT: Database Setup Required!

## The "Failed to Fetch" error means the database functions don't exist yet.

### 🔴 YOU MUST DO THIS FIRST:

1. **Open Supabase SQL Editor:**
   https://supabase.com/dashboard/project/bgbpppxfjjduhvrnlkxp/sql/new

2. **Copy the ENTIRE content from:**
   `supabase/migrations/20241116000001_razorpay_integration.sql`

3. **Paste it in the SQL Editor**

4. **Click "Run"**

5. **Wait for success message**

---

## ✅ How to Verify It Worked:

After running the SQL, run this query to check:

```sql
-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'create_order_with_razorpay',
  'update_payment_status',
  'get_order_details',
  'get_user_orders'
);
```

You should see 4 functions listed.

---

## 🧪 Then Test Again:

1. Restart your dev server: `npm run dev`
2. Add items to cart
3. Go to checkout
4. Add address
5. Click "Proceed to Payment"
6. Use test card: **4111 1111 1111 1111**

---

## 🐛 Still Getting Errors?

Check browser console (F12) and look for the exact error message.

Common issues:
- SQL not run yet → Run the migration file
- RLS policies blocking → Check if you're logged in
- Function doesn't exist → Verify SQL ran successfully
