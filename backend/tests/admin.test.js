// Run with: node tests/admin.test.js
// NOTE: assumes GET /api/admin/users lists all users, admin-only. Adjust route if different.
const axios = require("axios");
const API = "http://localhost:5001/api";

// Use the real admin account you already created
const adminCreds = {
  email: "admin@padhaisathi.com",
  password: "YourAdminPassword123",
};

const rand = Math.floor(Math.random() * 100000);
const regularUser = {
  username: `regular${rand}`,
  full_name: "Regular User",
  email: `regular${rand}@example.com`,
  password: "TestPass123",
  role: "student",
};

let adminToken, regularToken;

async function setup() {
  console.log("\n[SETUP] Login as admin, register regular user");
  try {
    const adminRes = await axios.post(`${API}/auth/login`, adminCreds);
    adminToken = adminRes.data.token;
    console.log("  PASS - admin logged in");

    const regRes = await axios.post(`${API}/auth/register`, regularUser);
    regularToken = regRes.data.token;
    console.log("  PASS - regular user registered");
    return true;
  } catch (err) {
    console.log("  FAIL -", err.response?.data?.message || err.message);
    return false;
  }
}

async function testAdminAccessAllowed() {
  console.log("\n[ADMIN] Access admin route as admin (should succeed)");
  try {
    const res = await axios.get(`${API}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log("  PASS - users found:", res.data.length ?? "unknown format");
    return true;
  } catch (err) {
    console.log("  FAIL -", err.response?.data?.message || err.message);
    return false;
  }
}

async function testAdminAccessBlockedForRegularUser() {
  console.log("\n[ADMIN] Access admin route as regular user (should fail 403)");
  try {
    await axios.get(`${API}/admin/users`, {
      headers: { Authorization: `Bearer ${regularToken}` },
    });
    console.log("  FAIL - Regular user should NOT have access");
    return false;
  } catch (err) {
    if (err.response?.status === 403) {
      console.log("  PASS - Correctly blocked with 403");
      return true;
    }
    console.log("  FAIL - Wrong status (expected 403):", err.response?.status);
    return false;
  }
}

async function testAdminAccessNoAuth() {
  console.log("\n[ADMIN] Access admin route without token (should fail 401)");
  try {
    await axios.get(`${API}/admin/users`);
    console.log("  FAIL - Should have been rejected");
    return false;
  } catch (err) {
    if (err.response?.status === 401) {
      console.log("  PASS - Correctly rejected with 401");
      return true;
    }
    console.log("  FAIL - Wrong status:", err.response?.status);
    return false;
  }
}

async function runAll() {
  console.log("=== ADMIN CONTROLLER TESTS ===");
  const results = [];
  if (!(await setup())) return;
  results.push(await testAdminAccessAllowed());
  results.push(await testAdminAccessBlockedForRegularUser());
  results.push(await testAdminAccessNoAuth());
  const passed = results.filter(Boolean).length;
  console.log(`\n=== RESULT: ${passed}/${results.length} passed ===`);
}

runAll();
