const API_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("token");
const h = () => ({ Authorization: `Bearer ${getToken()}` });

export const getNotifications = async () => {
  const res = await fetch(`${API_URL}/notifications`, { headers: h() });
  return res.json();
};

export const markAllRead = async () => {
  const res = await fetch(`${API_URL}/notifications/read-all`, { method: "PATCH", headers: h() });
  return res.json();
};