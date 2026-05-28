import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAdminStats, getAllUsers, getAllBookings, verifyUser, deleteUser } from "../api/admin";

const TABS = ["Overview", "Users", "Bookings"];

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("Overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user?.role !== "admin") { navigate("/dashboard"); return; }
    loadAll();
  }, []); // eslint-disable-line

  const loadAll = async () => {
    setLoading(true);
    const [s, u, b] = await Promise.all([getAdminStats(), getAllUsers(), getAllBookings()]);
    setStats(s);
    setUsers(Array.isArray(u) ? u : []);
    setBookings(Array.isArray(b) ? b : []);
    setLoading(false);
  };

  const handleVerify = async (id) => { await verifyUser(id); loadAll(); };
  const handleDelete = async (id) => { if (window.confirm("Delete this user?")) { await deleteUser(id); loadAll(); } };

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const STATUS_COLOR = { pending: { bg: "#fef3c7", color: "#92400e" }, confirmed: { bg: "#d1fae5", color: "#065f46" }, cancelled: { bg: "#fee2e2", color: "#991b1b" }, completed: { bg: "#e0e7ff", color: "#3730a3" } };
  const ROLE_COLOR = { student: "#1d4ed8", parent: "#9d174d", tutor: "#065f46", institute: "#92400e", admin: "#991b1b" };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111", margin: "0 0 4px" }}>Admin Dashboard</h1>
          <p style={{ color: "#6b7280", margin: 0 }}>Manage users, bookings, and platform settings</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #e5e7eb", marginBottom: 28 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "10px 20px", background: "none", border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 600,
              color: tab === t ? "#4f46e5" : "#6b7280",
              borderBottom: tab === t ? "2px solid #4f46e5" : "2px solid transparent",
              marginBottom: -1,
            }}>{t}</button>
          ))}
        </div>

        {loading ? <p style={{ color: "#6b7280" }}>Loading...</p> : (

          <>
            {/* Overview */}
            {tab === "Overview" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
                  {[
                    { label: "Total Users", value: stats?.total_users ?? 0, color: "#4f46e5", bg: "#ede9fe" },
                    { label: "Total Bookings", value: stats?.total_bookings ?? 0, color: "#065f46", bg: "#d1fae5" },
                    { label: "Active Tutors", value: stats?.total_tutors ?? 0, color: "#92400e", bg: "#fef3c7" },
                    { label: "Revenue (NPR)", value: stats?.total_revenue ?? 0, color: "#991b1b", bg: "#fee2e2" },
                  ].map(s => (
                    <div key={s.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px" }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>Recent Bookings</h3>
                  {bookings.slice(0, 5).map(b => {
                    const sc = STATUS_COLOR[b.status] || STATUS_COLOR.pending;
                    return (
                      <div key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{b.student_name}</span>
                          <span style={{ color: "#6b7280", fontSize: 13 }}> → {b.tutor_name}</span>
                        </div>
                        <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: sc.bg, color: sc.color }}>{b.status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Users */}
            {tab === "Users" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, width: 280 }} />
                  <span style={{ fontSize: 13, color: "#6b7280", alignSelf: "center" }}>{filteredUsers.length} users</span>
                </div>
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                        {["User", "Email", "Role", "Verified", "Joined", "Actions"].map(h => (
                          <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: 13 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "12px 16px", fontWeight: 600 }}>{u.username}</td>
                          <td style={{ padding: "12px 16px", color: "#6b7280" }}>{u.email}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#f3f4f6", color: ROLE_COLOR[u.role] || "#374151", textTransform: "capitalize" }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            {u.is_verified ? <span style={{ color: "#065f46", fontWeight: 600 }}>Yes</span> : <span style={{ color: "#92400e" }}>No</span>}
                          </td>
                          <td style={{ padding: "12px 16px", color: "#6b7280" }}>{new Date(u.created_at).toLocaleDateString()}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              {!u.is_verified && (
                                <button onClick={() => handleVerify(u.id)}
                                  style={{ padding: "4px 10px", background: "#d1fae5", color: "#065f46", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                                  Verify
                                </button>
                              )}
                              <button onClick={() => handleDelete(u.id)}
                                style={{ padding: "4px 10px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bookings */}
            {tab === "Bookings" && (
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                      {["Student", "Tutor", "Date", "Time", "Status"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: 13 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => {
                      const sc = STATUS_COLOR[b.status] || STATUS_COLOR.pending;
                      return (
                        <tr key={b.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "12px 16px", fontWeight: 600 }}>{b.student_name}</td>
                          <td style={{ padding: "12px 16px" }}>{b.tutor_name}</td>
                          <td style={{ padding: "12px 16px", color: "#6b7280" }}>{new Date(b.booking_date).toLocaleDateString()}</td>
                          <td style={{ padding: "12px 16px", color: "#6b7280" }}>{b.start_time} - {b.end_time}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: "capitalize", background: sc.bg, color: sc.color }}>{b.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}