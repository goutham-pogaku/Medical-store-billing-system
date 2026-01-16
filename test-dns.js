// Quick DNS test script
require('dotenv').config();
const dns = require('dns').promises;

async function testDNS() {
  const hostname = process.env.DB_HOST;
  
  console.log('Testing DNS resolution for:', hostname);
  console.log('Using DNS servers:', dns.getServers());
  
  try {
    console.log('\n1. Testing IPv4 resolution...');
    const ipv4 = await dns.resolve4(hostname);
    console.log('✅ IPv4 addresses:', ipv4);
  } catch (error) {
    console.error('❌ IPv4 resolution failed:', error.message);
  }
  
  try {
    console.log('\n2. Testing IPv6 resolution...');
    const ipv6 = await dns.resolve6(hostname);
    console.log('✅ IPv6 addresses:', ipv6);
  } catch (error) {
    console.error('❌ IPv6 resolution failed:', error.message);
  }
  
  try {
    console.log('\n3. Testing general lookup...');
    const addresses = await dns.lookup(hostname);
    console.log('✅ Lookup result:', addresses);
  } catch (error) {
    console.error('❌ Lookup failed:', error.message);
  }
  
  try {
    console.log('\n4. Testing reverse lookup...');
    const ipv4 = await dns.resolve4(hostname);
    if (ipv4.length > 0) {
      const reverse = await dns.reverse(ipv4[0]);
      console.log('✅ Reverse lookup:', reverse);
    }
  } catch (error) {
    console.error('❌ Reverse lookup failed:', error.message);
  }
}

testDNS().then(() => {
  console.log('\n✅ DNS test completed');
  process.exit(0);
}).catch(err => {
  console.error('\n❌ DNS test failed:', err);
  process.exit(1);
});
