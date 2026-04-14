// Test script to verify product-specific sales functionality
// This can be run in the browser console or as a Node.js script

async function testProductSpecificSales() {
  console.log('Testing Product-Specific Sales Functionality...\n');
  
  try {
    // Test 1: Get active sales
    console.log('1. Fetching active sales...');
    const salesResponse = await fetch('/api/sale-discounts');
    const salesData = await salesResponse.json();
    
    if (salesData.success) {
      console.log(`Found ${salesData.data.length} active sales:`);
      salesData.data.forEach((sale, index) => {
        console.log(`  ${index + 1}. ${sale.title} (${sale.discountType}) - ${sale.discountValue}% OFF`);
        if (sale.discountType === 'product-specific') {
          console.log(`     Applicable Products: ${sale.applicableProducts?.length || 0} products`);
          console.log(`     Product IDs:`, sale.applicableProducts);
        }
      });
    }
    
    // Test 2: Get products
    console.log('\n2. Fetching products...');
    const productsResponse = await fetch('/api/products');
    const productsData = await productsResponse.json();
    
    if (productsData.success) {
      console.log(`Found ${productsData.data.length} products:`);
      productsData.data.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} (ID: ${product._id}) - $${product.price}`);
      });
    }
    
    // Test 3: Test discount calculation for cart
    console.log('\n3. Testing cart discount calculation...');
    if (productsData.success && productsData.data.length > 0) {
      const testCart = [{
        id: productsData.data[0]._id,
        name: productsData.data[0].name,
        price: productsData.data[0].price,
        quantity: 1
      }];
      
      const cartResponse = await fetch('/api/sale-discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: testCart })
      });
      
      const cartData = await cartResponse.json();
      
      if (cartData.success) {
        console.log('Cart discount result:');
        console.log(`  Original Total: $${testCart[0].price}`);
        console.log(`  Discount Applied: $${cartData.data.totalDiscount}`);
        console.log(`  Final Total: $${(testCart[0].price - cartData.data.totalDiscount).toFixed(2)}`);
        
        if (cartData.data.discountedItems[0]?.discount) {
          console.log(`  Applied Sale: ${cartData.data.discountedItems[0].discount.title}`);
          console.log(`  Sale Type: ${cartData.data.discountedItems[0].discount.discountType}`);
        }
      }
    }
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Instructions:
// 1. Open your browser and navigate to your e-commerce site
// 2. Open the browser console (F12)
// 3. Copy and paste this entire script into the console
// 4. Run: testProductSpecificSales()

// For Node.js testing, you would need to modify the fetch calls to work with your testing framework
