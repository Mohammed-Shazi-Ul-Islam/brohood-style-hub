#!/bin/bash

# Razorpay Integration Setup Script for BroHood

echo "🚀 BroHood Razorpay Integration Setup"
echo "======================================"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo "📦 Install it first: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Step 1: Link project
echo "🔗 Step 1: Linking Supabase project..."
supabase link --project-ref bgbpppxfjjduhvrnlkxp

if [ $? -ne 0 ]; then
    echo "❌ Failed to link project. Please check your credentials."
    exit 1
fi

echo "✅ Project linked successfully"
echo ""

# Step 2: Deploy edge function
echo "📤 Step 2: Deploying edge function..."
supabase functions deploy create-razorpay-order

if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy edge function"
    exit 1
fi

echo "✅ Edge function deployed successfully"
echo ""

# Step 3: Set secrets
echo "🔐 Step 3: Setting Razorpay secrets..."
supabase secrets set RAZORPAY_KEY_ID=rzp_test_RgQlcr9Ia2zC4v
supabase secrets set RAZORPAY_KEY_SECRET=l1qxbg36OOLomPHjuwYNELTr

if [ $? -ne 0 ]; then
    echo "❌ Failed to set secrets"
    exit 1
fi

echo "✅ Secrets set successfully"
echo ""

# Final instructions
echo "✅ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Run the SQL migration in Supabase SQL Editor:"
echo "   → Copy content from: supabase/migrations/20241116000001_razorpay_integration.sql"
echo "   → Paste in: https://supabase.com/dashboard/project/bgbpppxfjjduhvrnlkxp/sql/new"
echo "   → Click 'Run'"
echo ""
echo "2. Start your development server:"
echo "   npm run dev"
echo ""
echo "3. Test the payment flow:"
echo "   → Add items to cart"
echo "   → Go to checkout"
echo "   → Use test card: 4111 1111 1111 1111"
echo ""
echo "🎉 Happy selling!"
