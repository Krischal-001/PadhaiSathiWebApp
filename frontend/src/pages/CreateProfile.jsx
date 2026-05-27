import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSubjects, createProfile } from "../api/tutorProfile";

export default function CreateProfile() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({
    bio: "",
    hourly_rate: "",
    city: "",
    experience_years: "",
    subject_ids: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSubjects()
      .then((data) => {
        if (Array.isArray(data)) setSubjects(data);
      })
      .catch(() => setError("Failed to load subjects"));
  }, []);

  const toggleSubject = (id) => {
    setForm((prev) => ({
      ...prev,
      subject_ids: prev.subject_ids.includes(id)
        ? prev.subject_ids.filter((s) => s !== id)
        : [...prev.subject_ids, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await createProfile({
        ...form,
        hourly_rate: Number(form.hourly_rate),
        experience_years: Number(form.experience_years),
      });
      if (res.profile) {
        navigate("/profile/me");
      } else {
        setError(res.message || "Something went wrong");
      }
    } catch {
      setError("Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </button>
      </div>
      <h2 style={styles.heading}>Create Your Tutor Profile</h2>
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>Bio</label>
        <textarea
          style={styles.textarea}
          rows={4}
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          placeholder="Tell students about yourself..."
          required
        />
        <label style={styles.label}>Hourly Rate (NPR)</label>
        <input
          style={styles.input}
          type="number"
          value={form.hourly_rate}
          onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
          placeholder="e.g. 500"
          required
        />
        <label style={styles.label}>City</label>
        <input
          style={styles.input}
          type="text"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          placeholder="e.g. Kathmandu"
          required
        />
        <label style={styles.label}>Years of Experience</label>
        <input
          style={styles.input}
          type="number"
          value={form.experience_years}
          onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
          placeholder="e.g. 3"
          required
        />
        <label style={styles.label}>Subjects You Teach</label>
        <div style={styles.subjectGrid}>
          {subjects.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => toggleSubject(s.id)}
              style={{
                ...styles.subjectBtn,
                background: form.subject_ids.includes(s.id) ? "#4f46e5" : "#f3f4f6",
                color: form.subject_ids.includes(s.id) ? "#fff" : "#111",
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
        <button type="submit" style={styles.submitBtn} disabled={loading}>
          {loading ? "Creating..." : "Create Profile"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: 600, margin: "40px auto", padding: "0 20px" },
  topBar: { marginBottom: 16 },
  backBtn: { background: "none", border: "none", color: "#4f46e5", cursor: "pointer", fontSize: 14, fontWeight: 600, padding: 0 },
  heading: { fontSize: 24, fontWeight: 600, marginBottom: 24, color: "#111" },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  label: { fontWeight: 500, fontSize: 14, color: "#374151" },
  input: { padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 15 },
  textarea: { padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 15, resize: "vertical" },
  subjectGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  subjectBtn: { padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500 },
  submitBtn: { padding: "12px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer", marginTop: 8 },
  error: { color: "red", fontSize: 14 },
};