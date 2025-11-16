# 🚀 Razorpay Integration - Quick Reference

## 📝 ONE-TIME SETUP (Do This First!)

### Copy & Run This SQL
```
File: supabase/migrations/20241116000001_razorpay_integration.sql
Where: https://supabase.com/dashboard/project/bgbpppxfjjduhvrnlkxp/sql/new
Action: Copy entire file → Paste → Click "Run"
```

---

## 🧪 TEST CARDS

### ✅ Success
```
Card: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
```

### ❌ Failure
```
Card: 4000 0000 0000 0002
CVV: 123
Expiry: 12/25
```

---

## 🔑 ENVIRONMENT VARIABLES

Already set in `.env`:
```env
VITE_RAZORPAY_KEY_ID=rzp_test_RgQlcr9Ia2zC4v
RAZORPAY_KEY_ID=rzp_test_RgQlcr9Ia2zC4v
RAZORPAY_KEY_SECRET=l1qxbg36OOLomPHjuwYNELTr
```

---

## 📂 KEY FILES

| File | Purpose |
|------|---------|
| `src/lib/razorpay.ts` | Payment utilities |
| `src/pages/Checkout.tsx` | Payment integration |
| `src/pages/OrderSuccess.tsx` | Success page |
| `supabase/functions/create-razorpay-order/index.ts` | Edge function |

---

## 🗄️ DATABASE FUNCTIONS

```sql
-- Create order
create_order_with_razorpay(...)

-- Update payment
update_payment_status(...)

-- Get order details
get_order_details(order_id)

-- Get user orders
get_user_orders(user_id)
```

---

## 🔄 PAYMENT FLOW (Simple)

```
Cart → Checkout → Select Address → Pay → Success
```

---

## 🐛 QUICK TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| Modal not opening | Check console, verify VITE_RAZORPAY_KEY_ID |
| Order not created | Check SQL functions exist |
| Payment fails | Use test card 4111... |
| Edge function error | Deploy function, set secrets |

---

## 📞 USEFUL LINKS

- **Razorpay Dashboard:** https://dashboard.razorpay.com/test/
- **Supabase Project:** https://supabase.com/dashboard/project/bgbpppxfjjduhvrnlkxp
- **Razorpay Docs:** https://razorpay.com/docs/

---

## ⚡ QUICK COMMANDS

```bash
# Start dev server
npm run dev

# Deploy edge function
supabase functions deploy create-razorpay-order

# Set secrets
supabase secrets set RAZORPAY_KEY_ID=rzp_test_RgQlcr9Ia2zC4v
supabase secrets set RAZORPAY_KEY_SECRET=l1qxbg36OOLomPHjuwYNELTr

# View function logs
supabase functions logs create-razorpay-order
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] SQL migration run successfully
- [ ] Test payment works
- [ ] Order appears in database
- [ ] Success page displays

---

## 🎯 NEXT STEPS

1. Test with test cards
2. Check orders in Supabase
3. Switch to live keys when ready
4. Add order history page (optional)
5. Set up email notifications (optional)

---

**That's it! You're ready to accept payments! 🎉**
