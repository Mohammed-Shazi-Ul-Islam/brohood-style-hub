# Razorpay Integration Setup Guide

This guide will help you set up Razorpay payment integration for BroHood e-commerce platform.

## 🚀 Quick Setup Steps

### 1. Run SQL Migration

Copy and paste the entire content of `supabase/migrations/20241116000001_razorpay_integration.sql` into your Supabase SQL Editor and execute it.

This will create:
- ✅ `create_order_with_razorpay()` - Function to create orders
- ✅ `update_payment_status()` - Function to update payment status
- ✅ `get_order_details()` - Function to fetch order details
- ✅ `get_user_orders()` - Function to get user's orders
- ✅ RLS policies for orders, payments, and order_items tables
- ✅ Indexes for better performance

### 2. Deploy Supabase Edge Function

Deploy the Razorpay order creation edge function:

```bash
# Login to Supabase CLI (if not already logged in)
supabase login

# Link your project
supabase link --project-ref bgbpppxfjjduhvrnlkxp

# Deploy the edge function
supabase functions deploy create-razorpay-order
```

### 3. Set Supabase Secrets

Set your Razorpay credentials as Supabase secrets:

```bash
supabase secrets set RAZORPAY_KEY_ID=rzp_test_RgQlcr9Ia2zC4v
supabase secrets set RAZORPAY_KEY_SECRET=l1qxbg36OOLomPHjuwYNELTr
```

Or set them via Supabase Dashboard:
1. Go to Project Settings → Edge Functions
2. Add secrets:
   - `RAZORPAY_KEY_ID` = `rzp_test_RgQlcr9Ia2zC4v`
   - `RAZORPAY_KEY_SECRET` = `l1qxbg36OOLomPHjuwYNELTr`

### 4. Install Dependencies (if needed)

The Razorpay SDK is loaded dynamically via CDN, so no npm installation is required.

### 5. Restart Development Server

```bash
npm run dev
```

---

## 📋 What's Been Integrated

### Frontend Changes

1. **Checkout Page (`src/pages/Checkout.tsx`)**
   - Added Razorpay payment initialization
   - Order creation with items and address
   - Payment success/failure handling
   - Cart clearing after successful payment

2. **Razorpay Utilities (`src/lib/razorpay.ts`)**
   - `loadRazorpayScript()` - Loads Razorpay SDK
   - `createOrder()` - Creates order in database
   - `initializeRazorpay()` - Opens Razorpay payment modal
   - `verifyPayment()` - Verifies payment after success
   - `markPaymentFailed()` - Marks payment as failed
   - `getOrderDetails()` - Fetches order details
   - `getUserOrders()` - Gets user's order history

3. **Order Success Page (`src/pages/OrderSuccess.tsx`)**
   - Beautiful success confirmation page
   - Order details display
   - Next steps information
   - Links to view orders and continue shopping

### Backend Changes

1. **Database Functions (SQL)**
   - Order creation with items
   - Payment status updates
   - Order retrieval functions
   - RLS policies for security

2. **Edge Function (`supabase/functions/create-razorpay-order/index.ts`)**
   - Creates Razorpay order via API
   - Handles authentication
   - Returns Razorpay order ID

---

## 🔄 Payment Flow

1. **User adds items to cart** → Proceeds to checkout
2. **Selects/adds delivery address** → Clicks "Proceed to Payment"
3. **Order created in database** with status "pending"
4. **Razorpay order created** via edge function
5. **Razorpay modal opens** → User enters payment details
6. **Payment processed** by Razorpay
7. **Payment verified** → Order status updated to "confirmed"
8. **Cart cleared** → User redirected to success page

---

## 🧪 Testing

### Test Cards (Razorpay Test Mode)

**Success:**
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Failure:**
- Card: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

### Test Flow

1. Add products to cart
2. Go to checkout
3. Add/select delivery address
4. Click "Proceed to Payment"
5. Use test card details
6. Complete payment
7. Verify order in database

---

## 🔐 Security Features

- ✅ RLS policies on all tables
- ✅ User authentication required
- ✅ Payment signature verification
- ✅ Secure edge function with secrets
- ✅ HTTPS only in production

---

## 📊 Database Tables Used

- `orders` - Main order records
- `order_items` - Individual items in orders
- `payments` - Payment transaction records
- `customer_addresses` - Delivery addresses

---

## 🎯 Next Steps

1. **Test the integration** with test cards
2. **Switch to live mode** when ready:
   - Get live Razorpay keys from dashboard
   - Update environment variables
   - Test with real cards (small amounts)
3. **Add order tracking** page
4. **Set up email notifications** for orders
5. **Add invoice generation**
6. **Implement refund functionality**

---

## 🐛 Troubleshooting

### Payment Modal Not Opening
- Check browser console for errors
- Verify Razorpay script is loaded
- Check VITE_RAZORPAY_KEY_ID in .env

### Order Not Created
- Check Supabase logs
- Verify SQL functions are created
- Check RLS policies

### Payment Verification Failed
- Check edge function logs
- Verify Razorpay secrets are set
- Check signature verification

### Edge Function Not Working
- Verify function is deployed
- Check secrets are set correctly
- View logs: `supabase functions logs create-razorpay-order`

---

## 📞 Support

- **Razorpay Docs**: https://razorpay.com/docs/
- **Supabase Docs**: https://supabase.com/docs
- **Test Dashboard**: https://dashboard.razorpay.com/test/payments

---

## ✅ Checklist

- [ ] SQL migration executed in Supabase
- [ ] Edge function deployed
- [ ] Razorpay secrets set in Supabase
- [ ] Environment variables updated
- [ ] Development server restarted
- [ ] Test payment completed successfully
- [ ] Order visible in database
- [ ] Success page displays correctly

---

**🎉 You're all set! Happy selling!**
