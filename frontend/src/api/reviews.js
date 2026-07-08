const API_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("token");
const h = () => ({ Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" });

export const createReview = async (data) => {
  const res = await fetch(`${API_URL}/reviews`, { method: "POST", headers: h(), body: JSON.stringify(data) });
  return res.json();
};

export const getTutorReviews = async (tutor_id) => {
  const res = await fetch(`${API_URL}/reviews/tutor/${tutor_id}`, { headers: h() });
  
  return res.json();
};