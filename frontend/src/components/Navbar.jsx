import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const ROLE_COLORS = {
  student:   { bg: "#dbeafe", color: "#1d4ed8" },
  parent:    { bg: "#fce7f3", color: "#9d174d" },
  tutor:     { bg: "#d1fae5", color: "#065f46" },
  institute: { bg: "#fef3c7", color: "#92400e" },
  admin:     { bg: "#fee2e2", color: "#991b1b" },
};

const getNavLinks = (role) => {
  const common = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Find Tutors", path: "/tutors" },
  ];
  switch (role) {
    case "student":
      return [
        ...common,
        { label: "My Bookings", path: "/bookings" },
      ];
    case "tutor":
      return [
        { label: "Dashboard", path: "/dashboard" },
        { label: "My Profile", path: "/profile/me" },
        { label: "Availability", path: "/availability" },
        { label: "Bookings", path: "/bookings" },
        { label: "Find Tutors", path: "/tutors" },
      ];
    case "parent":
      return [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Find Tutors", path: "/tutors" },
        { label: "Bookings", path: "/bookings" },
      ];
    case "institute":
      return [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Find Tutors", path: "/tutors" },
        { label: "Bookings", path: "/bookings" },
      ];
    case "admin":
      return [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Admin Panel", path: "/admin" },
        { label: "Find Tutors", path: "/tutors" },
        { label: "Bookings", path: "/bookings" },
      ];
    default:
      return common;
  }
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => { logout(); navigate("/"); };
  const rc = ROLE_COLORS[user?.role] || ROLE_COLORS.student;
  const navLinks = user ? getNavLinks(user.role) : [];

  return (
    <nav style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", gap: 16 }}>

        <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>
            PS
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#111", letterSpacing: "-0.5px" }}>PadhaiSathi</span>
        </div>

        <div style={{ display: "flex", gap: 0, flex: 1, overflowX: "auto" }}>
          {navLinks.map((l) => (
            <button key={l.path} onClick={() => navigate(l.path)} style={{
              background: "none",
              border: "none",
              borderBottom: location.pathname === l.path ? "2px solid #4f46e5" : "2px solid transparent",
              padding: "6px 14px",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: location.pathname === l.path ? 600 : 500,
              color: location.pathname === l.path ? "#4f46e5" : "#374151",
              whiteSpace: "nowrap",
              height: 64,
            }}>
              {l.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {user ? (
            <>
              <NotificationBell />
              <div
                onClick={() => navigate(user.role === "tutor" ? "/profile/me" : "/dashboard")}
                style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "4px 8px", borderRadius: 8, border: "1px solid #e5e7eb" }}
              >
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                  {(user.full_name || user.username)?.[0]?.toUpperCase()}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#111", lineHeight: 1 }}>{user.full_name || user.username}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 8, textTransform: "capitalize", background: rc.bg, color: rc.color, width: "fit-content" }}>
                    {user.role}
                  </span>
                </div>
              </div>
              <button onClick={handleLogout} style={{ padding: "6px 14px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, flexShrink: 0 }}>
                Logout
              </button>
            </>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => navigate("/login")} style={{ padding: "7px 16px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                Login
              </button>
              <button onClick={() => navigate("/register")} style={{ padding: "7px 16px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                Get Started
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}