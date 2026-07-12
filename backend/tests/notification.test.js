// Run with: node tests/notification.test.js
// NOTE: assumes GET /api/notifications lists current user's notifications,
// and PUT /api/notifications/:id/read marks one as read. Adjust if different.
const axios = require("axios");
const API = "http://localhost:5001/api";
const rand = Math.floor(Math.random() * 100000);

const user = {
  username: `notifyuser${rand}`,
  full_name: "Notify User",
  email: `notifyuser${rand}@example.com`,
  password: "TestPass123",
  role: "student",
};

let token;

async function setup() {
  console.log("\n[SETUP] Register user");
  try {
    const res = await axios.post(`${API}/auth/register`, user);
    token = res.data.token;
    console.log("  PASS - registered");
    return true;
  } catch (err) {
    console.log("  FAIL -", err.response?.data?.message || err.message);
    return false;
  }
}

async function testGetNotifications() {
  console.log("\n[NOTIFICATION] Get my notifications");
  try {
    const res = await axios.get(`${API}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("  PASS - notifications found:", res.data.length ?? "unknown format");
    return true;
  } catch (err) {
    console.log("  FAIL -", err.response?.data?.message || err.message);
    return false;
  }
}

async function testGetNotificationsNoAuth() {
  console.log("\n[NOTIFICATION] Get notifications without token (should fail 401)");
  try {
    await axios.get(`${API}/notifications`);
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
  console.log("=== NOTIFICATION CONTROLLER TESTS ===");
  const results = [];
  if (!(await setup())) return;
  results.push(await testGetNotifications());
  results.push(await testGetNotificationsNoAuth());
  const passed = results.filter(Boolean).length;
  console.log(`\n=== RESULT: ${passed}/${results.length} passed ===`);
}

runAll();
