// Check if codeunia.com domain is verified in Resend
const { Resend } = require('resend');

async function checkDomainStatus() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    console.log('🔍 Checking domain verification status...');
    
    // This will show all domains in your Resend account
    const domains = await resend.domains.list();
    console.log('📋 Domains in your Resend account:', domains);
    
    // Check specifically for codeunia.com
    const codeuniaDomain = domains.data?.find(domain => 
      domain.name === 'codeunia.com'
    );
    
    if (codeuniaDomain) {
      console.log('✅ codeunia.com found in Resend account');
      console.log('Status:', codeuniaDomain.status);
      console.log('Details:', codeuniaDomain);
    } else {
      console.log('❌ codeunia.com NOT found in Resend account');
      console.log('You need to add and verify the domain first');
    }
    
  } catch (error) {
    console.error('❌ Error checking domains:', error);
  }
}

checkDomainStatus();
