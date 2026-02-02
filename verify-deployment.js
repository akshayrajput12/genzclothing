// Verification script for Delhivery API deployment
// Run this after deploying to Supabase: node verify-deployment.js

console.log('🔍 Verifying Delhivery API Deployment');
console.log('=====================================');

// Configuration - Update these with your actual values
const CONFIG = {
  SUPABASE_URL: 'https://dhmehtfdxqwumtwktmlp.supabase.co', // Your Supabase URL
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY', // Replace with your actual anon key
  TEST_ORIGIN_PINCODE: '201016',
  TEST_DELIVERY_PINCODE: '226010',
  TEST_WEIGHT: 2.5 // kg
};

async function verifyDeployment() {
  console.log('📋 Configuration:');
  console.log(`   - Supabase URL: ${CONFIG.SUPABASE_URL}`);
  console.log(`   - Origin Pincode: ${CONFIG.TEST_ORIGIN_PINCODE}`);
  console.log(`   - Delivery Pincode: ${CONFIG.TEST_DELIVERY_PINCODE}`);
  console.log(`   - Weight: ${CONFIG.TEST_WEIGHT}kg`);
  console.log('');

  // Check if configuration is complete
  if (CONFIG.SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
    console.log('❌ Please update the SUPABASE_ANON_KEY in this script');
    console.log('   You can find it in your Supabase dashboard under Settings > API');
    return;
  }

  try {
    console.log('🚀 Testing Supabase Edge Function...');
    
    const proxyUrl = `${CONFIG.SUPABASE_URL}/functions/v1/delhivery-proxy`;
    
    const queryParams = new URLSearchParams({
      md: 'S',
      ss: 'RTO',
      d_pin: CONFIG.TEST_DELIVERY_PINCODE,
      o_pin: CONFIG.TEST_ORIGIN_PINCODE,
      cgm: (CONFIG.TEST_WEIGHT * 1000).toString() // Convert to grams
    });

    const params = new URLSearchParams({
      path: `/api/kinko/v1/invoice/charges/.json?${queryParams.toString()}`,
      method: 'GET'
    });

    const fullUrl = `${proxyUrl}?${params.toString()}`;
    
    console.log('📡 Making request to:', fullUrl);

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
      }
    });

    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📄 Raw Response:', responseText);

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('');
        console.log('✅ SUCCESS! API Integration Working');
        console.log('=====================================');
        
        if (Array.isArray(data) && data.length > 0) {
          const chargeData = data[0];
          console.log('💰 Delivery Charges:');
          console.log(`   - Total Amount: ₹${chargeData.total_amount || 'N/A'}`);
          console.log(`   - Shipping Charges: ₹${chargeData.shipping_charges || 'N/A'}`);
          console.log(`   - COD Charges: ₹${chargeData.cod_charges || 'N/A'}`);
          console.log(`   - Estimated Delivery Time: ${chargeData.estimated_delivery_time || 'N/A'}`);
          console.log(`   - Serviceable: ${chargeData.serviceability || 'N/A'}`);
        } else if (typeof data === 'object') {
          console.log('💰 Delivery Charges:');
          console.log(`   - Total Amount: ₹${data.total_amount || 'N/A'}`);
          console.log(`   - Shipping Charges: ₹${data.shipping_charges || 'N/A'}`);
          console.log(`   - Estimated Delivery Time: ${data.estimated_delivery_time || 'N/A'}`);
        }
        
        console.log('');
        console.log('🎉 Deployment Verification Complete!');
        console.log('✅ Environment variable is set correctly');
        console.log('✅ Edge function is deployed and working');
        console.log('✅ API integration is successful');
        console.log('');
        console.log('🚀 Next Steps:');
        console.log('   1. Test the checkout process in your React app');
        console.log('   2. Verify delivery charges are calculated correctly');
        console.log('   3. Update store coordinates in PICKUP_LOCATION');
        
      } catch (parseError) {
        console.log('⚠️  Response is not JSON:', responseText);
        console.log('   This might be an error message or unexpected format');
      }
    } else {
      console.log('❌ API Error Response');
      console.log('====================');
      console.log('Status:', response.status);
      console.log('Response:', responseText);
      
      if (response.status === 500) {
        console.log('');
        console.log('🔧 Troubleshooting Tips:');
        console.log('   1. Check if DELHIVERY_API_KEY is set in Supabase environment variables');
        console.log('   2. Verify the Edge function is deployed correctly');
        console.log('   3. Check Supabase function logs for detailed error messages');
      }
    }

  } catch (error) {
    console.log('💥 Verification Failed');
    console.log('=====================');
    console.log('Error:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting Tips:');
    console.log('   1. Check your internet connection');
    console.log('   2. Verify Supabase URL is correct');
    console.log('   3. Ensure Supabase anon key is valid');
    console.log('   4. Check if the Edge function is deployed');
  }
}

// Check if running in Node.js environment
if (typeof fetch === 'undefined') {
  console.log('📦 Installing fetch for Node.js...');
  import('node-fetch').then(({ default: fetch }) => {
    global.fetch = fetch;
    verifyDeployment();
  }).catch(console.error);
} else {
  verifyDeployment();
}
