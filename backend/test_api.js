const axios = require("axios");

const API = "http://localhost:5001/api";
const rand = Math.floor(Math.random() * 100000);

const testUser = {
  username: `testuser${rand}`,
  full_name: "Test User",
  email: `testuser${rand}@example.com`,
  password: "TestPass123",
  role: "student",
};

async function run() {
  console.log("=== Testing PadhaiSathi API ===\n");

  try {
    console.log("1. Registering:", testUser.username, testUser.email);
    const res = await axios.post(`${API}/auth/register`, testUser);
    console.log("   Register success:", res.data.message);
  } catch (err) {
    console.log("   Register failed:", err.response?.data?.message || err.message);
    return;
  }

  let token;
  try {
    console.log("\n2. Logging in as:", testUser.email);
    const res = await axios.post(`${API}/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });
    console.log("   Login success:", res.data.message);
    token = res.data.token;
  } catch (err) {
    console.log("   Login failed:", err.response?.data?.message || err.message);
    return;
  }

  try {
    console.log("\n3. Fetching /auth/me with token");
    const res = await axios.get(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("   getMe success:", res.data);
  } catch (err) {
    console.log("   getMe failed:", err.response?.data?.message || err.message);
  }

  try {
    console.log("\n4. Fetching /tutor-profile/subjects");
    const res = await axios.get(`${API}/tutor-profile/subjects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("   Subjects fetched:", res.data.length, "subjects found");
  } catch (err) {
    console.log("   Subjects fetch failed:", err.response?.data?.message || err.message);
  }

  try {
    console.log("\n5. Re-registering same user (should fail with 400)");
    await axios.post(`${API}/auth/register`, testUser);
    console.log("   Unexpected: duplicate registration succeeded");
  } catch (err) {
    const status = err.response?.status;
    console.log(`   Rejected with status ${status}:`, err.response?.data?.message || err.message);
  }

  console.log("\n=== Test run complete ===");
}

run();
