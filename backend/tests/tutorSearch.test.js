// Run with: node tests/tutorSearch.test.js
// NOTE: assumes GET /api/tutors as the search/list endpoint with optional query params
// (e.g. ?city=, ?subject=). Adjust if your actual route differs.
const axios = require("axios");
const API = "http://localhost:5001/api";
const rand = Math.floor(Math.random() * 100000);

const studentUser = {
  username: `searchuser${rand}`,
  full_name: "Search User",
  email: `searchuser${rand}@example.com`,
  password: "TestPass123",
  role: "student",
};

let token;

async function setup() {
  console.log("\n[SETUP] Register student for search auth");
  try {
    const res = await axios.post(`${API}/auth/register`, studentUser);
    token = res.data.token;
    console.log("  PASS - logged in as student");
    return true;
  } catch (err) {
    console.log("  FAIL -", err.response?.data?.message || err.message);
    return false;
  }
}

async function testListTutors() {
  console.log("\n[TUTOR SEARCH] List all tutors");
  try {
    const res = await axios.get(`${API}/tutors`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("  PASS - tutors found:", res.data.length ?? "unknown format");
    return true;
  } catch (err) {
    console.log("  FAIL -", err.response?.data?.message || err.message);
    return false;
  }
}

async function testSearchByCity() {
  console.log("\n[TUTOR SEARCH] Search by city=Kathmandu");
  try {
    const res = await axios.get(`${API}/tutors?city=Kathmandu`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("  PASS - results:", res.data.length ?? "unknown format");
    return true;
  } catch (err) {
    console.log("  FAIL -", err.response?.data?.message || err.message);
    return false;
  }
}

async function testSearchNoResults() {
  console.log("\n[TUTOR SEARCH] Search with nonsense filter (should return empty, not error)");
  try {
    const res = await axios.get(`${API}/tutors?city=Nowhereville123`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("  PASS - results:", res.data.length ?? 0);
    return true;
  } catch (err) {
    console.log("  FAIL -", err.response?.data?.message || err.message);
    return false;
  }
}

async function runAll() {
  console.log("=== TUTOR SEARCH CONTROLLER TESTS ===");
  const results = [];
  if (!(await setup())) return;
  results.push(await testListTutors());
  results.push(await testSearchByCity());
  results.push(await testSearchNoResults());
  const passed = results.filter(Boolean).length;
  console.log(`\n=== RESULT: ${passed}/${results.length} passed ===`);
}

runAll();