#!/bin/bash

# Delhivery API Setup Script
# This script helps you complete the deployment process

echo "🚀 Delhivery API Setup Script"
echo "============================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    brew install supabase/tap/supabase
    echo "✅ Supabase CLI installed"
else
    echo "✅ Supabase CLI is installed"
fi

echo ""
echo "📋 Next Steps (Manual Process Required):"
echo "========================================"
echo ""
echo "1. 🌐 Set Environment Variable in Supabase Dashboard:"
echo "   - Go to: https://supabase.com/dashboard"
echo "   - Select your project"
echo "   - Go to: Settings → Configuration → Environment Variables"
echo "   - Add: DELHIVERY_API_KEY = db825db6ab6c44b3e809520915801f5dbc205d92"
echo ""
echo "2. 🚀 Deploy Edge Function:"
echo "   - Go to: Functions → Create new function"
echo "   - Function name: delhivery-proxy"
echo "   - Copy code from: supabase/functions/delhivery-proxy/index.ts"
echo "   - Deploy the function"
echo ""
echo "3. 🧪 Test the Deployment:"
echo "   - Update SUPABASE_ANON_KEY in verify-deployment.js"
echo "   - Run: node verify-deployment.js"
echo ""
echo "4. 🔍 Verify in React App:"
echo "   - Start dev server: npm run dev"
echo "   - Go to checkout with items in cart"
echo "   - Enter delivery address"
echo "   - Check browser console for API calls"
echo ""

# Check if we can get Supabase project info
echo "🔍 Checking Supabase Configuration..."
if [ -f "supabase/config.toml" ]; then
    echo "✅ Supabase config found"
    PROJECT_ID=$(grep "project_id" supabase/config.toml | cut -d'"' -f2)
    if [ ! -z "$PROJECT_ID" ]; then
        echo "   - Project ID: $PROJECT_ID"
        echo "   - Dashboard URL: https://supabase.com/dashboard/project/$PROJECT_ID"
    fi
else
    echo "⚠️  Supabase config not found"
fi

echo ""
echo "📚 Documentation:"
echo "   - Implementation Guide: DELHIVERY_IMPLEMENTATION.md"
echo "   - Deployment Guide: DEPLOYMENT_GUIDE.md"
echo "   - Test Script: test-delhivery.js"
echo "   - Verification Script: verify-deployment.js"
echo ""

# Check if environment variables are set locally
echo "🔧 Local Environment Check:"
if [ ! -z "$VITE_SUPABASE_URL" ]; then
    echo "   ✅ VITE_SUPABASE_URL is set"
else
    echo "   ⚠️  VITE_SUPABASE_URL not set"
fi

if [ ! -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "   ✅ VITE_SUPABASE_ANON_KEY is set"
else
    echo "   ⚠️  VITE_SUPABASE_ANON_KEY not set"
fi

echo ""
echo "🎯 Ready to Deploy!"
echo "Follow the manual steps above to complete the setup."
