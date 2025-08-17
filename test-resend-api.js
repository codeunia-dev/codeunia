import { Resend } from 'resend';

// Test script to verify Resend API configuration
async function testResendAPI() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  console.log('🧪 Testing Resend API Configuration...');
  console.log('API Key:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing');
  
  try {
    // Test 1: Check if API key is valid by attempting to get domains
    console.log('\n1️⃣ Testing API Key validity...');
    
    // Test 2: Try sending a simple test email
    console.log('\n2️⃣ Testing email sending...');
    const result = await resend.emails.send({
      from: 'Codeunia <noreply@codeunia.com>',
      to: ['test@test.com'], // This will fail but help us see the error
      subject: 'Test Email',
      html: '<p>This is a test email</p>',
    });
    
    if (result.error) {
      console.log('❌ Email send error:', result.error);
    } else {
      console.log('✅ Email would be sent successfully:', result.data);
    }
    
  } catch (error) {
    console.error('❌ Resend API Error:', error);
  }
}

testResendAPI();
