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
    <div style={S.page}>
      <div style={S.header}>
        <span style={S.logo}>PadhaiSathi</span>
        <div style={S.headerRight}>
          <span style={S.headerEmail}>{user?.email}</span>
          <button onClick={handleLogout} style={S.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={S.main}>
        <div style={S.welcomeCard}>
          <div style={S.avatar}>{user?.username?.[0]?.toUpperCase()}</div>
          <div>
            <h2 style={S.welcomeText}>Welcome back, {user?.username}!</h2>
            <span style={S.roleBadge}>{user?.role || "student"}</span>
          </div>
        </div>

        {bookings.length > 0 && (
          <>
            <div style={S.sectionTitle}>Booking Summary</div>
            <div style={S.statsRow}>
              <div style={S.statCard}>
                <span style={S.statNum}>{bookings.length}</span>
                <span style={S.statLabel}>Total</span>
              </div>
              <div style={{ ...S.statCard, background: "#fef3c7" }}>
                <span style={S.statNum}>{pendingCount}</span>
                <span style={S.statLabel}>Pending</span>
              </div>
              <div style={{ ...S.statCard, background: "#d1fae5" }}>
                <span style={S.statNum}>{confirmedCount}</span>
                <span style={S.statLabel}>Confirmed</span>
              </div>
            </div>
          </>
        )}

        <div style={S.sectionTitle}>Tutor Profile</div>
        {loading ? (
          <div style={S.card}><p style={S.muted}>Loading...</p></div>
        ) : profile ? (
          <div style={S.card}>
            <div style={S.profileTop}>
              <div>
                <p style={S.profileCity}>{profile.city}</p>
                <p style={S.profileBio}>{profile.bio}</p>
              </div>
              <div style={S.rateBox}>
                <span style={S.rate}>NPR {profile.hourly_rate}</span>
                <span style={S.rateLabel}>/hr</span>
              </div>
            </div>
            <div style={S.tagRow}>
              {profile.subjects?.map((s) => <span key={s.id} style={S.subjectTag}>{s.name}</span>)}
            </div>
            <div style={S.cardActions}>
              <button style={S.primaryBtn} onClick={() => navigate("/profile/me")}>View Profile</button>
              <button style={S.secondaryBtn} onClick={() => navigate("/profile/edit")}>Edit Profile</button>
            </div>
          </div>
        ) : (
          <div style={S.card}>
            <p style={S.muted}>No tutor profile yet.</p>
            <button style={S.primaryBtn} onClick={() => navigate("/profile/create")}>Create Profile</button>
          </div>
        )}

        <div style={S.sectionTitle}>Quick Actions</div>
        <div style={S.quickGrid}>
          {[
            { label: "My Profile", path: "/profile/me" },
            { label: "Edit Profile", path: "/profile/edit" },
            { label: "My Bookings", path: "/bookings" },
            { label: "Create Profile", path: "/profile/create" },
          ].map((q) => (
            <div key={q.label} style={S.quickCard} onClick={() => navigate(q.path)}>
              <span style={S.quickLabel}>{q.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", background: "#f9fafb", fontFamily: "system-ui, sans-serif" },
  header: { background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { fontWeight: 800, fontSize: 20, color: "#4f46e5", letterSpacing: "-0.5px" },
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
  statCard: { background: "#f3f4f6", borderRadius: 10, padding: 16, textAlign: "center" },
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
  cardActions: { display: "flex", gap: 10 },
  primaryBtn: { padding: "8px 20px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 },
  secondaryBtn: { padding: "8px 20px", background: "#f3f4f6", color: "#111", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 },
  muted: { color: "#6b7280", fontSize: 14, marginBottom: 16 },
  quickGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 },
  quickCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 12px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  quickLabel: { fontSize: 13, fontWeight: 600, color: "#374151", textAlign: "center" },
};