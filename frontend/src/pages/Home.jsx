import { useNavigate } from "react-router-dom";

const ROLES = [
  { role: "student", label: "Student", desc: "Find expert tutors, book sessions, and track your learning progress.", color: "#dbeafe", accent: "#1d4ed8" },
  { role: "parent", label: "Parent", desc: "Monitor your child's sessions, manage bookings, and ensure quality education.", color: "#fce7f3", accent: "#9d174d" },
  { role: "tutor", label: "Tutor", desc: "Create your profile, set your rates, and connect with students.", color: "#d1fae5", accent: "#065f46" },
  { role: "institute", label: "Institute", desc: "List your institution, manage tutors, and grow your reach.", color: "#fef3c7", accent: "#92400e" },
];

const FEATURES = [
  { title: "Smart Matching", desc: "Get matched with tutors based on subject, location and budget." },
  { title: "Easy Booking", desc: "Book sessions in seconds with a simple calendar interface." },
  { title: "Secure Payments", desc: "Pay safely. Tutors get paid only after sessions complete." },
  { title: "Progress Tracking", desc: "Track sessions, subjects covered, and improvement over time." },
  { title: "Verified Tutors", desc: "All tutors are verified with background checks and reviews." },
  { title: "Parent Dashboard", desc: "Parents can monitor their children's sessions and progress." },
];

const QUICK_SUBJECTS = ["Mathematics", "Physics", "English", "Computer Science", "Chemistry"];

export default function Home() {
  const navigate = useNavigate();

  const handleSearch = () => {
    const val = document.getElementById("hero-search").value;
    navigate(`/tutors${val ? `?search=${encodeURIComponent(val)}` : ""}`);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#fafafa", minHeight: "100vh" }}>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", padding: "80px 24px 64px", textAlign: "center", color: "#fff" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
            Nepal's #1 Tutor Platform
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 800, margin: "0 0 20px", lineHeight: 1.15, letterSpacing: "-1px" }}>
            Learn Smarter.<br />Teach Better.
          </h1>
          <p style={{ fontSize: 18, opacity: 0.85, margin: "0 0 40px", lineHeight: 1.6 }}>
            PadhaiSathi connects students with the best tutors in Nepal.
          </p>

          {/* Hero Search */}
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 14, padding: 8, display: "flex", gap: 8, maxWidth: 580, margin: "0 auto 20px" }}>
            <input
              id="hero-search"
              onKeyDown={handleKey}
              placeholder="Search by subject, tutor name..."
              style={{ flex: 1, padding: "13px 18px", borderRadius: 9, border: "none", fontSize: 15, outline: "none", background: "#fff", color: "#111" }}
            />
            <button onClick={handleSearch}
              style={{ padding: "13px 28px", background: "#fff", color: "#4f46e5", border: "none", borderRadius: 9, fontSize: 15, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
              Search
            </button>
          </div>

          {/* Quick subject tags */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {QUICK_SUBJECTS.map(s => (
              <span key={s} onClick={() => navigate(`/tutors?subject=${encodeURIComponent(s)}`)}
                style={{ padding: "5px 14px", background: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "1px solid rgba(255,255,255,0.3)" }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, textAlign: "center" }}>
          {[["500+", "Tutors"], ["2,000+", "Students"], ["10,000+", "Sessions"], ["4.8", "Avg Rating"]].map(([num, label]) => (
            <div key={label}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#4f46e5" }}>{num}</div>
              <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 500, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Cards */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "72px 24px 0" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, color: "#111", margin: "0 0 8px" }}>
          Who are you?
        </h2>
        <p style={{ textAlign: "center", color: "#6b7280", margin: "0 0 40px", fontSize: 16 }}>
          Choose your role to get a personalized experience
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
          {ROLES.map((r) => (
            <div key={r.role}
              onClick={() => navigate(`/register?role=${r.role}`)}
              style={{ background: "#fff", border: "2px solid #e5e7eb", borderRadius: 16, padding: "28px 24px", cursor: "pointer", display: "flex", gap: 20, alignItems: "flex-start" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = r.accent; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: r.color, color: r.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, flexShrink: 0 }}>
                {r.label[0]}
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: "0 0 6px" }}>I am a {r.label}</h3>
                <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 12px", lineHeight: 1.6 }}>{r.desc}</p>
                <span style={{ fontSize: 13, fontWeight: 600, color: r.accent }}>Join as {r.label} &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ background: "#fff", margin: "72px 0 0", padding: "64px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, color: "#111", margin: "0 0 48px" }}>
            Everything you need
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40 }}>
            {FEATURES.map((f) => (
              <div key={f.title}>
                <div style={{ width: 44, height: 44, background: "#ede9fe", borderRadius: 12, marginBottom: 16 }}></div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 8px" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#6b7280", margin: 0, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", padding: "64px 24px", textAlign: "center", color: "#fff" }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 16px" }}>Ready to get started?</h2>
        <p style={{ fontSize: 16, opacity: 0.85, margin: "0 0 32px" }}>Join thousands of students and tutors on PadhaiSathi today.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/register")}
            style={{ padding: "14px 40px", background: "#fff", color: "#4f46e5", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
            Create Free Account
          </button>
          <button onClick={() => navigate("/tutors")}
            style={{ padding: "14px 40px", background: "rgba(255,255,255,0.15)", color: "#fff", border: "2px solid rgba(255,255,255,0.4)", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
            Browse Tutors
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: "#111", color: "#9ca3af", padding: "40px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontWeight: 800, color: "#fff", fontSize: 18, marginBottom: 6 }}>PadhaiSathi</div>
            <div style={{ fontSize: 13 }}>Nepal's trusted tutor marketplace.</div>
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 13 }}>
            <span style={{ cursor: "pointer" }} onClick={() => navigate("/register?role=student")}>For Students</span>
            <span style={{ cursor: "pointer" }} onClick={() => navigate("/register?role=tutor")}>For Tutors</span>
            <span style={{ cursor: "pointer" }} onClick={() => navigate("/register?role=parent")}>For Parents</span>
            <span style={{ cursor: "pointer" }} onClick={() => navigate("/register?role=institute")}>For Institutes</span>
          </div>
          <div style={{ fontSize: 12 }}>2026 PadhaiSathi. All rights reserved.</div>
        </div>
      </div>

    </div>
  );
}