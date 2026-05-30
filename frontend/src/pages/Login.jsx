import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div onClick={() => navigate("/")} style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>PS</div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#111" }}>PadhaiSathi</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111", margin: "0 0 8px" }}>Welcome back</h1>
          <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>Sign in to your account</p>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "36px 32px" }}>
          {error && (
            <div style={{ background: "#fef2f2", color: "#dc2626", padding: "10px 14px", borderRadius: 8, fontSize: 14, marginBottom: 20, border: "1px solid #fecaca" }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Email address</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@email.com" required
                style={{ width: "100%", padding: "11px 14px", borderRadius: 9, border: "1px solid #d1d5db", fontSize: 15, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Your password" required
                style={{ width: "100%", padding: "11px 14px", borderRadius: 9, border: "1px solid #d1d5db", fontSize: 15, boxSizing: "border-box" }} />
            </div>
            <button type="submit" disabled={loading}
              style={{ padding: 13, background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 4 }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#e5e7eb" }}></div>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "#e5e7eb" }}></div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {["student", "tutor"].map(role => (
              <button key={role} onClick={() => navigate(`/register?role=${role}`)}
                style={{ padding: 10, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151", textTransform: "capitalize" }}>
                Join as {role}
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: "#6b7280", marginTop: 20 }}>
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")} style={{ color: "#4f46e5", fontWeight: 600, cursor: "pointer" }}>Create one free</span>
        </p>
      </div>
    </div>
  );
}