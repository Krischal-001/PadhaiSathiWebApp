import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProfileById } from "../api/tutorProfile";
import { createBooking } from "../api/bookings";

export default function BookTutor() {
  const { tutor_id } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [form, setForm] = useState({ subject_id: "", booking_date: "", start_time: "", end_time: "", message: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getProfileById(tutor_id).then((data) => {
      if (!data.message) setTutor(data);
      else setError("Tutor not found");
    });
  }, [tutor_id]);

  const getDuration = () => {
    if (!form.start_time || !form.end_time || form.start_time >= form.end_time) return null;
    const [sh, sm] = form.start_time.split(":").map(Number);
    const [eh, em] = form.end_time.split(":").map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    const label = `${hrs > 0 ? hrs + "h " : ""}${rem > 0 ? rem + "m" : ""}`.trim();
    const cost = tutor?.hourly_rate ? `NPR ${Math.round((mins / 60) * tutor.hourly_rate)}` : null;
    return { label, cost };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.start_time >= form.end_time) return setError("End time must be after start time");
    setLoading(true);
    setError("");
    const res = await createBooking({
      tutor_id: Number(tutor_id),
      subject_id: Number(form.subject_id) || null,
      booking_date: form.booking_date,
      start_time: form.start_time,
      end_time: form.end_time,
      message: form.message,
    });
    setLoading(false);
    if (res.booking) { setSuccess(true); setTimeout(() => navigate("/bookings"), 2000); }
    else setError(res.message || "Something went wrong");
  };

  if (!tutor && !error) return <div style={S.container}><p style={S.muted}>Loading tutor...</p></div>;
  if (error && !tutor) return (
    <div style={S.container}>
      <p style={{ color: "#dc2626" }}>{error}</p>
      <button style={S.backBtn} onClick={() => navigate(-1)}>Go back</button>
    </div>
  );

  const dur = getDuration();

  return (
    <div style={S.container}>
      <button style={S.backBtn} onClick={() => navigate(-1)}>Back</button>

      <div style={S.tutorCard}>
        <h2 style={S.tutorHeading}>Book a session</h2>
        <p style={S.tutorMeta}>{tutor.city} &nbsp;|&nbsp; NPR {tutor.hourly_rate}/hr &nbsp;|&nbsp; {tutor.experience_years} yrs exp</p>
        <p style={S.tutorBio}>{tutor.bio}</p>
        <div style={S.tagRow}>
          {tutor.subjects?.map((s) => <span key={s.id} style={S.tag}>{s.name}</span>)}
        </div>
      </div>

      {success ? (
        <div style={S.successBox}>Booking request sent! Redirecting...</div>
      ) : (
        <form onSubmit={handleSubmit} style={S.form}>
          <h3 style={S.formTitle}>Session details</h3>
          {error && <p style={S.errorBox}>{error}</p>}

          <label style={S.label}>Subject</label>
          <select style={S.input} value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })}>
            <option value="">Select a subject</option>
            {tutor.subjects?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <label style={S.label}>Date</label>
          <input style={S.input} type="date" value={form.booking_date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setForm({ ...form, booking_date: e.target.value })} required />

          <div style={S.timeRow}>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Start time</label>
              <input style={S.input} type="time" value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={S.label}>End time</label>
              <input style={S.input} type="time" value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })} required />
            </div>
          </div>

          {dur && (
            <div style={S.durationBox}>
              Duration: {dur.label}{dur.cost ? `  |  Est. ${dur.cost}` : ""}
            </div>
          )}

          <label style={S.label}>Message (optional)</label>
          <textarea style={S.textarea} rows={3} value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Tell the tutor what you need help with..." />

          <button type="submit" style={S.submitBtn} disabled={loading}>
            {loading ? "Sending..." : "Send Booking Request"}
          </button>
        </form>
      )}
    </div>
  );
}

const S = {
  container: { maxWidth: 620, margin: "40px auto", padding: "0 20px", fontFamily: "system-ui, sans-serif" },
  backBtn: { background: "none", border: "none", color: "#4f46e5", cursor: "pointer", fontSize: 14, fontWeight: 600, padding: "0 0 16px", display: "block" },
  tutorCard: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px", marginBottom: 28 },
  tutorHeading: { fontSize: 18, fontWeight: 700, margin: "0 0 6px", color: "#111" },
  tutorMeta: { fontSize: 13, color: "#6b7280", marginBottom: 8 },
  tutorBio: { fontSize: 14, color: "#374151", lineHeight: 1.6, marginBottom: 12 },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  tag: { padding: "3px 10px", background: "#ede9fe", color: "#4f46e5", borderRadius: 20, fontSize: 12, fontWeight: 500 },
  form: { display: "flex", flexDirection: "column", gap: 14 },
  formTitle: { fontSize: 16, fontWeight: 600, color: "#111", margin: 0 },
  label: { fontWeight: 500, fontSize: 14, color: "#374151" },
  input: { padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 15, width: "100%", boxSizing: "border-box" },
  textarea: { padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 15, resize: "vertical", width: "100%", boxSizing: "border-box" },
  timeRow: { display: "flex", gap: 16 },
  durationBox: { background: "#ede9fe", color: "#4f46e5", padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600 },
  submitBtn: { padding: "13px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer" },
  errorBox: { color: "#dc2626", background: "#fef2f2", padding: "8px 12px", borderRadius: 8, fontSize: 14, margin: 0 },
  successBox: { background: "#d1fae5", color: "#065f46", padding: 20, borderRadius: 10, fontWeight: 600, textAlign: "center" },
  muted: { color: "#6b7280" },
};