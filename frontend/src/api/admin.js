const API_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("token");
const headers = () => ({ Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" });

export const getAdminStats = async () => {
  const res = await fetch(`${API_URL}/admin/stats`, { headers: headers() });
  return res.json();
};
export const getAllUsers = async () => {
  const res = await fetch(`${API_URL}/admin/users`, { headers: headers() });
  return res.json();
};
export const getAllBookings = async () => {
  const res = await fetch(`${API_URL}/admin/bookings`, { headers: headers() });
  return res.json();
};
export const verifyUser = async (id) => {
  const res = await fetch(`${API_URL}/admin/users/${id}/verify`, { method: "PATCH", headers: headers() });
  return res.json();
};
export const deleteUser = async (id) => {
  const res = await fetch(`${API_URL}/admin/users/${id}`, { method: "DELETE", headers: headers() });
  return res.json();
};
export const updateBookingStatus = async (id, status) => {
  const res = await fetch(`${API_URL}/admin/bookings/${id}/status`, {
    method: "PATCH", headers: headers(), body: JSON.stringify({ status }),
  });
  return res.json();
};