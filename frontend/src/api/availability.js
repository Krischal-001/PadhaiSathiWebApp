const API_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("token");
const h = () => ({ Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" });

export const getMyAvailability = async () => {
  const res = await fetch(`${API_URL}/availability/my`, { headers: h() });
  return res.json();
};

export const getTutorAvailability = async (tutor_id) => {
  const res = await fetch(`${API_URL}/availability/tutor/${tutor_id}`, { headers: h() });
  return res.json();
};

export const addSlot = async (data) => {
  const res = await fetch(`${API_URL}/availability`, { method: "POST", headers: h(), body: JSON.stringify(data) });
  return res.json();
};

export const removeSlot = async (id) => {
  const res = await fetch(`${API_URL}/availability/${id}`, { method: "DELETE", headers: h() });
  return res.json();
};

export const blockDate = async (data) => {
  const res = await fetch(`${API_URL}/availability/block`, { method: "POST", headers: h(), body: JSON.stringify(data) });
  return res.json();
};

export const unblockDate = async (id) => {
  const res = await fetch(`${API_URL}/availability/block/${id}`, { method: "DELETE", headers: h() });
  return res.json();
};