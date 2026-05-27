import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyBookings, updateBookingStatus } from "../api/bookings";

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState(null);

  const load = async () => {
    try {
      const data = await getMyBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (e) {
      setBookings([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const changeStatus = async (id, status) => {
    setUpdating(id);
    await updateBookingStatus(id, status);
    await load();
    setUpdating(null);
  };

  const statusColor = {
    pending:   { bg: "#fef3c7", color: "#92400e" },
    confirmed: { bg: "#d1fae5", color: "#065f46" },
    cancelled: { bg: "#fee2e2", color: "#991b1b" },
    completed: { bg: "#e0e7ff", color: "#3730a3" },
  };

  const tabs = ["all", "pending", "confirmed", "completed", "cancelled"];
  const shown = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  if (loading) return (
    <div style={{ padding: 40, textAlign: "center", color: "#6b7280", fontFamily: "system-ui" }}>
      Loading bookings...
    </div>
  );

  return (
    <div style={{ maxWidth: 740, margin: "32px auto", padding: "0 20px", fontFamily: "system-ui, sans-serif" }}>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate("/dashboard")}
          style={{ background: "none", border: "none", color: "#4f46e5", cursor: "pointer", fontSize: 14, fontWeight: 600, padding: 0 }}>
          Back to Dashboard
        </button>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#111", flex: 1 }}>My Bookings</h2>
        <span style={{ fontSize: 13, color: "#6b7280" }}>{bookings.length} total</span>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map((t) => {
          const cnt = t === "all" ? bookings.length : bookings.filter((b) => b.status === t).length;
          return (
            <button key={t} onClick={() => setFilter(t)} style={{
              padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6,
              background: filter === t ? "#4f46e5" : "#f3f4f6",
              color: filter === t ? "#fff" : "#374151",
            }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {cnt > 0 && <span style={{ padding: "1px 6px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: filter === t ? "rgba(255,255,255,0.25)" : "#e5e7eb" }}>{cnt}</span>}
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <p style={{ color: "#6b7280", textAlign: "center", padding: 40 }}>No bookings found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {shown.map((b) => {
            const isTutor = b.tutor_id === user?.id;
            const name = isTutor ? b.student_name : b.tutor_name;
            const email = isTutor ? b.student_email : b.tutor_email;
            const sc = statusColor[b.status] || statusColor.pending;
            const dateStr = new Date(b.booking_date).toLocaleDateString("en-US", {
              weekday: "short", year: "numeric", month: "short", day: "numeric",
            });

            return (
              <div key={b.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f3f4f6" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#4f46e5", background: "#ede9fe", padding: "2px 8px", borderRadius: 10, textTransform: "uppercase" }}>
                      {isTutor ? "Student" : "Tutor"}
                    </span>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#111", margin: 0 }}>{name}</p>
                      <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{email}</p>
                    </div>
                  </div>
                  <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: "capitalize", background: sc.bg, color: sc.color }}>
                    {b.status}
                  </span>
                </div>

                <div style={{ padding: "14px 20px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "#374151" }}>Date: {dateStr}</span>
                    <span style={{ fontSize: 13, color: "#374151" }}>Time: {b.start_time} - {b.end_time}</span>
                    {b.subject_name && <span style={{ fontSize: 13, color: "#374151" }}>Subject: {b.subject_name}</span>}
                    {b.hourly_rate && <span style={{ fontSize: 13, color: "#374151" }}>Rate: NPR {b.hourly_rate}/hr</span>}
                  </div>
                  {b.message && (
                    <div style={{ background: "#f9fafb", borderRadius: 8, padding: "8px 12px", marginTop: 4 }}>
                      <p style={{ fontSize: 13, color: "#374151", fontStyle: "italic", margin: 0 }}>"{b.message}"</p>
                    </div>
                  )}
                </div>

                <div style={{ padding: "12px 20px", borderTop: "1px solid #f3f4f6", display: "flex", gap: 8 }}>
                  {isTutor && b.status === "pending" && (
                    <>
                      <button disabled={updating === b.id} onClick={() => changeStatus(b.id, "confirmed")}
                        style={{ padding: "7px 18px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                        {updating === b.id ? "..." : "Confirm"}
                      </button>
                      <button disabled={updating === b.id} onClick={() => changeStatus(b.id, "cancelled")}
                        style={{ padding: "7px 18px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                        Decline
                      </button>
                    </>
                  )}
                  {isTutor && b.status === "confirmed" && (
                    <button disabled={updating === b.id} onClick={() => changeStatus(b.id, "completed")}
                      style={{ padding: "7px 18px", background: "#059669", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                      {updating === b.id ? "..." : "Mark Complete"}
                    </button>
                  )}
                  {!isTutor && b.status === "pending" && (
                    <button disabled={updating === b.id} onClick={() => changeStatus(b.id, "cancelled")}
                      style={{ padding: "7px 18px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                      {updating === b.id ? "..." : "Cancel Request"}
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