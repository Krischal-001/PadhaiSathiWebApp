import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getProfileById } from "../api/tutorProfile";
import { createBooking } from "../api/bookings";

const TIME_SLOTS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00",
];

export default function BookTutor() {
  const { tutor_id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [tutor, setTutor] = useState(null);
  const [form, setForm] = useState({
    subject_id: searchParams.get("subject_id") || "",
    booking_date: "",
    start_time: "",
    end_time: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getProfileById(tutor_id).then((data) => {
      if (!data.message) setTutor(data);
      else setError("Tutor not found");
      setPageLoading(false);
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
    const cost = tutor?.hourly_rate ? Math.round((mins / 60) * tutor.hourly_rate) : null;
    return { label, cost };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject_id) return setError("Please select a subject");
    if (!form.booking_date) return setError("Please select a date");
    if (!form.start_time || !form.end_time) return setError("Please select start and end time");
    if (form.start_time >= form.end_time) return setError("End time must be after start time");
    setLoading(true);
    setError("");
    const res = await createBooking({
      tutor_id: Number(tutor_id),
      subject_id: Number(form.subject_id),
      booking_date: form.booking_date,
      start_time: form.start_time,
      end_time: form.end_time,
      message: form.message,
    });
    setLoading(false);
    if (res.booking) setSuccess(true);
    else setError(res.message || "Something went wrong. Please try again.");
  };

  const dur = getDuration();
  const today = new Date().toISOString().split("T")[0];

  if (pageLoading) return (
    <div style={S.page}>
      <div style={S.center}>Loading tutor details...</div>
    </div>
  );

  if (error && !tutor) return (
    <div style={S.page}>
      <div style={S.center}>
        <p style={{ color: "#dc2626", marginBottom: 16 }}>{error}</p>
        <button style={S.outlineBtn} onClick={() => navigate("/tutors")}>Back to Search</button>
      </div>
    </div>
  );

  if (success) return (
    <div style={S.page}>
      <div style={S.successCard}>
        <div style={S.successIcon}>✓</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#065f46", margin: "0 0 8px" }}>Booking Request Sent!</h2>
        <p style={{ color: "#374151", margin: "0 0 8px", fontSize: 15 }}>
          Your session with <strong>{tutor.full_name || tutor.username}</strong> has been requested.
        </p>
        <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 28px" }}>
          You'll be notified once the tutor confirms.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/bookings")}
            style={S.primaryBtn}>View My Bookings</button>
          <button onClick={() => navigate("/tutors")}
            style={S.outlineBtn}>Find More Tutors</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.wrapper}>
        <button style={S.backLink} onClick={() => navigate(`/tutor/${tutor_id}`)}>
          &larr; Back to Profile
        </button>

        <div style={S.layout}>
          {/* Left: Tutor info */}
          <div style={S.sidebar}>
            <div style={S.tutorCard}>
              <div style={S.avatar}>
                {(tutor.full_name || tutor.username)?.[0]?.toUpperCase()}
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111", margin: "0 0 4px" }}>
                {tutor.full_name || tutor.username}
              </h2>
              {tutor.is_verified && (
                <span style={S.verifiedBadge}>✓ Verified</span>
              )}
              <div style={S.metaRow}>
                {tutor.city && <span style={S.metaItem}>📍 {tutor.city}</span>}
                {tutor.experience_years && <span style={S.metaItem}>🎓 {tutor.experience_years} yrs exp</span>}
              </div>
              {tutor.bio && (
                <p style={S.bio}>{tutor.bio}</p>
              )}
              <div style={S.tagRow}>
                {tutor.subjects?.map(s => (
                  <span key={s.id} style={S.tag}>{s.name}</span>
                ))}
              </div>
              <div style={S.rateBox}>
                <span style={S.rate}>NPR {tutor.hourly_rate}</span>
                <span style={S.rateLabel}> / hour</span>
              </div>
            </div>

            {/* Cost summary */}
            {dur && (
              <div style={S.summaryCard}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#374151", margin: "0 0 12px" }}>Session Summary</h3>
                <div style={S.summaryRow}>
                  <span style={S.summaryLabel}>Duration</span>
                  <span style={S.summaryValue}>{dur.label}</span>
                </div>
                {dur.cost && <>
                  <div style={S.summaryRow}>
                    <span style={S.summaryLabel}>Rate</span>
                    <span style={S.summaryValue}>NPR {tutor.hourly_rate}/hr</span>
                  </div>
                  <div style={{ ...S.summaryRow, borderTop: "1px solid #e5e7eb", paddingTop: 10, marginTop: 6 }}>
                    <span style={{ ...S.summaryLabel, fontWeight: 700, color: "#111" }}>Estimated Total</span>
                    <span style={{ ...S.summaryValue, fontWeight: 800, color: "#4f46e5", fontSize: 18 }}>NPR {dur.cost}</span>
                  </div>
                </>}
              </div>
            )}
          </div>

          {/* Right: Booking form */}
          <div style={S.formCard}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111", margin: "0 0 24px" }}>Book a Session</h2>

            {error && <div style={S.errorBox}>{error}</div>}

            <form onSubmit={handleSubmit} style={S.form}>
              {/* Subject */}
              <div style={S.field}>
                <label style={S.label}>Subject <span style={S.required}>*</span></label>
                <select style={S.input} value={form.subject_id}
                  onChange={e => setForm({ ...form, subject_id: e.target.value })} required>
                  <option value="">Select a subject</option>
                  {tutor.subjects?.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div style={S.field}>
                <label style={S.label}>Date <span style={S.required}>*</span></label>
                <input style={S.input} type="date" value={form.booking_date} min={today}
                  onChange={e => setForm({ ...form, booking_date: e.target.value })} required />
              </div>

              {/* Time slots */}
              <div style={S.field}>
                <label style={S.label}>Start Time <span style={S.required}>*</span></label>
                <div style={S.slotGrid}>
                  {TIME_SLOTS.map(t => (
                    <button type="button" key={t}
                      onClick={() => setForm({ ...form, start_time: t })}
                      style={{
                        ...S.slot,
                        background: form.start_time === t ? "#4f46e5" : "#f9fafb",
                        color: form.start_time === t ? "#fff" : "#374151",
                        border: form.start_time === t ? "1.5px solid #4f46e5" : "1.5px solid #e5e7eb",
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div style={S.field}>
                <label style={S.label}>End Time <span style={S.required}>*</span></label>
                <div style={S.slotGrid}>
                  {TIME_SLOTS.filter(t => t > (form.start_time || "00:00")).map(t => (
                    <button type="button" key={t}
                      onClick={() => setForm({ ...form, end_time: t })}
                      style={{
                        ...S.slot,
                        background: form.end_time === t ? "#4f46e5" : "#f9fafb",
                        color: form.end_time === t ? "#fff" : "#374151",
                        border: form.end_time === t ? "1.5px solid #4f46e5" : "1.5px solid #e5e7eb",
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
                {!form.start_time && (
                  <p style={{ fontSize: 12, color: "#9ca3af", margin: "6px 0 0" }}>Select a start time first</p>
                )}
              </div>

              {/* Message */}
              <div style={S.field}>
                <label style={S.label}>Message <span style={S.optional}>(optional)</span></label>
                <textarea style={S.textarea} rows={3} value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell the tutor what topics you need help with..." />
              </div>

              <button type="submit" style={{ ...S.primaryBtn, width: "100%", padding: "14px", fontSize: 16 }} disabled={loading}>
                {loading ? "Sending Request..." : "Send Booking Request"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", background: "#f9fafb", fontFamily: "system-ui, sans-serif", padding: "32px 24px" },
  wrapper: { maxWidth: 980, margin: "0 auto" },
  center: { textAlign: "center", padding: 60, color: "#6b7280" },
  backLink: { background: "none", border: "none", color: "#4f46e5", cursor: "pointer", fontWeight: 600, fontSize: 14, padding: "0 0 24px", display: "block" },
  layout: { display: "grid", gridTemplateColumns: "320px 1fr", gap: 24, alignItems: "start" },
  sidebar: { display: "flex", flexDirection: "column", gap: 16 },
  tutorCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 24, textAlign: "center" },
  avatar: { width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, margin: "0 auto 16px" },
  verifiedBadge: { display: "inline-block", padding: "2px 10px", background: "#d1fae5", color: "#065f46", borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 12 },
  metaRow: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", margin: "10px 0" },
  metaItem: { fontSize: 13, color: "#6b7280" },
  bio: { fontSize: 13, color: "#6b7280", lineHeight: 1.6, margin: "8px 0 12px", textAlign: "left" },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 16 },
  tag: { padding: "3px 10px", background: "#ede9fe", color: "#4f46e5", borderRadius: 20, fontSize: 12, fontWeight: 500 },
  rateBox: { background: "#f9fafb", borderRadius: 10, padding: "12px 0", marginTop: 8 },
  rate: { fontSize: 24, fontWeight: 800, color: "#4f46e5" },
  rateLabel: { fontSize: 14, color: "#6b7280" },
  summaryCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 20 },
  summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  summaryLabel: { fontSize: 13, color: "#6b7280" },
  summaryValue: { fontSize: 14, fontWeight: 600, color: "#111" },
  formCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 32 },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  field: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 14, fontWeight: 600, color: "#374151" },
  required: { color: "#dc2626" },
  optional: { fontSize: 12, color: "#9ca3af", fontWeight: 400 },
  input: { padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 15, width: "100%", boxSizing: "border-box", background: "#fff" },
  textarea: { padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, resize: "vertical", width: "100%", boxSizing: "border-box", fontFamily: "system-ui" },
  slotGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 },
  slot: { padding: "8px 4px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "center", transition: "all 0.15s" },
  primaryBtn: { padding: "10px 24px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" },
  outlineBtn: { padding: "10px 24px", background: "#fff", color: "#4f46e5", border: "2px solid #4f46e5", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" },
  errorBox: { color: "#dc2626", background: "#fef2f2", padding: "10px 14px", borderRadius: 8, fontSize: 14, marginBottom: 8 },
  successCard: { maxWidth: 480, margin: "80px auto", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20, padding: "48px 40px", textAlign: "center" },
  successIcon: { width: 64, height: 64, borderRadius: "50%", background: "#d1fae5", color: "#065f46", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, margin: "0 auto 20px" },
};