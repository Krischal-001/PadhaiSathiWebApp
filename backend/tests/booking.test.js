const axios = require("axios");
const API = "http://localhost:5001/api";
const rand = Math.floor(Math.random() * 100000);

const studentUser = {
  username: `student${rand}`,
  full_name: "Booking Student",
  email: `student${rand}@example.com`,
  password: "TestPass123",
  role: "student",
};

const tutorUser = {
  username: `tutor${rand}`,
  full_name: "Booking Tutor",
  email: `tutor${rand}@example.com`,
  password: "TestPass123",
  role: "tutor",
};

let studentToken, tutorToken, tutorId, bookingId;

async function setup() {
  console.log("\n[SETUP] Creating student and tutor accounts");
  try {
    const studentRes = await axios.post(`${API}/auth/register`, studentUser);
    studentToken = studentRes.data.token;
    const tutorRes = await axios.post(`${API}/auth/register`, tutorUser);
    tutorToken = tutorRes.data.token;
    tutorId = tutorRes.data.user.id;
    console.log("  PASS - Student id:", studentRes.data.user.id, "| Tutor id:", tutorId);
    return true;
  } catch (err) {
    console.log("  FAIL -", err.response?.data?.message || err.message);
    return false;
  }
}

async function testCreateBooking() {
  console.log("\n[BOOKING] Create booking (as student)");
  try {
    const res = await axios.post(
      `${API}/bookings`,
      {
        tutor_id: tutorId,
        booking_date: "2026-08-01",
        start_time: "10:00",
        end_time: "11:00",
        message: "Need help with algebra",
      },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    bookingId = res.data.booking?.id || res.data.id;
    console.log("  PASS - Booking created, id:", bookingId);
    return true;
  } catch (err) {
    console.log("  FAIL -", err.response?.data?.message || err.message);
    return false;
  }
}

async function testCreateBookingNoAuth() {
  console.log("\n[BOOKING] Create booking without token (should fail 401)");
  try {
    await axios.post(`${API}/bookings`, {
      tutor_id: tutorId,
      booking_date: "2026-08-01",
      start_time: "10:00",
      end_time: "11:00",
    });
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

async function testGetMyBookingsAsStudent() {
  console.log("\n[BOOKING] Get bookings (as student)");
  try {
    const res = await axios.get(`${API}/bookings`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.log("  PASS - Bookings found:", res.data.length ?? "unknown format");
    return true;
  } catch (err) {
    console.log("  FAIL -", err.response?.data?.message || err.message);
    return false;
  }
}

async function testGetMyBookingsAsTutor() {
  console.log("\n[BOOKING] Get bookings (as tutor)");
  try {
    const res = await axios.get(`${API}/bookings`, {
      headers: { Authorization: `Bearer ${tutorToken}` },
    });
    console.log("  PASS - Bookings found:", res.data.length ?? "unknown format");
    return true;
  } catch (err) {
    console.log("  FAIL -", err.response?.data?.message || err.message);
    return false;
  }
}

async function testUpdateBookingStatus() {
  if (!bookingId) {
    console.log("\n[BOOKING] Update status - SKIPPED (no booking id from create step)");
    return false;
  }
  console.log("\n[BOOKING] Tutor confirms booking status");
  try {
    const res = await axios.put(
      `${API}/bookings/${bookingId}`,
      { status: "confirmed" },
      { headers: { Authorization: `Bearer ${tutorToken}` } }
    );
    console.log("  PASS - Status updated:", res.data.message || res.data.status);
    return true;
  } catch (err) {
    console.log("  FAIL -", err.response?.data?.message || err.message);
    return false;
  }
}

async function runAll() {
  console.log("=== BOOKING CONTROLLER TESTS ===");
  const results = [];
  const setupOk = await setup();
  if (!setupOk) {
    console.log("\nSetup failed, aborting remaining tests.");
    return;
  }
  results.push(await testCreateBooking());
  results.push(await testCreateBookingNoAuth());
  results.push(await testGetMyBookingsAsStudent());
  results.push(await testGetMyBookingsAsTutor());
  results.push(await testUpdateBookingStatus());

  const passed = results.filter(Boolean).length;
  console.log(`\n=== RESULT: ${passed}/${results.length} passed ===`);
}

runAll();
