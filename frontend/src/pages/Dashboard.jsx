import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyProfile } from "../api/tutorProfile";
import { getMyBookings } from "../api/bookings";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyProfile(), getMyBookings()]).then(([p, b]) => {
      if (!p.message) setProfile(p);
      setBookings(Array.isArray(b) ? b : []);
      setLoading(false);
    });
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <span style={styles.logo}>📚 PadhaiSathi</span>
        <div style={styles.headerRight}>
          <span style={styles.headerEmail}>{user?.email}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.welcomeCard}>
          <div style={styles.avatar}>{user?.username?.[0]?.toUpperCase()}</div>
          <div>
            <h2 style={styles.welcomeText}>Welcome back, {user?.username}!</h2>
            <span style={styles.roleBadge}>{user?.role || "student"}</span>
          </div>
        </div>

        {bookings.length > 0 && (
          <>
            <div style={styles.sectionTitle}>Booking summary</div>
            <div style={styles.statsRow}>
              <div style={styles.statCard}>
                <span style={styles.statNum}>{bookings.length}</span>
                <span style={styles.statLabel}>Total</span>
              </div>
              <div style={{ ...styles.statCard, background: "#fef3c7" }}>
                <span style={styles.statNum}>{pendingCount}</span>
                <span style={styles.statLabel}>Pending</span>
              </div>
              <div style={{ ...styles.statCard, background: "#d1fae5" }}>
                <span style={styles.statNum}>{confirmedCount}</span>
                <span style={styles.statLabel}>Confirmed</span>
              </div>
            </div>
          </>
        )}

        <div style={styles.sectionTitle}>Tutor profile</div>
        {loading ? (
          <div style={styles.card}><p style={styles.muted}>Loading...</p></div>
        ) : profile ? (
          <div style={styles.card}>
            <div style={styles.profileTop}>
              <div>
                <p style={styles.profileCity}>📍 {profile.city}</p>
                <p style={styles.profileBio}>{profile.bio}</p>
              </div>
              <div style={styles.rateBox}>
                <span style={styles.rate}>NPR {profile.hourly_rate}</span>
                <span style={styles.rateLabel}>/hr</span>
              </div>
            </div>
            <div style={styles.tagRow}>
              {profile.subjects?.map((s) => (
                <span key={s.id} style={styles.subjectTag}>{s.name}</span>
              ))}
            </div>
            <div style={styles.cardActions}>
              <button style={styles.primaryBtn} onClick={() => navigate("/profile/me")}>View Profile</button>
              <button style={styles.secondaryBtn} onClick={() => navigate("/profile/edit")}>Edit Profile</button>
              <button style={styles.secondaryBtn} onClick={() => navigate(`/book/${profile.user_id}`)}>Book Me</button>
            </div>
          </div>
        ) : (
          <div style={styles.card}>
            <p style={styles.muted}>You haven't created a tutor profile yet.</p>
            <button style={styles.primaryBtn} onClick={() => navigate("/profile/create")}>+ Create Profile</button>
          </div>
        )}

        <div style={styles.sectionTitle}>Quick actions</div>
        <div style={styles.quickGrid}>
          {[
            { icon: "👤", label: "My Profile", path: "/profile/me" },
            { icon: "✏️", label: "Edit Profile", path: "/profile/edit" },
            { icon: "📅", label: "My Bookings", path: "/bookings" },
            { icon: "➕", label: "Create Profile", path: "/profile/create" },
          ].map((q) => (
            <div key={q.label} style={styles.quickCard} onClick={() => navigate(q.path)}>
              <span style={styles.quickIcon}>{q.icon}</span>
              <span style={styles.quickLabel}>{q.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f9fafb", fontFamily: "sans-serif" },
  header: { background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { fontWeight: 700, fontSize: 20, color: "#4f46e5" },
  headerRight: { display: "flex", alignItems: "center", gap: 16 },
  headerEmail: { fontSize: 13, color: "#6b7280" },
  logoutBtn: { padding: "6px 16px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 },
  main: { maxWidth: 720, margin: "32px auto", padding: "0 20px" },
  welcomeCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, marginBottom: 28 },
  avatar: { width: 52, height: 52, borderRadius: "50%", background: "#4f46e5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, flexShrink: 0 },
  welcomeText: { margin: 0, fontSize: 20, fontWeight: 600, color: "#111" },
  roleBadge: { marginTop: 6, display: "inline-block", padding: "2px 10px", background: "#ede9fe", color: "#4f46e5", borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: "capitalize" },
  sectionTitle: { fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 },
  statCard: { background: "#f3f4f6", borderRadius: 10, padding: "16px", textAlign: "center" },
  statNum: { display: "block", fontSize: 28, fontWeight: 700, color: "#111" },
  statLabel: { fontSize: 12, color: "#6b7280", fontWeight: 500 },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px", marginBottom: 28 },
  profileTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  profileCity: { color: "#6b7280", fontSize: 13, margin: "0 0 4px" },
  profileBio: { color: "#374151", fontSize: 14, margin: 0, lineHeight: 1.5 },
  rateBox: { textAlign: "right", flexShrink: 0 },
  rate: { fontSize: 20, fontWeight: 700, color: "#4f46e5" },
  rateLabel: { fontSize: 13, color: "#6b7280" },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 },
  subjectTag: { padding: "3px 10px", background: "#ede9fe", color: "#4f46e5", borderRadius: 20, fontSize: 12, fontWeight: 500 },
  cardActions: { display: "flex", gap: 10, flexWrap: "wrap" },
  primaryBtn: { padding: "8px 20px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 },
  secondaryBtn: { padding: "8px 20px", background: "#f3f4f6", color: "#111", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 },
  muted: { color: "#6b7280", fontSize: 14, marginBottom: 16 },
  quickGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 },
  quickCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "18px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" },
  quickIcon: { fontSize: 24 },
  quickLabel: { fontSize: 12, fontWeight: 600, color: "#374151", textAlign: "center" },
};