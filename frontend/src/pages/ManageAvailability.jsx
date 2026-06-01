import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyAvailability, addSlot, removeSlot, blockDate, unblockDate } from "../api/availability";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ManageAvailability() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ day_of_week: 1, start_time: "09:00", end_time: "10:00" });
  const [blockForm, setBlockForm] = useState({ blocked_date: "", reason: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const data = await getMyAvailability();
    setSlots(data.slots || []);
    setBlockedDates(data.blocked_dates || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await addSlot(form);
    if (res.slot) { await load(); }
    else setError(res.message || "Failed to add slot");
    setSaving(false);
  };

  const handleRemoveSlot = async (id) => {
    await removeSlot(id);
    await load();
  };

  const handleBlockDate = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await blockDate(blockForm);
    if (res.blocked) { await load(); setBlockForm({ blocked_date: "", reason: "" }); }
    else setError(res.message || "Failed to block date");
    setSaving(false);
  };

  const handleUnblock = async (id) => {
    await unblockDate(id);
    await load();
  };

  const slotsByDay = DAYS.map((day, idx) => ({
    day,
    idx,
    slots: slots.filter(s => s.day_of_week === idx),
  }));

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <button style={s.backBtn} onClick={() => navigate("/dashboard")}>← Dashboard</button>
        <h2 style={s.title}>Manage Availability</h2>
      </div>

      <div style={s.grid}>
        <div>
          <div style={s.card}>
            <h3 style={s.cardTitle}>Weekly schedule</h3>
            <p style={s.cardSub}>Set your recurring available time slots for each day.</p>

            {loading ? <p style={s.muted}>Loading...</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                {slotsByDay.map(({ day, idx, slots: daySlots }) => (
                  <div key={idx} style={s.dayRow}>
                    <div style={s.dayLabel}>
                      <span style={s.dayName}>{DAY_SHORT[idx]}</span>
                      {daySlots.length === 0 && <span style={s.noSlot}>No slots</span>}
                    </div>
                    <div style={s.slotList}>
                      {daySlots.map(slot => (
                        <div key={slot.id} style={s.slotTag}>
                          <span>{slot.start_time.slice(0,5)} – {slot.end_time.slice(0,5)}</span>
                          <button style={s.removeBtn} onClick={() => handleRemoveSlot(slot.id)}>✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={s.divider} />
            <h4 style={s.formTitle}>Add a slot</h4>
            {error && <p style={s.error}>{error}</p>}
            <form onSubmit={handleAddSlot} style={s.form}>
              <div style={s.formRow}>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Day</label>
                  <select style={s.input} value={form.day_of_week}
                    onChange={e => setForm({ ...form, day_of_week: Number(e.target.value) })}>
                    {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Start</label>
                  <input style={s.input} type="time" value={form.start_time}
                    onChange={e => setForm({ ...form, start_time: e.target.value })} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>End</label>
                  <input style={s.input} type="time" value={form.end_time}
                    onChange={e => setForm({ ...form, end_time: e.target.value })} required />
                </div>
              </div>
              <button type="submit" style={s.addBtn} disabled={saving}>
                {saving ? "Saving..." : "+ Add Slot"}
              </button>
            </form>
          </div>
        </div>

        <div>
          <div style={s.card}>
            <h3 style={s.cardTitle}>Blocked dates</h3>
            <p style={s.cardSub}>Mark dates when you're unavailable.</p>

            {blockedDates.length === 0 ? (
              <p style={s.muted}>No blocked dates.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {blockedDates.map(b => (
                  <div key={b.id} style={s.blockedRow}>
                    <div>
                      <p style={s.blockedDate}>
                        {new Date(b.blocked_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </p>
                      {b.reason && <p style={s.blockedReason}>{b.reason}</p>}
                    </div>
                    <button style={s.unblockBtn} onClick={() => handleUnblock(b.id)}>Remove</button>
                  </div>
                ))}
              </div>
            )}

            <div style={s.divider} />
            <h4 style={s.formTitle}>Block a date</h4>
            <form onSubmit={handleBlockDate} style={s.form}>
              <div>
                <label style={s.label}>Date</label>
                <input style={s.input} type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={blockForm.blocked_date}
                  onChange={e => setBlockForm({ ...blockForm, blocked_date: e.target.value })}
                  required />
              </div>
              <div>
                <label style={s.label}>Reason (optional)</label>
                <input style={s.input} type="text" placeholder="e.g. Public holiday"
                  value={blockForm.reason}
                  onChange={e => setBlockForm({ ...blockForm, reason: e.target.value })} />
              </div>
              <button type="submit" style={s.addBtn} disabled={saving}>
                {saving ? "Saving..." : "Block Date"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { maxWidth: 900, margin: "32px auto", padding: "0 20px", fontFamily: "sans-serif" },
  topBar: { display: "flex", alignItems: "center", gap: 16, marginBottom: 24 },
  backBtn: { background: "none", border: "none", color: "#4f46e5", cursor: "pointer", fontSize: 14, fontWeight: 600, padding: 0 },
  title: { fontSize: 22, fontWeight: 700, margin: 0, color: "#111" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "24px" },
  cardTitle: { fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 4px" },
  cardSub: { fontSize: 13, color: "#6b7280", margin: "0 0 20px" },
  dayRow: { display: "flex", alignItems: "center", gap: 12, minHeight: 36 },
  dayLabel: { width: 48, flexShrink: 0, display: "flex", flexDirection: "column" },
  dayName: { fontSize: 13, fontWeight: 700, color: "#111" },
  noSlot: { fontSize: 11, color: "#9ca3af" },
  slotList: { display: "flex", flexWrap: "wrap", gap: 6, flex: 1 },
  slotTag: { display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "#ede9fe", borderRadius: 20, fontSize: 12, fontWeight: 600, color: "#4f46e5" },
  removeBtn: { background: "none", border: "none", color: "#7c3aed", cursor: "pointer", fontSize: 12, padding: 0, lineHeight: 1 },
  divider: { height: 1, background: "#f3f4f6", margin: "20px 0" },
  formTitle: { fontSize: 14, fontWeight: 600, color: "#111", margin: "0 0 14px" },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  formRow: { display: "flex", gap: 12 },
  label: { fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 },
  input: { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box" },
  addBtn: { padding: "9px 20px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14, alignSelf: "flex-start" },
  blockedRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#fef2f2", borderRadius: 8 },
  blockedDate: { fontSize: 13, fontWeight: 600, color: "#991b1b", margin: 0 },
  blockedReason: { fontSize: 12, color: "#6b7280", margin: 0 },
  unblockBtn: { fontSize: 12, color: "#991b1b", background: "none", border: "1px solid #fca5a5", borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontWeight: 600 },
  muted: { color: "#6b7280", fontSize: 13 },
  error: { color: "#dc2626", fontSize: 13, background: "#fef2f2", padding: "8px 12px", borderRadius: 6 },
};