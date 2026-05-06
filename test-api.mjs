import https from 'https';

// A minimal script to test the backend API
async function run() {
  const loginPayload = {
    email: "admin@test.com", // Adjust as necessary
    password: "Password123!" // Adjust as necessary
  };

  try {
    // 1. Try to register first, just in case
    console.log('Testing Register...');
    const regRes = await fetch('https://backend-4h8h.onrender.com/api/Auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schoolName: "Test School",
        adminName: "Admin",
        email: "testadmin@leoned.com",
        password: "Password123!",
        subscriptionPlan: "Free"
      })
    });
    console.log('Register response:', regRes.status);
    
    // 2. Login
    console.log('Testing Login...');
    const loginRes = await fetch('https://backend-4h8h.onrender.com/api/Auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "testadmin@leoned.com",
        password: "Password123!"
      })
    });
    console.log('Login response:', loginRes.status);
    const loginData = await loginRes.json();
    const token = loginData.token || loginData.data?.token || loginData.accessToken;
    
    if (!token) {
      console.error('Failed to get token', loginData);
      return;
    }
    
    console.log('Token acquired. Testing AcademicSession creation...');
    
    // 3. Create Academic Session
    const payload = {
      name: "2025/2026",
      startDate: "2026-06-01T00:00:00Z",
      endDate: "2026-11-06T00:00:00Z"
    };
    console.log('Sending payload:', JSON.stringify(payload));
    
    const sessionRes = await fetch('https://backend-4h8h.onrender.com/api/AcademicSession', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Session response status:', sessionRes.status);
    const sessionText = await sessionRes.text();
    console.log('Session response body:', sessionText);
    
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
