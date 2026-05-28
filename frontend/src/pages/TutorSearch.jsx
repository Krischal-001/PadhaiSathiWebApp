import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { searchTutors } from "../api/tutors";

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Nepali", "Computer Science", "Economics", "History", "Accounting"];

export default function TutorSearch() {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", subject: "", city: "", min_rate: "", max_rate: "" });

  const load = async (f = filters) => {
    setLoading(true);
    const clean = Object.fromEntries(Object.entries(f).filter(([, v]) => v !== ""));
    const data = await searchTutors(clean);
    setTutors(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const handleFilter = (key, val) => {
    const updated = { ...filters, [key]: val };
    setFilters(updated);
    load(updated);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111", margin: "0 0 8px" }}>Find a Tutor</h1>
        <p style={{ color: "#6b7280", margin: "0 0 28px" }}>Browse verified tutors in Nepal</p>

        {/* Filters */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px", marginBottom: 24, display: "flex", flexWrap: "wrap", gap: 12 }}>
          <input
            placeholder="Search by name or keyword..."
            value={filters.search}
            onChange={e => handleFilter("search", e.target.value)}
            style={{ flex: 2, minWidth: 200, padding: "9px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14 }}
          />
          <select value={filters.subject} onChange={e => handleFilter("subject", e.target.value)}
            style={{ flex: 1, minWidth: 140, padding: "9px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14 }}>
            <option value="">All Subjects</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input placeholder="City" value={filters.city} onChange={e => handleFilter("city", e.target.value)}
            style={{ flex: 1, minWidth: 120, padding: "9px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14 }} />
          <input placeholder="Min rate" type="number" value={filters.min_rate} onChange={e => handleFilter("min_rate", e.target.value)}
            style={{ width: 100, padding: "9px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14 }} />
          <input placeholder="Max rate" type="number" value={filters.max_rate} onChange={e => handleFilter("max_rate", e.target.value)}
            style={{ width: 100, padding: "9px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14 }} />
          <button onClick={() => { const reset = { search: "", subject: "", city: "", min_rate: "", max_rate: "" }; setFilters(reset); load(reset); }}
            style={{ padding: "9px 18px", background: "#f3f4f6", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            Clear
          </button>
        </div>

        {/* Results */}
        <div style={{ marginBottom: 12, fontSize: 13, color: "#6b7280" }}>
          {loading ? "Searching..." : `${tutors.length} tutor${tutors.length !== 1 ? "s" : ""} found`}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#6b7280" }}>Loading tutors...</div>
        ) : tutors.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb" }}>
            <p style={{ color: "#6b7280", fontSize: 16 }}>No tutors found. Try different filters.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {tutors.map(t => (
              <div key={t.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                <div style={{ padding: "20px 20px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                        {(t.full_name || t.username)?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: 16, fontWeight: 700, color: "#111", margin: 0 }}>{t.full_name || t.username}</p>
                        <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{t.city} · {t.experience_years} yrs exp</p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: "#4f46e5" }}>NPR {t.hourly_rate}</span>
                      <span style={{ fontSize: 11, color: "#6b7280", display: "block" }}>/hour</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, margin: "0 0 12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {t.bio}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {t.subjects?.slice(0, 4).map(s => (
                      <span key={s.id} style={{ padding: "2px 8px", background: "#ede9fe", color: "#4f46e5", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{s.name}</span>
                    ))}
                    {t.subjects?.length > 4 && <span style={{ fontSize: 11, color: "#6b7280" }}>+{t.subjects.length - 4} more</span>}
                  </div>
                </div>
                <div style={{ padding: "12px 20px", borderTop: "1px solid #f3f4f6", display: "flex", gap: 8, marginTop: "auto" }}>
                  <button onClick={() => navigate(`/book/${t.user_id}`)}
                    style={{ flex: 1, padding: "9px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                    Book Session
                  </button>
                  <button onClick={() => navigate(`/tutor/${t.id}`)}
                    style={{ padding: "9px 14px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}