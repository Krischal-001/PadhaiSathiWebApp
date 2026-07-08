const API_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem("token");

export const getSubjects = async () => {
  const res = await fetch(`${API_URL}/tutor-profile/subjects`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

export const createProfile = async (data) => {
  const res = await fetch(`${API_URL}/tutor-profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getMyProfile = async () => {
  const res = await fetch(`${API_URL}/tutor-profile/me`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

export const getProfileById = async (id) => {
  const res = await fetch(`${API_URL}/tutor-profile/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

export const updateProfile = async (data) => {
  const res = await fetch(`${API_URL}/tutor-profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  
  return res.json();
};