// Run with: node tests/review.test.js
// NOTE: assumes POST /api/reviews to create, GET /api/reviews/:tutorId to list for a tutor.
// Adjust if your actual routes differ.
const axios = require("axios");
const API = "http://localhost:5001/api";
const rand = Math.floor(Math.random() * 100000);

const studentUser = {
  username: `reviewer${rand}`,
  full_name: "Reviewer Student",
  email: `reviewer${rand}@example.com`,
  password: "TestPass123",
  role: "student",
};

const tutorUser = {
  username: `reviewedtutor${rand}`,
  full_name: "Reviewed Tutor",
  email: `reviewedtutor${rand}@example.com`,
  password: "TestPass123",
  role: "tutor",
};

let studentToken, tutorId;

async function setup() {
  console.log("\n[SETUP] Register student and tutor");
  try {
    const studentRes = await axios.post(`${API}/auth/register`, studentUser);
    studentToken = studentRes.data.token;

    const tutorRes = await axios.post(`${API}/auth/register`, tutorUser);
    tutorId = tutorRes.data.user.id;

    console.log("  PASS - student ready, tutor id:", tutorId);
    return true;
  } catch (err) {
    console.log("  FAIL -", err.response?.data?.message || err.message);
    return false;
  }
}

async function testCreateReview() {
  console.log("\n[REVIEW] Create review for tutor");
  try {
    const res = await axios.post(
      `${API}/reviews`,
      { tutor_id: tutorId, rating: 5, comment: "Great tutor, very helpful!" },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    console.log("  PASS -", res.data.message || "review created");
    return true;
  } catch (err) {
    console.log("  FAIL -", err.response?.data?.message || err.message);
    return false;
  }
}

async function testCreateReviewNoAuth() {
  console.log("\n[REVIEW] Create review without token (should fail 401)");
  try {
    await axios.post(`${API}/reviews`, { tutor_id: tutorId, rating: 5, comment: "x" });
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

async function testGetReviewsForTutor() {
  console.log("\n[REVIEW] Get reviews for tutor id:", tutorId);
  try {
    const res = await axios.get(`${API}/reviews/${tutorId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.log("  PASS - reviews found:", res.data.length ?? "unknown format");
    return true;
  } catch (err) {
    console.log("  FAIL -", err.response?.data?.message || err.message);
    return false;
  }
}

async function testInvalidRating() {
  console.log("\n[REVIEW] Create review with invalid rating (should fail 400)");
  try {
    await axios.post(
      `${API}/reviews`,
      { tutor_id: tutorId, rating: 99, comment: "bad rating" },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    console.log("  FAIL - Should have been rejected (or your controller allows any int - verify)");
    return false;
  } catch (err) {
    if (err.response?.status === 400) {
      console.log("  PASS - Correctly rejected:", err.response.data.message);
      return true;
    }
    console.log("  FAIL - Wrong status:", err.response?.status);
    return false;
  }
}

async function runAll() {
  console.log("=== REVIEW CONTROLLER TESTS ===");
  const results = [];
  if (!(await setup())) return;
  results.push(await testCreateReview());
  results.push(await testCreateReviewNoAuth());
  results.push(await testGetReviewsForTutor());
  results.push(await testInvalidRating());
  const passed = results.filter(Boolean).length;
  console.log(`\n=== RESULT: ${passed}/${results.length} passed ===`);
}

runAll();
