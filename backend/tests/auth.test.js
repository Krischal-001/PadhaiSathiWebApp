const axios = require("axios");
const API = "http://localhost:5001/api";
const rand = Math.floor(Math.random() * 100000);
const testUser = {
  username: `authtest${rand}`, full_name: "Auth Test User",
  email: `authtest${rand}@example.com`, password: "TestPass123", role: "student",
};
let token;
async function testRegister() {
  console.log("\n[AUTH] Register");
  try {
    const res = await axios.post(`${API}/auth/register`, testUser);
    console.log("  PASS - Registered:", res.data.user.email); return true;
  } catch (err) { console.log("  FAIL -", err.response?.data?.message || err.message); return false; }
}
async function testLogin() {
  console.log("\n[AUTH] Login");
  try {
    const res = await axios.post(`${API}/auth/login`, { email: testUser.email, password: testUser.password });
    token = res.data.token; console.log("  PASS - Logged in"); return true;
  } catch (err) { console.log("  FAIL -", err.response?.data?.message || err.message); return false; }
}
async function testGetMe() {
  console.log("\n[AUTH] Get /auth/me");
  try {
    const res = await axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    console.log("  PASS - Got user:", res.data.email); return true;
  } catch (err) { console.log("  FAIL -", err.response?.data?.message || err.message); return false; }
}
async function runAll() {
  console.log("=== AUTH CONTROLLER TESTS ===");
  const r = [await testRegister(), await testLogin(), await testGetMe()];
  console.log(`\n=== RESULT: ${r.filter(Boolean).length}/${r.length} passed ===`);
}
runAll();
