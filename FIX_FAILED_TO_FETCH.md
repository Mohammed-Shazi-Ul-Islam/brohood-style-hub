# 🔴 Fix "Failed to Fetch" Error

## The Problem
You're getting "failed to fetch" because the database functions don't exist yet.

---

## ✅ The Solution (3 Steps)

### Step 1: Run SQL Migration

1. **Open this link:**
   https://supabase.com/dashboard/project/bgbpppxfjjduhvrnlkxp/sql/new

2. **Open this file in your editor:**
   `supabase/migrations/20241116000001_razorpay_integration.sql`

3. **Copy EVERYTHING** (Ctrl+A, then Ctrl+C)

4. **Paste in Supabase SQL Editor** (Ctrl+V)

5. **Click the "Run" button** (or press Ctrl+Enter)

6. **Wait for success message** ✅

---

### Step 2: Test the Setup

1. Go to: http://localhost:8080/test-razorpay

2. Click "Run Tests"

3. All tests should pass ✅

---

### Step 3: Try Payment Again

1. Add items to cart
2. Go to checkout
3. Add/select address
4. Click "Proceed to Payment"
5. Use test card: **4111 1111 1111 1111**

---

## 🎯 What the SQL Does

The SQL file creates these functions:
- ✅ `create_order_with_razorpay()` - Creates orders
- ✅ `update_payment_status()` - Updates payment status
- ✅ `get_order_details()` - Gets order info
- ✅ `get_user_orders()` - Gets user's orders

Plus security policies and indexes.

---

## 🐛 Still Not Working?

### Check Browser Console (F12)
Look for the exact error message.

### Common Errors:

**"function create_order_with_razorpay does not exist"**
→ SQL not run yet. Go back to Step 1.

**"permission denied for function"**
→ Make sure you're logged in to the app.

**"Failed to fetch"**
→ Check if you're connected to internet.

**"Invalid amount"**
→ Make sure cart has items.

---

## 📞 Need Help?

1. Run the test page: http://localhost:8080/test-razorpay
2. Take a screenshot of the results
3. Check browser console for errors
4. Share the error message

---

## ✅ Success Checklist

- [ ] SQL migration run in Supabase
- [ ] Test page shows all green checkmarks
- [ ] Logged into the app
- [ ] Cart has items
- [ ] Address selected
- [ ] Payment modal opens
- [ ] Test payment works

---

**Once the SQL is run, everything will work! 🚀**
