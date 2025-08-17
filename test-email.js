// Simple Node.js test for the membership email API
const testEmailAPI = async () => {
  const API_URL = "http://localhost:3000/api/membership/send-card";
  
  console.log("🧪 Testing Membership Card Email System...");
  console.log("==========================================");
  
  // Test 1: Free membership email
  console.log("\n1️⃣ Testing Free Membership Email:");
  try {
    const response1 = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: "test-user-123",
        email: "test@example.com", // Change this to your email to receive the test
        name: "Test User",
        membershipType: "free",
        membershipId: "FREE-001-2025"
      })
    });
    
    const result1 = await response1.json();
    console.log("Response:", result1);
  } catch (error) {
    console.log("Error:", error.message);
  }
  
  // Test 2: Premium membership email
  console.log("\n2️⃣ Testing Premium Membership Email:");
  try {
    const response2 = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: "test-user-456",
        email: "premium@example.com", // Change this to your email to receive the test
        name: "Premium User",
        membershipType: "premium",
        membershipId: "PREM-002-2025"
      })
    });
    
    const result2 = await response2.json();
    console.log("Response:", result2);
  } catch (error) {
    console.log("Error:", error.message);
  }
  
  // Test 3: Error case (missing fields)
  console.log("\n3️⃣ Testing Missing Fields (Error Case):");
  try {
    const response3 = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: "incomplete@example.com"
        // Missing required fields
      })
    });
    
    const result3 = await response3.json();
    console.log("Response:", result3);
  } catch (error) {
    console.log("Error:", error.message);
  }
  
  console.log("\n✅ Test completed!");
  console.log("📧 Check your email inbox for test emails");
  console.log("🔍 Check the Next.js terminal for any server logs");
};

testEmailAPI();
