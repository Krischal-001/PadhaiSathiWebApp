import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyBookings, updateBookingStatus } from "../api/bookings";

const STATUS_STYLE = {
  pending:   { bg: "#fef3c7", color: "#92400e" },
  confirmed: { bg: "#d1fae5", color: "#065f46" },
  cancelled: { bg: "#fee2e2", color: "#991b1b" },
  completed: { bg: "#e0e7ff", color: "#3730a3" },
};

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState(null);

  const fetchBookings = async () => {
    const data = await getMyBookings();
    setBookings(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleStatus = async (id, status) => {
    setUpdating(id);
    await updateBookingStatus(id, status);
    await fetchBookings();
    setUpdating(null);
  };

  const filters = ["all", "pending", "confirmed", "completed", "cancelled"];
  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
  const counts = filters.reduce((acc, f) => {
    acc[f] = f === "all" ? bookings.length : bookings.filter((b) => b.status === f).length;
    return acc;
  }, {});

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>← Dashboard</button>
        <h2 style={styles.title}>My Bookings</h2>
        <span style={styles.count}>{bookings.length} total</span>
      </div>

      <div style={styles.filterRow}>
        {filters.map((f) => (
          <button
            key={f}
            style={{
              ...styles.filterBtn,
              background: filter === f ? "#4f46e5" : "#f3f4f6",
              color: filter === f ? "#fff" : "#374151",
            }}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {counts[f] > 0 && <span style={{ ...styles.countBadge, background: filter === f ? "rgba(255,255,255,0.3)" : "#e5e7eb" }}>{counts[f]}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.emptyBox}><p style={styles.muted}>Loading bookings...</p></div>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyBox}>
          <p style={{ fontSize: 32, margin: "0 0 12px" }}>📅</p>
          <p style={styles.muted}>No {filter === "all" ? "" : filter} bookings found.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {filtered.map((b) => {
            const isTutor = b.tutor_id === user?.id;
            const otherName = isTutor ? b.student_name : b.tutor_name;
            const otherEmail = isTutor ? b.student_email : b.tutor_email;
            const sc = STATUS_STYLE[b.status] || STATUS_STYLE.pending;
            const date = new Date(b.booking_date).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });

            return (
              <div key={b.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardLeft}>
                    <div style={styles.roleTag}>{isTutor ? "Student" : "Tutor"}</div>
                    <div>
                      <p style={styles.personName}>{otherName}</p>
                      <p style={styles.personEmail}>{otherEmail}</p>
                    </div>
                  </div>
                  <span style={{ ...styles.statusBadge, background: sc.bg, color: sc.color }}>
                    {b.status}
                  </span>
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.metaGrid}>
                    <div style={styles.metaItem}>
                      <span style={styles.metaIcon}>📅</span>
                      <span>{date}</span>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaIcon}>🕐</span>
                      <span>{b.start_time} – {b.end_time}</span>
                    </div>
                    {b.subject_name && (
                      <div style={styles.metaItem}>
                        <span style={styles.metaIcon}>📚</span>
                        <span>{b.subject_name}</span>
                      </div>
                    )}
                    {b.hourly_rate && (
                      <div style={styles.metaItem}>
                        <span style={styles.metaIcon}>💰</span>
                        <span>NPR {b.hourly_rate}/hr</span>
                      </div>
                    )}
                  </div>

                  {b.message && (
                    <div style={styles.messageBox}>
                      <p style={styles.messageText}>"{b.message}"</p>
                    </div>
                  )}
                </div>

                <div style={styles.cardActions}>
                  {isTutor && b.status === "pending" && (
                    <>
                      <button style={styles.confirmBtn} disabled={updating === b.id} onClick={() => handleStatus(b.id, "confirmed")}>
                        {updating === b.id ? "..." : "✓ Confirm"}
                      </button>
                      <button style={styles.declineBtn} disabled={updating === b.id} onClick={() => handleStatus(b.id, "cancelled")}>
                        ✕ Decline
                      </button>
                    </>
                  )}
                  {isTutor && b.status === "confirmed" && (
                    <button style={styles.completeBtn} disabled={updating === b.id} onClick={() => handleStatus(b.id, "completed")}>
                      {updating === b.id ? "..." : "✓ Mark Complete"}
                    </button>
                  )}
                  {!isTutor && b.status === "pending" && (
                    <button style={styles.declineBtn} disabled={updating === b.id} onClick={() => handleStatus(b.id, "cancelled")}>
                      {updating === b.id ? "..." : "✕ Cancel Request"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 740, margin: "32px auto", padding: "0 20px", fontFamily: "sans-serif" },
  topBar: { display: "flex", alignItems: "center", gap: 12, marginBottom: 24 },
  backBtn: { background: "none", border: "none", color: "#4f46e5", cursor: "pointer", fontSize: 14, fontWeight: 600, padding: 0 },
  title: { fontSize: 22, fontWeight: 700, margin: 0, color: "#111", flex: 1 },
  count: { fontSize: 13, color: "#6b7280" },
  filterRow: { display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" },
  filterBtn: { padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 },
  countBadge: { padding: "1px 6px", borderRadius: 10, fontSize: 11, fontWeight: 700 },
  list: { display: "flex", flexDirection: "column", gap: 14 },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f3f4f6" },
  cardLeft: { display: "flex", alignItems: "center", gap: 12 },
  roleTag: { fontSize: 11, fontWeight: 600, color: "#4f46e5", background: "#ede9fe", padding: "2px 8px", borderRadius: 10, textTransform: "uppercase" },
  personName: { fontSize: 15, fontWeight: 600, color: "#111", margin: 0 },
  personEmail: { fontSize: 12, color: "#6b7280", margin: 0 },
  statusBadge: { padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: "capitalize" },
  cardBody: { padding: "14px 20px" },
  metaGrid: { display: "flex", flexWrap: "wrap", gap: "8px 24px", marginBottom: 10 },
  metaItem: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151" },
  metaIcon: { fontSize: 14 },
  messageBox: { background: "#f9fafb", borderRadius: 8, padding: "8px 12px", marginTop: 8 },
  messageText: { fontSize: 13, color: "#374151", fontStyle: "italic", margin: 0 },
  cardActions: { padding: "12px 20px", borderTop: "1px solid #f3f4f6", display: "flex", gap: 8 },
  confirmBtn: { padding: "7px 18px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 },
  completeBtn: { padding: "7px 18px", background: "#059669", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 },
  declineBtn: { padding: "7px 18px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 },
  emptyBox: { textAlign: "center", padding: "60px 20px" },
  muted: { color: "#6b7280", fontSize: 14 },
};