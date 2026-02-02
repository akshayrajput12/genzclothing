// Test script for Delhivery API integration
// Run this with: node test-delhivery.js

const API_KEY = 'db825db6ab6c44b3e809520915801f5dbc205d92';
const BASE_URL = 'https://track.delhivery.com';

async function testDelhiveryAPI() {
    console.log('🧪 Testing Delhivery API Integration');
    console.log('=====================================');
    
    // Your exact curl parameters
    const testParams = {
        md: 'S',           // Surface delivery
        ss: 'RTO',         // Service type
        d_pin: '226010',   // Delivery pincode (user address)
        o_pin: '201016',   // Origin pincode (admin address)
        cgm: '2500'        // Weight in grams (2.5kg)
    };
    
    const queryString = new URLSearchParams(testParams).toString();
    const url = `${BASE_URL}/api/kinko/v1/invoice/charges/.json?${queryString}`;
    
    console.log('📡 API URL:', url);
    console.log('🔑 API Key:', API_KEY);
    console.log('📦 Package Details:');
    console.log('   - Weight: 2.5kg (2500g)');
    console.log('   - Dimensions: 3x3x3 (fixed)');
    console.log('   - Origin: 201016 (Admin address)');
    console.log('   - Destination: 226010 (User address)');
    console.log('');
    
    try {
        console.log('🚀 Making API request...');
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${API_KEY}`,
                'Accept': 'application/json'
            }
        });
        
        console.log('📊 Response Status:', response.status);
        console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('📄 Raw Response:', responseText);
        
        if (response.ok) {
            try {
                const data = JSON.parse(responseText);
                console.log('✅ Parsed Response:', JSON.stringify(data, null, 2));
                
                // Extract relevant information
                if (Array.isArray(data) && data.length > 0) {
                    const chargeData = data[0];
                    console.log('');
                    console.log('💰 Delivery Charges:');
                    console.log('   - Shipping Charges: ₹', chargeData.total_amount || chargeData.shipping_charges || 'N/A');
                    console.log('   - COD Charges: ₹', chargeData.cod_charges || 'N/A');
                    console.log('   - Estimated Delivery Time:', chargeData.estimated_delivery_time || 'N/A');
                    console.log('   - Serviceable:', chargeData.serviceability || 'N/A');
                } else if (typeof data === 'object') {
                    console.log('');
                    console.log('💰 Delivery Charges:');
                    console.log('   - Total Amount: ₹', data.total_amount || 'N/A');
                    console.log('   - Shipping Charges: ₹', data.shipping_charges || 'N/A');
                    console.log('   - Estimated Delivery Time:', data.estimated_delivery_time || 'N/A');
                }
            } catch (parseError) {
                console.log('⚠️  Response is not JSON:', responseText);
            }
        } else {
            console.log('❌ API Error:', responseText);
        }
        
    } catch (error) {
        console.log('💥 Request Failed:', error.message);
        console.log('💡 Note: This might be due to CORS restrictions in browser environment.');
        console.log('   Use the Supabase Edge Function proxy for browser requests.');
    }
}

// Test the Supabase proxy function
async function testSupabaseProxy() {
    console.log('');
    console.log('🌐 Testing Supabase Proxy Function');
    console.log('==================================');
    
    // You'll need to replace these with your actual Supabase credentials
    const SUPABASE_URL = 'https://dhmehtfdxqwumtwktmlp.supabase.co';
    const SUPABASE_ANON_KEY = 'your-supabase-anon-key'; // Replace with actual key
    
    const testParams = {
        md: 'S',
        ss: 'RTO',
        d_pin: '226010',
        o_pin: '201016',
        cgm: '2500'
    };
    
    const queryString = new URLSearchParams(testParams).toString();
    const proxyUrl = `${SUPABASE_URL}/functions/v1/delhivery-proxy`;
    
    const params = new URLSearchParams({
        path: `/api/kinko/v1/invoice/charges/.json?${queryString}`,
        method: 'GET'
    });
    
    const fullUrl = `${proxyUrl}?${params.toString()}`;
    
    console.log('📡 Proxy URL:', fullUrl);
    
    try {
        console.log('🚀 Making proxy request...');
        
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        
        console.log('📊 Response Status:', response.status);
        
        const responseText = await response.text();
        console.log('📄 Raw Response:', responseText);
        
        if (response.ok) {
            const data = JSON.parse(responseText);
            console.log('✅ Parsed Response:', JSON.stringify(data, null, 2));
        } else {
            console.log('❌ Proxy Error:', responseText);
        }
        
    } catch (error) {
        console.log('💥 Proxy Request Failed:', error.message);
        console.log('💡 Make sure to set your actual Supabase credentials above.');
    }
}

// Run tests
async function runTests() {
    await testDelhiveryAPI();
    await testSupabaseProxy();
    
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('1. Set DELHIVERY_API_KEY in your Supabase environment variables');
    console.log('2. Update your Supabase anon key in this script');
    console.log('3. Test the integration in your React app');
    console.log('4. Verify delivery charges are calculated correctly');
}

// Check if running in Node.js environment
if (typeof fetch === 'undefined') {
    console.log('📦 Installing fetch for Node.js...');
    const { default: fetch } = await import('node-fetch');
    global.fetch = fetch;
}

runTests().catch(console.error);
