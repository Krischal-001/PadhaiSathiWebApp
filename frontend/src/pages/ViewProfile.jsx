import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMyProfile, getProfileById } from "../api/tutorProfile";

export default function ViewProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

 useEffect(() => {
  const fetchData = id ? getProfileById(id) : getMyProfile();
  fetchData.then((data) => {
    if (data.message) setError(data.message);
    else setProfile(data);
  }).catch(() => setError("Failed to load profile"));
}, [id]);

  if (error) return (
    <div style={styles.container}>
      <p style={styles.error}>{error}</p>
      <button style={styles.btn} onClick={() => navigate("/profile/create")}>
        Create Profile
      </button>
    </div>
  );

  if (!profile) return <div style={styles.container}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.topRow}>
          <div>
            <h2 style={styles.name}>Tutor Profile</h2>
            <p style={styles.city}>📍 {profile.city}</p>
          </div>
          <div style={styles.rateBox}>
            <span style={styles.rate}>NPR {profile.hourly_rate}</span>
            <span style={styles.rateLabel}>/hr</span>
          </div>
        </div>

        <p style={styles.bio}>{profile.bio}</p>

        <div style={styles.infoRow}>
          <span style={styles.badge}>🎓 {profile.experience_years} yrs experience</span>
          <span style={{ ...styles.badge, background: profile.is_available ? "#d1fae5" : "#fee2e2", color: profile.is_available ? "#065f46" : "#991b1b" }}>
            {profile.is_available ? "✅ Available" : "❌ Unavailable"}
          </span>
        </div>

        {profile.subjects?.length > 0 && (
          <div style={styles.subjectSection}>
            <p style={styles.subjectTitle}>Subjects</p>
            <div style={styles.subjectGrid}>
              {profile.subjects.map((s) => (
                <span key={s.id} style={styles.subjectTag}>{s.name}</span>
              ))}
            </div>
          </div>
        )}

        {!id && (
         <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
  <button style={styles.editBtn} onClick={() => navigate("/profile/edit")}>
    Edit Profile
  </button>
  <button style={{ ...styles.editBtn, background: '#f3f4f6', color: '#111' }} onClick={() => navigate("/dashboard")}>
    Dashboard
  </button>
</div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 640, margin: "40px auto", padding: "0 20px" },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 28 },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  name: { fontSize: 22, fontWeight: 700, color: "#111", margin: 0 },
  city: { color: "#6b7280", marginTop: 4, fontSize: 14 },
  rateBox: { textAlign: "right" },
  rate: { fontSize: 22, fontWeight: 700, color: "#4f46e5" },
  rateLabel: { fontSize: 14, color: "#6b7280" },
  bio: { color: "#374151", lineHeight: 1.6, marginBottom: 16 },
  infoRow: { display: "flex", gap: 10, marginBottom: 20 },
  badge: { padding: "4px 12px", borderRadius: 20, background: "#f3f4f6", fontSize: 13, fontWeight: 500 },
  subjectSection: { marginTop: 8 },
  subjectTitle: { fontWeight: 600, fontSize: 14, color: "#374151", marginBottom: 8 },
  subjectGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  subjectTag: { padding: "4px 12px", background: "#ede9fe", color: "#4f46e5", borderRadius: 20, fontSize: 13, fontWeight: 500 },
  editBtn: { marginTop: 20, padding: "10px 24px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 },
  error: { color: "red" },
  btn: { padding: "10px 20px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" },
};