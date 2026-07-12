// Run with: node tests/tutorProfile.test.js
const axios = require("axios");
const API = "http://localhost:5001/api";
const rand = Math.floor(Math.random() * 100000);

const tutorUser = {
  username: `tprofile${rand}`,
  full_name: "Profile Tutor",
  email: `tprofile${rand}@example.com`,
  password: "TestPass123",
  role: "tutor",
};

let token, userId, subjectIds = [];

async function setup() {
  console.log("\n[SETUP] Register tutor");
  try {
    const res = await axios.post(`${API}/auth/register`, tutorUser);
    token = res.data.token;
    userId = res.data.user.id;
    console.log("  PASS - Tutor id:", userId);
    return true;
  } catch (err) {
    console.log("  FAIL -", err.response?.data?.message || err.message);
    return false;
  }
}

async function testGetSubjects() {
  console.log("\n[TUTOR PROFILE] Get subjects list");
  try {
    const res = await axios.get(`${API}/tutor-profile/subjects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    subjectIds = res.data.slice(0, 2).map((s) => s.id);
    console.log("  PASS -", res.data.length, "subjects, using ids:", subjectIds);
    return true;
  } catch (err) {
    console.log("  FAIL -", err.response?.data?.message || err.message);
    return false;
  }
}

async function testCreateProfile() {
  console.log("\n[TUTOR PROFILE] Create profile");
  try {
    const res = await axios.post(
      `${API}/tutor-profile`,
      {
        bio: "Experienced math tutor",
        hourly_rate: 500,
        city: "Kathmandu",
        experience_years: 3,
        subject_ids: subjectIds,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("  PASS -", res.data.message);
    return true;
  } catch (err) {
    console.log("  FAIL -", err.response?.data?.message || err.message);
    return false;
  }
}

async function testCreateDuplicateProfile() {
  console.log("\n[TUTOR PROFILE] Create duplicate profile (should fail 400)");
  try {
    await axios.post(
      `${API}/tutor-profile`,
      { bio: "again", hourly_rate: 400, city: "Pokhara", experience_years: 1 },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("  FAIL - Should have been rejected");
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

async function testGetMyProfile() {
  console.log("\n[TUTOR PROFILE] Get my profile");
  try {
    const res = await axios.get(`${API}/tutor-profile/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("  PASS - bio:", res.data.bio);
    return true;
  } catch (err) {
    console.log("  FAIL -", err.response?.data?.message || err.message);
    return false;
  }
}

async function testGetProfileById() {
  console.log("\n[TUTOR PROFILE] Get profile by user id:", userId);
  try {
    const res = await axios.get(`${API}/tutor-profile/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("  PASS - city:", res.data.city);
    return true;
  } catch (err) {
    console.log("  FAIL -", err.response?.data?.message || err.message);
    return false;
  }
}

async function testUpdateProfile() {
  console.log("\n[TUTOR PROFILE] Update profile");
  try {
    const res = await axios.put(
      `${API}/tutor-profile`,
      { bio: "Updated bio", hourly_rate: 600, city: "Lalitpur", experience_years: 4, is_available: true },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("  PASS -", res.data.message);
    return true;
  } catch (err) {
    console.log("  FAIL -", err.response?.data?.message || err.message);
    return false;
  }
}

async function runAll() {
  console.log("=== TUTOR PROFILE CONTROLLER TESTS ===");
  const results = [];
  if (!(await setup())) return;
  results.push(await testGetSubjects());
  results.push(await testCreateProfile());
  results.push(await testCreateDuplicateProfile());
  results.push(await testGetMyProfile());
  results.push(await testGetProfileById());
  results.push(await testUpdateProfile());
  const passed = results.filter(Boolean).length;
  console.log(`\n=== RESULT: ${passed}/${results.length} passed ===`);
}

runAll();
