import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  { value: "student", label: "Student", desc: "I want to find tutors", color: "#dbeafe", accent: "#1d4ed8" },
  { value: "parent", label: "Parent", desc: "I manage my child's education", color: "#fce7f3", accent: "#9d174d" },
  { value: "tutor", label: "Tutor", desc: "I want to teach students", color: "#d1fae5", accent: "#065f46" },
  { value: "institute", label: "Institute", desc: "We are an educational institution", color: "#fef3c7", accent: "#92400e" },
];

export default function Register() {
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState(searchParams.get("role") || "");
  const [form, setForm] = useState({ username: "", full_name: "", email: "", password: "", phone: "", institute_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("role")) setStep(2);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) return setError("Please select a role");
    setLoading(true);
    setError("");
    try {
      await register({ ...form, role });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 520 }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div onClick={() => navigate("/")} style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>PS</div>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#111" }}>PadhaiSathi</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111", margin: "0 0 8px" }}>Create your account</h1>
          <p style={{ color: "#6b7280", fontSize: 15 }}>Join thousands of students and tutors</p>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 32 }}>

          {/* Step indicator */}
          <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
            {["Choose Role", "Your Details"].map((s, i) => (
              <div key={s} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ height: 4, borderRadius: 2, background: step > i ? "#4f46e5" : "#e5e7eb", marginBottom: 6 }}></div>
                <span style={{ fontSize: 11, fontWeight: 600, color: step > i ? "#4f46e5" : "#9ca3af" }}>{s}</span>
              </div>
            ))}
          </div>

          {error && <div style={{ background: "#6e6e6e", color: "#dc2626", padding: "10px 14px", borderRadius: 8, fontSize: 14, marginBottom: 20 }}>{error}</div>}

          {step === 1 ? (
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 16 }}>I am a...</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                {ROLES.map((r) => (
                  <div key={r.value} onClick={() => setRole(r.value)}
                    style={{ padding: "16px 14px", borderRadius: 12, border: `2px solid ${role === r.value ? r.accent : "#e5e7eb"}`, background: role === r.value ? r.color : "#fff", cursor: "pointer", transition: "all 0.15s" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: role === r.value ? r.accent : "#111", marginBottom: 3 }}>{r.label}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{r.desc}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => { if (!role) return setError("Please select a role"); setError(""); setStep(2); }}
                style={{ width: "100%", padding: 13, background: "#4f46e5", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                Continue
              </button> 
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, padding: "10px 14px", background: "#f9fafb", borderRadius: 10 }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>Registering as:</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#4f46e5", textTransform: "capitalize" }}>{role}</span>
                <button type="button" onClick={() => setStep(1)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 12 }}>Change</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Username *</label>
                    <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }}
                      placeholder="username" required />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Full Name</label>
                    <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }}
                      placeholder="Full name" />
                  </div>
                </div>

                {role === "institute" && (
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Institute Name *</label>
                    <input value={form.institute_name} onChange={e => setForm({ ...form, institute_name: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }}
                      placeholder="Name of your institution" required />
                  </div>
                )}

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }}
                    placeholder="you@email.com" required />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Phone</label>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }}
                    placeholder="+977 98XXXXXXXX" />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Password *</label>
                  <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }}
                    placeholder="Min 6 characters" required minLength={6} />
                </div>

                <button type="submit" disabled={loading}
                  style={{ padding: 13, background: "#4f46e5", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 4 }}>
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </div>
            </form>
          )}

          <p style={{ textAlign: "center", fontSize: 13, color: "#6b7280", marginTop: 20 }}>
            Already have an account?{" "}
            <span onClick={() => navigate("/login")} style={{ color: "#4f46e5", fontWeight: 600, cursor: "pointer" }}>Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}