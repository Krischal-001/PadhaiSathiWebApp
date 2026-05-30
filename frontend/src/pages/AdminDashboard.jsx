import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAdminStats, getAllUsers, getAllBookings, verifyUser, deleteUser } from "../api/admin";

const TABS = ["Overview", "Users", "Bookings"];
const ROLE_COLOR = {
  student: { bg: "#dbeafe", color: "#1d4ed8" },
  parent: { bg: "#fce7f3", color: "#9d174d" },
  tutor: { bg: "#d1fae5", color: "#065f46" },
  institute: { bg: "#fef3c7", color: "#92400e" },
  admin: { bg: "#fee2e2", color: "#991b1b" },
};
const STATUS_COLOR = {
  pending: { bg: "#fef3c7", color: "#92400e" },
  confirmed: { bg: "#d1fae5", color: "#065f46" },
  cancelled: { bg: "#fee2e2", color: "#991b1b" },
  completed: { bg: "#e0e7ff", color: "#3730a3" },
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("Overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [bookingFilter, setBookingFilter] = useState("all");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, usersData, bookingsData] = await Promise.all([
        getAdminStats(),
        getAllUsers(),
        getAllBookings(),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setBookings(bookingsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    loadAll();
  }, [user, navigate, loadAll]);

  const handleVerify = async (id) => {
    await verifyUser(id);
    loadAll();
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete user "${name}"? This cannot be undone.`)) {
      await deleteUser(id);
      loadAll();
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const filteredBookings = bookings.filter(b =>
    bookingFilter === "all" || b.status === bookingFilter
  );

  const roleCounts = ["student", "parent", "tutor", "institute", "admin"].reduce((acc, r) => {
    acc[r] = users.filter(u => u.role === r).length;
    return acc;
  }, {});

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #dc2626, #991b1b)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800 }}>A</div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111", margin: 0 }}>Admin Panel</h1>
            </div>
            <p style={{ color: "#6b7280", margin: 0, fontSize: 14 }}>Full platform control — manage users, bookings, and platform data</p>
          </div>
          <button onClick={loadAll}
            style={{ padding: "8px 18px", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151" }}>
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e5e7eb", marginBottom: 28 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "10px 24px", background: "none", border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 600,
              color: tab === t ? "#4f46e5" : "#6b7280",
              borderBottom: tab === t ? "2px solid #4f46e5" : "2px solid transparent",
              marginBottom: -1,
            }}>
              {t}
              {t === "Users" && <span style={{ marginLeft: 6, background: "#e5e7eb", borderRadius: 20, padding: "1px 7px", fontSize: 11 }}>{users.length}</span>}
              {t === "Bookings" && <span style={{ marginLeft: 6, background: "#e5e7eb", borderRadius: 20, padding: "1px 7px", fontSize: 11 }}>{bookings.length}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#6b7280" }}>Loading admin data...</div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {tab === "Overview" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
                  {[
                    { label: "Total Users", value: stats?.total_users ?? 0, color: "#4f46e5", bg: "#ede9fe", icon: "U" },
                    { label: "Total Bookings", value: stats?.total_bookings ?? 0, color: "#065f46", bg: "#d1fae5", icon: "B" },
                    { label: "Active Tutors", value: stats?.total_tutors ?? 0, color: "#92400e", bg: "#fef3c7", icon: "T" },
                    { label: "Revenue (NPR)", value: stats?.total_revenue ?? 0, color: "#991b1b", bg: "#fee2e2", icon: "R" },
                  ].map(s => (
                    <div key={s.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px", display: "flex", gap: 16, alignItems: "center" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, flexShrink: 0 }}>
                        {s.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
                  <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px" }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px", color: "#111" }}>Users by Role</h3>
                    {Object.entries(roleCounts).map(([role, count]) => {
                      const rc = ROLE_COLOR[role] || ROLE_COLOR.student;
                      const pct = users.length > 0 ? Math.round((count / users.length) * 100) : 0;
                      return (
                        <div key={role} style={{ marginBottom: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: rc.color, textTransform: "capitalize" }}>{role}</span>
                            <span style={{ fontSize: 13, color: "#6b7280" }}>{count} ({pct}%)</span>
                          </div>
                          <div style={{ height: 6, background: "#f3f4f6", borderRadius: 3 }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: rc.color, borderRadius: 3 }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px" }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px", color: "#111" }}>Booking Status</h3>
                    {["pending", "confirmed", "completed", "cancelled"].map(status => {
                      const count = bookings.filter(b => b.status === status).length;
                      const pct = bookings.length > 0 ? Math.round((count / bookings.length) * 100) : 0;
                      const sc = STATUS_COLOR[status];
                      return (
                        <div key={status} style={{ marginBottom: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: sc.color, textTransform: "capitalize" }}>{status}</span>
                            <span style={{ fontSize: 13, color: "#6b7280" }}>{count} ({pct}%)</span>
                          </div>
                          <div style={{ height: 6, background: "#f3f4f6", borderRadius: 3 }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: sc.color, borderRadius: 3 }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px", color: "#111" }}>Recent Bookings</h3>
                  {bookings.slice(0, 8).map(b => {
                    const sc = STATUS_COLOR[b.status] || STATUS_COLOR.pending;
                    return (
                      <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f9fafb" }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#ede9fe", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                            {b.student_name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{b.student_name}</span>
                            <span style={{ fontSize: 13, color: "#6b7280" }}> booked </span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{b.tutor_name}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <span style={{ fontSize: 12, color: "#6b7280" }}>{new Date(b.booking_date).toLocaleDateString()}</span>
                          <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color, textTransform: "capitalize" }}>{b.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {tab === "Users" && (
              <div>
                <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                  <input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 200, padding: "9px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14 }}
                  />
                  <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                    style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, background: "#fff" }}>
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="parent">Parents</option>
                    <option value="tutor">Tutors</option>
                    <option value="institute">Institutes</option>
                    <option value="admin">Admins</option>
                  </select>
                  <span style={{ fontSize: 13, color: "#6b7280", alignSelf: "center", whiteSpace: "nowrap" }}>
                    {filteredUsers.length} of {users.length} users
                  </span>
                </div>
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: "#f9fafb" }}>
                        {["ID", "User", "Email", "Role", "Verified", "Joined", "Actions"].map(h => (
                          <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: 12, borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => {
                        const rc = ROLE_COLOR[u.role] || ROLE_COLOR.student;
                        return (
                          <tr key={u.id} style={{ borderBottom: "1px solid #f3f4f6" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                            onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                            <td style={{ padding: "12px 16px", color: "#9ca3af", fontSize: 12 }}>#{u.id}</td>
                            <td style={{ padding: "12px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 30, height: 30, borderRadius: "50%", background: rc.bg, color: rc.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                                  {(u.full_name || u.username)?.[0]?.toUpperCase()}
                                </div>
                                <span style={{ fontWeight: 600, color: "#111" }}>{u.full_name || u.username}</span>
                              </div>
                            </td>
                            <td style={{ padding: "12px 16px", color: "#6b7280", fontSize: 13 }}>{u.email}</td>
                            <td style={{ padding: "12px 16px" }}>
                              <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "capitalize", background: rc.bg, color: rc.color }}>
                                {u.role}
                              </span>
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              {u.is_verified
                                ? <span style={{ color: "#065f46", fontWeight: 700, fontSize: 12 }}>Yes</span>
                                : <span style={{ color: "#9ca3af", fontSize: 12 }}>No</span>}
                            </td>
                            <td style={{ padding: "12px 16px", color: "#6b7280", fontSize: 12 }}>
                              {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <div style={{ display: "flex", gap: 6 }}>
                                {!u.is_verified && (
                                  <button onClick={() => handleVerify(u.id)}
                                    style={{ padding: "4px 10px", background: "#d1fae5", color: "#065f46", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                                    Verify
                                  </button>
                                )}
                                {u.role !== "admin" && (
                                  <button onClick={() => handleDelete(u.id, u.username)}
                                    style={{ padding: "4px 10px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>No users found.</div>
                  )}
                </div>
              </div>
            )}

            {/* BOOKINGS TAB */}
            {tab === "Bookings" && (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                  {["all", "pending", "confirmed", "completed", "cancelled"].map(s => {
                    const count = s === "all" ? bookings.length : bookings.filter(b => b.status === s).length;
                    return (
                      <button key={s} onClick={() => setBookingFilter(s)} style={{
                        padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
                        fontSize: 13, fontWeight: 600,
                        background: bookingFilter === s ? "#4f46e5" : "#f3f4f6",
                        color: bookingFilter === s ? "#fff" : "#374151",
                      }}>
                        {s.charAt(0).toUpperCase() + s.slice(1)} ({count})
                      </button>
                    );
                  })}
                </div>
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: "#f9fafb" }}>
                        {["ID", "Student", "Tutor", "Subject", "Date", "Time", "Status"].map(h => (
                          <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: 12, borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map(b => {
                        const sc = STATUS_COLOR[b.status] || STATUS_COLOR.pending;
                        return (
                          <tr key={b.id} style={{ borderBottom: "1px solid #f3f4f6" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                            onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                            <td style={{ padding: "12px 16px", color: "#9ca3af", fontSize: 12 }}>#{b.id}</td>
                            <td style={{ padding: "12px 16px", fontWeight: 600, color: "#111" }}>{b.student_name}</td>
                            <td style={{ padding: "12px 16px", color: "#374151" }}>{b.tutor_name}</td>
                            <td style={{ padding: "12px 16px", color: "#6b7280", fontSize: 13 }}>{b.subject_name || "-"}</td>
                            <td style={{ padding: "12px 16px", color: "#6b7280", fontSize: 13 }}>
                              {new Date(b.booking_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </td>
                            <td style={{ padding: "12px 16px", color: "#6b7280", fontSize: 13 }}>{b.start_time} - {b.end_time}</td>
                            <td style={{ padding: "12px 16px" }}>
                              <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "capitalize", background: sc.bg, color: sc.color }}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredBookings.length === 0 && (
                    <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>No bookings found.</div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}