import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyProfile } from "../api/tutorProfile";
import { getMyBookings } from "../api/bookings";

const STATUS_STYLE = {
  pending:   { bg: "#fef3c7", color: "#92400e" },
  confirmed: { bg: "#d1fae5", color: "#065f46" },
  cancelled: { bg: "#fee2e2", color: "#991b1b" },
  completed: { bg: "#e0e7ff", color: "#3730a3" },
};

const BookingRow = ({ b, showOther, userId }) => {
  const sc = STATUS_STYLE[b.status] || STATUS_STYLE.pending;
  const isTutor = b.tutor_id === userId;
  const other = isTutor ? b.student_name : b.tutor_name;
  return (
    <div style={S.bookingRow}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={S.bookingAvatar}>{other?.[0]?.toUpperCase()}</div>
        <div>
          <p style={S.bookingName}>{showOther ? other : b.subject_name || "Session"}</p>
          <p style={S.bookingMeta}>
            {new Date(b.booking_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            {" · "}{b.start_time} – {b.end_time}
          </p>
          {showOther && <p style={{ ...S.bookingMeta, marginTop: 1 }}>{other}</p>}
        </div>
      </div>
      <span style={{ ...S.badge, background: sc.bg, color: sc.color }}>{b.status}</span>
    </div>
  );
};

// ─── STUDENT DASHBOARD ───────────────────────────────────────────────────────
function StudentDashboard({ user, bookings, loading, navigate }) {
  const upcoming = bookings.filter(b => b.status === "confirmed" || b.status === "pending");
  const completed = bookings.filter(b => b.status === "completed");
  return (
    <div style={S.page}>
      <div style={S.container}>
        {/* Header */}
        <div style={S.welcomeCard}>
          <div style={{ ...S.avatar, background: "linear-gradient(135deg, #1d4ed8, #4f46e5)" }}>
            {(user?.full_name || user?.username)?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={S.welcomeTitle}>Welcome back, {user?.full_name || user?.username}!</h1>
            <p style={S.welcomeSub}>Ready to learn something new today?</p>
          </div>
          <span style={{ ...S.roleBadge, background: "#dbeafe", color: "#1d4ed8" }}>Student</span>
        </div>

        {/* Stats */}
        <div style={S.statsGrid}>
          {[
            { label: "Total Sessions", value: bookings.length, color: "#4f46e5", bg: "#ede9fe" },
            { label: "Upcoming", value: upcoming.length, color: "#92400e", bg: "#fef3c7" },
            { label: "Completed", value: completed.length, color: "#065f46", bg: "#d1fae5" },
          ].map(s => (
            <div key={s.label} style={S.statCard}>
              <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{loading ? "–" : s.value}</div>
              <div style={S.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Quick Actions</div>
          <div style={S.actionGrid}>
            {[
              { label: "🔍 Find a Tutor", desc: "Browse verified tutors", path: "/tutors", primary: true },
              { label: "📅 My Bookings", desc: "View all your sessions", path: "/bookings" },
            ].map(a => (
              <div key={a.path} onClick={() => navigate(a.path)}
                style={{ ...S.actionCard, borderColor: a.primary ? "#4f46e5" : "#e5e7eb", background: a.primary ? "#4f46e5" : "#fff" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: a.primary ? "#fff" : "#111", marginBottom: 4 }}>{a.label}</div>
                <div style={{ fontSize: 13, color: a.primary ? "rgba(255,255,255,0.8)" : "#6b7280" }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming sessions */}
        <div style={S.section}>
          <div style={S.sectionHeader}>
            <div style={S.sectionTitle}>Upcoming Sessions</div>
            <button style={S.viewAll} onClick={() => navigate("/bookings")}>View all</button>
          </div>
          {loading ? <div style={S.muted}>Loading...</div>
            : upcoming.length === 0 ? (
              <div style={S.emptyState}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📚</div>
                <p style={{ color: "#6b7280", margin: "0 0 16px" }}>No upcoming sessions. Book a tutor to get started!</p>
                <button onClick={() => navigate("/tutors")} style={S.primaryBtn}>Find a Tutor</button>
              </div>
            ) : upcoming.slice(0, 4).map(b => (
              <BookingRow key={b.id} b={b} showOther userId={user?.id} />
            ))}
        </div>
      </div>
    </div>
  );
}

// ─── TUTOR DASHBOARD ─────────────────────────────────────────────────────────
function TutorDashboard({ user, bookings, profile, loading, navigate }) {
  const pending = bookings.filter(b => b.status === "pending");
  const confirmed = bookings.filter(b => b.status === "confirmed");
  const completed = bookings.filter(b => b.status === "completed");
  const earnings = completed.reduce((sum, b) => {
    if (!b.start_time || !b.end_time) return sum;
    const [sh, sm] = b.start_time.split(":").map(Number);
    const [eh, em] = b.end_time.split(":").map(Number);
    const hrs = ((eh * 60 + em) - (sh * 60 + sm)) / 60;
    return sum + hrs * (profile?.hourly_rate || 0);
  }, 0);

  return (
    <div style={S.page}>
      <div style={S.container}>
        {/* Header */}
        <div style={S.welcomeCard}>
          <div style={{ ...S.avatar, background: "linear-gradient(135deg, #065f46, #059669)" }}>
            {(user?.full_name || user?.username)?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={S.welcomeTitle}>Welcome back, {user?.full_name || user?.username}!</h1>
            <p style={S.welcomeSub}>You have {pending.length} pending booking request{pending.length !== 1 ? "s" : ""}</p>
          </div>
          <span style={{ ...S.roleBadge, background: "#d1fae5", color: "#065f46" }}>Tutor</span>
        </div>

        {/* Stats */}
        <div style={{ ...S.statsGrid, gridTemplateColumns: "repeat(4, 1fr)" }}>
          {[
            { label: "Pending Requests", value: pending.length, color: "#92400e", bg: "#fef3c7" },
            { label: "Confirmed", value: confirmed.length, color: "#065f46", bg: "#d1fae5" },
            { label: "Completed", value: completed.length, color: "#3730a3", bg: "#e0e7ff" },
            { label: "Est. Earnings", value: `NPR ${Math.round(earnings)}`, color: "#4f46e5", bg: "#ede9fe" },
          ].map(s => (
            <div key={s.label} style={S.statCard}>
              <div style={{ fontSize: s.label === "Est. Earnings" ? 20 : 32, fontWeight: 800, color: s.color }}>{loading ? "–" : s.value}</div>
              <div style={S.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Profile status */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Your Profile</div>
          {loading ? <div style={S.muted}>Loading...</div>
            : profile ? (
              <div style={S.profileCard}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                    {profile.subjects?.map(s => (
                      <span key={s.id} style={S.tag}>{s.name}</span>
                    ))}
                  </div>
                  <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 4px" }}>{profile.city} · {profile.experience_years} yrs exp</p>
                  <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.5 }}>{profile.bio?.slice(0, 120)}{profile.bio?.length > 120 ? "..." : ""}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#4f46e5" }}>NPR {profile.hourly_rate}<span style={{ fontSize: 13, color: "#6b7280", fontWeight: 400 }}>/hr</span></div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
                    <button onClick={() => navigate("/profile/me")} style={S.primaryBtn}>View</button>
                    <button onClick={() => navigate("/profile/edit")} style={S.secondaryBtn}>Edit</button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={S.emptyState}>
                <p style={{ color: "#6b7280", margin: "0 0 16px" }}>You haven't created a tutor profile yet. Students can't find you without one!</p>
                <button onClick={() => navigate("/profile/create")} style={S.primaryBtn}>Create Profile</button>
              </div>
            )}
        </div>

        {/* Pending requests */}
        {pending.length > 0 && (
          <div style={S.section}>
            <div style={S.sectionHeader}>
              <div style={S.sectionTitle}>Pending Requests</div>
              <button style={S.viewAll} onClick={() => navigate("/bookings")}>Manage all</button>
            </div>
            {pending.slice(0, 4).map(b => (
              <BookingRow key={b.id} b={b} showOther userId={user?.id} />
            ))}
          </div>
        )}

        {/* Upcoming confirmed */}
        <div style={S.section}>
          <div style={S.sectionHeader}>
            <div style={S.sectionTitle}>Upcoming Sessions</div>
            <button style={S.viewAll} onClick={() => navigate("/bookings")}>View all</button>
          </div>
          {confirmed.length === 0
            ? <div style={S.muted}>No confirmed sessions yet.</div>
            : confirmed.slice(0, 3).map(b => (
              <BookingRow key={b.id} b={b} showOther userId={user?.id} />
            ))}
        </div>
      </div>
    </div>
  );
}

// ─── PARENT DASHBOARD ────────────────────────────────────────────────────────
function ParentDashboard({ user, bookings, loading, navigate }) {
  const upcoming = bookings.filter(b => b.status === "confirmed" || b.status === "pending");
  const completed = bookings.filter(b => b.status === "completed");
  return (
    <div style={S.page}>
      <div style={S.container}>
        <div style={S.welcomeCard}>
          <div style={{ ...S.avatar, background: "linear-gradient(135deg, #9d174d, #db2777)" }}>
            {(user?.full_name || user?.username)?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={S.welcomeTitle}>Welcome, {user?.full_name || user?.username}!</h1>
            <p style={S.welcomeSub}>Monitor your child's learning progress</p>
          </div>
          <span style={{ ...S.roleBadge, background: "#fce7f3", color: "#9d174d" }}>Parent</span>
        </div>

        <div style={S.statsGrid}>
          {[
            { label: "Total Sessions", value: bookings.length, color: "#4f46e5", bg: "#ede9fe" },
            { label: "Upcoming", value: upcoming.length, color: "#92400e", bg: "#fef3c7" },
            { label: "Completed", value: completed.length, color: "#065f46", bg: "#d1fae5" },
          ].map(s => (
            <div key={s.label} style={S.statCard}>
              <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{loading ? "–" : s.value}</div>
              <div style={S.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={S.section}>
          <div style={S.sectionTitle}>Quick Actions</div>
          <div style={S.actionGrid}>
            {[
              { label: "📅 All Bookings", desc: "Review and manage sessions", path: "/bookings", primary: true },
              { label: "🔍 Find Tutors", desc: "Book a new tutor", path: "/tutors" },
            ].map(a => (
              <div key={a.path} onClick={() => navigate(a.path)}
                style={{ ...S.actionCard, borderColor: a.primary ? "#9d174d" : "#e5e7eb", background: a.primary ? "#9d174d" : "#fff" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: a.primary ? "#fff" : "#111", marginBottom: 4 }}>{a.label}</div>
                <div style={{ fontSize: 13, color: a.primary ? "rgba(255,255,255,0.8)" : "#6b7280" }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={S.section}>
          <div style={S.sectionHeader}>
            <div style={S.sectionTitle}>Recent Sessions</div>
            <button style={S.viewAll} onClick={() => navigate("/bookings")}>View all</button>
          </div>
          {loading ? <div style={S.muted}>Loading...</div>
            : bookings.length === 0 ? (
              <div style={S.emptyState}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>👨‍👩‍👧</div>
                <p style={{ color: "#6b7280", margin: "0 0 16px" }}>No sessions booked yet.</p>
                <button onClick={() => navigate("/tutors")} style={S.primaryBtn}>Find a Tutor</button>
              </div>
            ) : bookings.slice(0, 5).map(b => (
              <BookingRow key={b.id} b={b} showOther userId={user?.id} />
            ))}
        </div>
      </div>
    </div>
  );
}

// ─── GENERIC DASHBOARD (institute / admin) ───────────────────────────────────
function GenericDashboard({ user, bookings, loading, navigate }) {
  const ROLE_CONFIG = {
    institute: { color: "#92400e", bg: "#fef3c7", gradient: "linear-gradient(135deg, #92400e, #d97706)", greeting: "Manage your institution" },
    admin:     { color: "#991b1b", bg: "#fee2e2", gradient: "linear-gradient(135deg, #991b1b, #dc2626)", greeting: "Admin Control Panel" },
  };
  const rc = ROLE_CONFIG[user?.role] || ROLE_CONFIG.institute;
  const pending   = bookings.filter(b => b.status === "pending").length;
  const confirmed = bookings.filter(b => b.status === "confirmed").length;

  return (
    <div style={S.page}>
      <div style={S.container}>
        <div style={S.welcomeCard}>
          <div style={{ ...S.avatar, background: rc.gradient }}>
            {(user?.full_name || user?.username)?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={S.welcomeTitle}>Welcome, {user?.full_name || user?.username}!</h1>
            <p style={S.welcomeSub}>{rc.greeting}</p>
          </div>
          <span style={{ ...S.roleBadge, background: rc.bg, color: rc.color, textTransform: "capitalize" }}>{user?.role}</span>
        </div>

        <div style={S.statsGrid}>
          {[
            { label: "Total Bookings", value: bookings.length, color: "#4f46e5", bg: "#ede9fe" },
            { label: "Pending", value: pending, color: "#92400e", bg: "#fef3c7" },
            { label: "Confirmed", value: confirmed, color: "#065f46", bg: "#d1fae5" },
          ].map(s => (
            <div key={s.label} style={S.statCard}>
              <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{loading ? "–" : s.value}</div>
              <div style={S.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {user?.role === "admin" && (
          <div style={{ ...S.section, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <p style={{ margin: "0 0 12px", color: "#374151", fontSize: 15 }}>You have full platform access.</p>
            <button onClick={() => navigate("/admin")} style={S.primaryBtn}>Go to Admin Panel</button>
          </div>
        )}

        <div style={S.section}>
          <div style={S.sectionHeader}>
            <div style={S.sectionTitle}>Recent Bookings</div>
            <button style={S.viewAll} onClick={() => navigate("/bookings")}>View all</button>
          </div>
          {loading ? <div style={S.muted}>Loading...</div>
            : bookings.length === 0 ? (
              <div style={S.emptyState}>
                <p style={{ color: "#6b7280", margin: "0 0 16px" }}>No bookings yet.</p>
                <button onClick={() => navigate("/tutors")} style={S.primaryBtn}>Find Tutors</button>
              </div>
            ) : bookings.slice(0, 5).map(b => (
              <BookingRow key={b.id} b={b} showOther userId={user?.id} />
            ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
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
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const props = { user, bookings, profile, loading, navigate };

  if (user?.role === "student")  return <StudentDashboard {...props} />;
  if (user?.role === "tutor")    return <TutorDashboard {...props} />;
  if (user?.role === "parent")   return <ParentDashboard {...props} />;
  return <GenericDashboard {...props} />;
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = {
  page: { minHeight: "100vh", background: "#f9fafb", fontFamily: "system-ui, sans-serif" },
  container: { maxWidth: 900, margin: "0 auto", padding: "40px 24px" },
  welcomeCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "24px 28px", marginBottom: 20, display: "flex", alignItems: "center", gap: 18 },
  avatar: { width: 60, height: 60, borderRadius: "50%", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, flexShrink: 0 },
  welcomeTitle: { fontSize: 22, fontWeight: 800, color: "#111", margin: "0 0 4px" },
  welcomeSub: { color: "#6b7280", margin: 0, fontSize: 14 },
  roleBadge: { padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: "capitalize", flexShrink: 0 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 },
  statCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px" },
  statLabel: { fontSize: 13, color: "#6b7280", fontWeight: 500, marginTop: 4 },
  section: { marginBottom: 20 },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" },
  viewAll: { background: "none", border: "none", color: "#4f46e5", cursor: "pointer", fontWeight: 600, fontSize: 13 },
  actionGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 },
  actionCard: { padding: "18px 20px", borderRadius: 12, border: "2px solid", cursor: "pointer" },
  bookingRow: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  bookingAvatar: { width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 },
  bookingName: { fontSize: 14, fontWeight: 600, color: "#111", margin: "0 0 2px" },
  bookingMeta: { fontSize: 12, color: "#6b7280", margin: 0 },
  badge: { padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: "capitalize", flexShrink: 0 },
  profileCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px", display: "flex", gap: 20, alignItems: "flex-start" },
  tag: { padding: "3px 10px", background: "#ede9fe", color: "#4f46e5", borderRadius: 20, fontSize: 12, fontWeight: 500 },
  emptyState: { background: "#fff", border: "2px dashed #e5e7eb", borderRadius: 12, padding: "40px 24px", textAlign: "center" },
  muted: { color: "#6b7280", fontSize: 14, padding: "16px 0" },
  primaryBtn: { padding: "9px 20px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 },
  secondaryBtn: { padding: "9px 20px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 },
};