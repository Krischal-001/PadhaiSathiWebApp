const API_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("token");

export const searchTutors = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await fetch(`${API_URL}/tutors?${params}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

export const getTutorById = async (id) => {
  const res = await fetch(`${API_URL}/tutors/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};