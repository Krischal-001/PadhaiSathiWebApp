import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTutorById } from "../api/tutors";
import { getTutorReviews, createReview } from "../api/reviews";
import { useAuth } from "../context/AuthContext";

const Stars = ({ rating, interactive, onRate }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map(n => (
      <span
        key={n}
        onClick={() => interactive && onRate && onRate(n)}
        style={{
          fontSize: interactive ? 28 : 15,
          color: n <= rating ? "#f59e0b" : "#d1d5db",
          cursor: interactive ? "pointer" : "default",
          lineHeight: 1,
        }}
      >
        &#9733;
      </span>
    ))}
  </div>
);

export default function TutorPublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tutor, setTutor] = useState(null);
  const [reviewData, setReviewData] = useState({ reviews: [], avg_rating: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ booking_id: "", rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [t, r] = await Promise.all([
          getTutorById(id),
          getTutorReviews(id),
        ]);
        if (t && !t.message) setTutor(t);
        if (r && r.reviews) setReviewData(r);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      const res = await createReview({
        booking_id: Number(form.booking_id),
        rating: form.rating,
        comment: form.comment,
      });
      if (res.review) {
        const r = await getTutorReviews(id);
        if (r.reviews) setReviewData(r);
        setShowForm(false);
        setForm({ booking_id: "", rating: 5, comment: "" });
      } else {
        setFormError(res.message || "Failed to submit review");
      }
    } catch (err) {
      setFormError("Something went wrong");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: "#6b7280", fontFamily: "system-ui" }}>
        Loading tutor profile...
      </div>
    );
  }

  if (!tutor) {
    return (
      <div style={{ padding: 60, textAlign: "center", fontFamily: "system-ui" }}>
        <p style={{ color: "#6b7280" }}>Tutor not found.</p>
        <button onClick={() => navigate("/tutors")}
          style={{ marginTop: 16, padding: "9px 20px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>

        <button onClick={() => navigate("/tutors")}
          style={{ background: "none", border: "none", color: "#4f46e5", cursor: "pointer", fontWeight: 600, fontSize: 14, marginBottom: 20, padding: 0 }}>
          &larr; Back to Search
        </button>

        {/* Profile Header */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 32, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>

            <div style={{ width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 800, flexShrink: 0 }}>
              {(tutor.full_name || tutor.username)?.[0]?.toUpperCase()}
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111", margin: 0 }}>
                  {tutor.full_name || tutor.username}
                </h1>
                {tutor.is_verified && (
                  <span style={{ padding: "2px 10px", background: "#d1fae5", color: "#065f46", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                    Verified
                  </span>
                )}
              </div>

              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12, fontSize: 14, color: "#6b7280" }}>
                {tutor.city && <span>{tutor.city}</span>}
                {tutor.experience_years && <span>{tutor.experience_years} yrs experience</span>}
                {reviewData.total > 0 && (
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Stars rating={Math.round(Number(reviewData.avg_rating))} />
                    <span style={{ fontWeight: 600, color: "#111" }}>{reviewData.avg_rating}</span>
                    <span>({reviewData.total} reviews)</span>
                  </span>
                )}
              </div>

              {tutor.bio && (
                <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.7, margin: "0 0 16px" }}>
                  {tutor.bio}
                </p>
              )}

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {tutor.subjects?.map(s => (
                  <span key={s.id} style={{ padding: "4px 12px", background: "#ede9fe", color: "#4f46e5", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ textAlign: "center", background: "#f9fafb", borderRadius: 12, padding: "20px 28px", border: "1px solid #e5e7eb", flexShrink: 0 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#4f46e5" }}>NPR {tutor.hourly_rate}</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>per hour</div>
              <button onClick={() => navigate(`/book/${tutor.user_id}`)}
                style={{ width: "100%", padding: "11px 24px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                Book Session
              </button>
            </div>

          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "28px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111", margin: "0 0 6px" }}>Reviews</h2>
              {reviewData.total > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Stars rating={Math.round(Number(reviewData.avg_rating))} />
                  <span style={{ fontWeight: 700, color: "#111" }}>{reviewData.avg_rating}</span>
                  <span style={{ color: "#6b7280", fontSize: 13 }}>from {reviewData.total} reviews</span>
                </div>
              )}
            </div>
            {user?.role === "student" && (
              <button
                onClick={() => setShowForm(!showForm)}
                style={{ padding: "8px 20px", background: showForm ? "#f3f4f6" : "#4f46e5", color: showForm ? "#374151" : "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                {showForm ? "Cancel" : "Write Review"}
              </button>
            )}
          </div>

          {/* Review Form */}
          {showForm && (
            <form onSubmit={handleReview} style={{ background: "#f9fafb", borderRadius: 12, padding: 20, marginBottom: 24, border: "1px solid #e5e7eb" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px", color: "#111" }}>Write a Review</h3>
              {formError && (
                <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 12, background: "#fef2f2", padding: "8px 12px", borderRadius: 6 }}>{formError}</p>
              )}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                  Booking ID (completed sessions only)
                </label>
                <input
                  type="number"
                  value={form.booking_id}
                  onChange={e => setForm({ ...form, booking_id: e.target.value })}
                  placeholder="Enter your completed booking ID"
                  required
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Rating</label>
                <Stars rating={form.rating} interactive onRate={n => setForm({ ...form, rating: n })} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Comment</label>
                <textarea
                  value={form.comment}
                  onChange={e => setForm({ ...form, comment: e.target.value })}
                  rows={3}
                  placeholder="Share your experience with this tutor..."
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, resize: "vertical", boxSizing: "border-box" }}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                style={{ padding: "10px 24px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}

          {/* Review List */}
          {reviewData.reviews.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ color: "#6b7280", fontSize: 15 }}>No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {reviewData.reviews.map((r, idx) => (
                <div key={r.id} style={{ padding: "18px 0", borderBottom: idx < reviewData.reviews.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                        {(r.full_name || r.username)?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14, color: "#111", margin: "0 0 3px" }}>
                          {r.full_name || r.username}
                        </p>
                        <Stars rating={r.rating} />
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>
                      {new Date(r.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </div>
                  {r.comment && (
                    <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, margin: "0 0 0 48px" }}>
                      {r.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}