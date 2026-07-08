const fetch = require('node-fetch');

async function test() {
  const payload = {
    fullName: "Ronaldo",
    email: "test.ronaldo@gmail.com",
    password: "password123",
    role: "BURSAR"
  };

  try {
    const res = await fetch("https://leoned.vercel.app/api/bursar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch(e) {
    console.error(e);
  }
}

test();
