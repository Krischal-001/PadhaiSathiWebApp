import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_COLORS = {
  student:   { bg: "#dbeafe", color: "#1d4ed8" },
  parent:    { bg: "#fce7f3", color: "#9d174d" },
  tutor:     { bg: "#d1fae5", color: "#065f46" },
  institute: { bg: "#fef3c7", color: "#92400e" },
  admin:     { bg: "#fee2e2", color: "#991b1b" },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate("/"); };
  const handleLogo = () => navigate(user ? "/dashboard" : "/");

  const rc = ROLE_COLORS[user?.role] || ROLE_COLORS.student;

  const navLinks = user ? [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Bookings", path: "/bookings" },
    ...(user.role === "tutor" ? [{ label: "My Profile", path: "/profile/me" }] : []),
    ...(user.role === "admin" ? [{ label: "Admin", path: "/admin" }] : []),
  ] : [];

  return (
    <nav style={S.nav}>
      <div style={S.inner}>
        <div style={S.logo} onClick={handleLogo}>
          <div style={S.logoIcon}>PS</div>
          <span style={S.logoText}>PadhaiSathi</span>
        </div>

        {user && (
          <div style={S.links}>
            {navLinks.map((l) => (
              <button key={l.path} onClick={() => navigate(l.path)}
                style={{ ...S.link, borderBottom: location.pathname === l.path ? "2px solid #4f46e5" : "2px solid transparent", color: location.pathname === l.path ? "#4f46e5" : "#374151" }}>
                {l.label}
              </button>
            ))}
          </div>
        )}

        <div style={S.right}>
          {user ? (
            <>
              <div style={S.userInfo}>
                <div style={S.avatar}>{(user.full_name || user.username)?.[0]?.toUpperCase()}</div>
                <div style={S.userText}>
                  <span style={S.userName}>{user.full_name || user.username}</span>
                  <span style={{ ...S.roleBadge, background: rc.bg, color: rc.color }}>{user.role}</span>
                </div>
              </div>
              <button onClick={handleLogout} style={S.logoutBtn}>Logout</button>
            </>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => navigate("/login")} style={S.loginBtn}>Login</button>
              <button onClick={() => navigate("/register")} style={S.registerBtn}>Get Started</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const S = {
  nav: { background: "#fff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 100 },
  inner: { maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", gap: 32 },
  logo: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer", textDecoration: "none", flexShrink: 0 },
  logoIcon: { width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 },
  logoText: { fontSize: 18, fontWeight: 800, color: "#111", letterSpacing: "-0.5px" },
  links: { display: "flex", gap: 4, flex: 1 },
  link: { background: "none", border: "none", borderBottom: "2px solid transparent", padding: "6px 12px", cursor: "pointer", fontSize: 14, fontWeight: 500, transition: "all 0.15s" },
  right: { display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" },
  userInfo: { display: "flex", alignItems: "center", gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 },
  userText: { display: "flex", flexDirection: "column", gap: 2 },
  userName: { fontSize: 13, fontWeight: 600, color: "#111" },
  roleBadge: { fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10, textTransform: "capitalize", width: "fit-content" },
  logoutBtn: { padding: "7px 16px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 },
  loginBtn: { padding: "7px 16px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 },
  registerBtn: { padding: "7px 16px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 },
};