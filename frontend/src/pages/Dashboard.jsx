import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyProfile } from "../api/tutorProfile";
import { getMyBookings } from "../api/bookings";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const b = await getMyBookings();
        setBookings(Array.isArray(b) ? b : []);
        if (user?.role === "tutor") {
          const p = await getMyProfile();
          if (!p.message) setProfile(p);
        }
      } catch { }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const pending = bookings.filter(b => b.status === "pending").length;
  const confirmed = bookings.filter(b => b.status === "confirmed").length;
  const completed = bookings.filter(b => b.status === "completed").length;

  const ROLE_CONFIG = {
    student: {
      color: "#1d4ed8", bg: "#dbeafe",
      greeting: "Ready to learn today?",
      actions: [
        { label: "Find a Tutor", path: "/tutors", primary: true },
        { label: "My Bookings", path: "/bookings" },
      ]
    },
    parent: {
      color: "#9d174d", bg: "#fce7f3",
      greeting: "Monitor your child's progress",
      actions: [
        { label: "View Bookings", path: "/bookings", primary: true },
        { label: "Find Tutors", path: "/tutors" },
      ]
    },
    tutor: {
      color: "#065f46", bg: "#d1fae5",
      greeting: "Ready to teach today?",
      actions: [
        { label: "My Profile", path: "/profile/me", primary: true },
        { label: "My Bookings", path: "/bookings" },
        { label: "Edit Profile", path: "/profile/edit" },
      ]
    },
    institute: {
      color: "#92400e", bg: "#fef3c7",
      greeting: "Manage your institution",
      actions: [
        { label: "My Bookings", path: "/bookings", primary: true },
        { label: "Manage Tutors", path: "/tutors" },
      ]
    },
    admin: {
      color: "#991b1b", bg: "#fee2e2",
      greeting: "Admin Control Panel",
      actions: [
        { label: "Admin Panel", path: "/admin", primary: true },
        { label: "All Bookings", path: "/bookings" },
      ]
    },
  };

  const rc = ROLE_CONFIG[user?.role] || ROLE_CONFIG.student;

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>

        {/* Welcome */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "28px 32px", marginBottom: 24, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: `linear-gradient(135deg, ${rc.color}, #7c3aed)`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, flexShrink: 0 }}>
            {(user?.full_name || user?.username)?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111", margin: "0 0 4px" }}>
              Welcome, {user?.full_name || user?.username}!
            </h1>
            <p style={{ color: "#6b7280", margin: "0 0 16px", fontSize: 15 }}>{rc.greeting}</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {rc.actions.map(a => (
                <button key={a.path} onClick={() => navigate(a.path)} style={{
                  padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontWeight: 600, fontSize: 14,
                  background: a.primary ? rc.color : "#f3f4f6",
                  color: a.primary ? "#fff" : "#374151",
                }}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
          <span style={{ padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: "capitalize", background: rc.bg, color: rc.color }}>
            {user?.role}
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Bookings", value: bookings.length, color: "#4f46e5", bg: "#ede9fe" },
            { label: "Pending", value: pending, color: "#92400e", bg: "#fef3c7" },
            { label: "Confirmed", value: confirmed, color: "#065f46", bg: "#d1fae5" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{loading ? "-" : s.value}</div>
              <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 500, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tutor profile card */}
        {user?.role === "tutor" && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
              Your Tutor Profile
            </div>
            {loading ? (
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
                <p style={{ color: "#6b7280", margin: 0 }}>Loading...</p>
              </div>
            ) : profile ? (
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 4px" }}>{profile.city}</p>
                    <p style={{ color: "#374151", fontSize: 14, margin: 0, lineHeight: 1.5, maxWidth: 500 }}>{profile.bio}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: "#4f46e5" }}>NPR {profile.hourly_rate}</span>
                    <span style={{ fontSize: 13, color: "#6b7280" }}>/hr</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                  {profile.subjects?.map(s => (
                    <span key={s.id} style={{ padding: "3px 10px", background: "#ede9fe", color: "#4f46e5", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{s.name}</span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => navigate("/profile/me")} style={{ padding: "7px 18px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>View Profile</button>
                  <button onClick={() => navigate("/profile/edit")} style={{ padding: "7px 18px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Edit Profile</button>
                </div>
              </div>
            ) : (
              <div style={{ background: "#fff", border: "2px dashed #e5e7eb", borderRadius: 12, padding: "32px 24px", textAlign: "center" }}>
                <p style={{ color: "#6b7280", margin: "0 0 16px" }}>You haven't created a tutor profile yet.</p>
                <button onClick={() => navigate("/profile/create")} style={{ padding: "10px 24px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
                  Create Profile
                </button>
              </div>
            )}
          </div>
        )}

        {/* Recent bookings */}
        {bookings.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Recent Bookings</div>
              <button onClick={() => navigate("/bookings")} style={{ background: "none", border: "none", color: "#4f46e5", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>View all</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {bookings.slice(0, 3).map(b => {
                const STATUS = { pending: { bg: "#fef3c7", color: "#92400e" }, confirmed: { bg: "#d1fae5", color: "#065f46" }, cancelled: { bg: "#fee2e2", color: "#991b1b" }, completed: { bg: "#e0e7ff", color: "#3730a3" } };
                const sc = STATUS[b.status] || STATUS.pending;
                const isTutor = b.tutor_id === user?.id;
                return (
                  <div key={b.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#111", margin: "0 0 2px" }}>
                        {isTutor ? b.student_name : b.tutor_name}
                      </p>
                      <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
                        {new Date(b.booking_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {b.start_time} - {b.end_time}
                      </p>
                    </div>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: "capitalize", background: sc.bg, color: sc.color }}>
                      {b.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state for no bookings */}
        {!loading && bookings.length === 0 && user?.role !== "tutor" && (
          <div style={{ background: "#fff", border: "2px dashed #e5e7eb", borderRadius: 12, padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>&#128197;</div>
            <p style={{ color: "#6b7280", margin: "0 0 20px", fontSize: 15 }}>No bookings yet. Find a tutor to get started!</p>
            <button onClick={() => navigate("/tutors")} style={{ padding: "10px 28px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
              Find a Tutor
            </button>
          </div>
        )}

      </div>
    </div>
  );
}