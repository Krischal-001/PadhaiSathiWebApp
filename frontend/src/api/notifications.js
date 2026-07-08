const API_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("token");
const h = () => ({ Authorization: `Bearer ${getToken()}` });

export const getNotifications = async () => {
  try {
    const res = await fetch(`${API_URL}/notifications`, { headers: h() });
    if (!res.ok) return { notifications: [], unread_count: 0 };
    return res.json();
  } catch {
    return { notifications: [], unread_count: 0 };
  }
};

export const markAllRead = async () => {
  try {
    const res = await fetch(`${API_URL}/notifications/read-all`, { method: "PATCH", headers: h() });
    return res.json();
  } catch {
    
    return {};
  }
};