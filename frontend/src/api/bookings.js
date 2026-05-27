const API_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("token");

export const createBooking = async (data) => {
  const res = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getMyBookings = async () => {
  const res = await fetch(`${API_URL}/bookings/my`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

export const updateBookingStatus = async (id, status) => {
  const res = await fetch(`${API_URL}/bookings/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ status }),
  });
  return res.json();
};