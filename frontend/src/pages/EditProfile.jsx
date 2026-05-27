import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSubjects, getMyProfile, updateProfile } from "../api/tutorProfile";

export default function EditProfile() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getSubjects(), getMyProfile()]).then(([subs, profile]) => {
      setSubjects(subs);
      setForm({
        bio: profile.bio || "",
        hourly_rate: profile.hourly_rate || "",
        city: profile.city || "",
        experience_years: profile.experience_years || "",
        is_available: profile.is_available ?? true,
        subject_ids: profile.subjects?.map((s) => s.id) || [],
      });
    });
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
    const res = await updateProfile({
      ...form,
      hourly_rate: Number(form.hourly_rate),
      experience_years: Number(form.experience_years),
    });
    setLoading(false);
    if (res.profile) navigate("/profile/me");
    else setError(res.message || "Something went wrong");
  };

  if (!form) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Edit Your Profile</h2>
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>Bio</label>
        <textarea
          style={styles.textarea}
          rows={4}
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          required
        />

        <label style={styles.label}>Hourly Rate (NPR)</label>
        <input
          style={styles.input}
          type="number"
          value={form.hourly_rate}
          onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
          required
        />

        <label style={styles.label}>City</label>
        <input
          style={styles.input}
          type="text"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          required
        />

        <label style={styles.label}>Years of Experience</label>
        <input
          style={styles.input}
          type="number"
          value={form.experience_years}
          onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
          required
        />

        <label style={styles.label}>
          <input
            type="checkbox"
            checked={form.is_available}
            onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
            style={{ marginRight: 8 }}
          />
          Available for students
        </label>

        <label style={styles.label}>Subjects</label>
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

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" style={styles.cancelBtn} onClick={() => navigate("/profile/me")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: 600, margin: "40px auto", padding: "0 20px" },
  heading: { fontSize: 24, fontWeight: 600, marginBottom: 24, color: "#111" },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  label: { fontWeight: 500, fontSize: 14, color: "#374151" },
  input: { padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 15 },
  textarea: { padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 15, resize: "vertical" },
  subjectGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  subjectBtn: { padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500 },
  submitBtn: { padding: "12px 24px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" },
  cancelBtn: { padding: "12px 24px", background: "#f3f4f6", color: "#111", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" },
  error: { color: "red", fontSize: 14 },
};