import { useState, useEffect, useRef } from "react";
import { getNotifications, markAllRead } from "../api/notifications";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ notifications: [], unread_count: 0 });
  const ref = useRef();

  const load = async () => {
    try {
      const d = await getNotifications();
      if (d && d.notifications) setData(d);
    } catch {}
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = async () => {
    setOpen(prev => !prev);
    if (!open && data.unread_count > 0) {
      await markAllRead();
      setData(d => ({
        ...d,
        unread_count: 0,
        notifications: d.notifications.map(n => ({ ...n, is_read: true }))
      }));
    }
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={handleOpen} style={{
        position: "relative", background: "#f3f4f6", border: "none",
        borderRadius: 8, width: 36, height: 36, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {data.unread_count > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            background: "#ef4444", color: "#fff", borderRadius: "50%",
            width: 18, height: 18, fontSize: 10, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #fff",
          }}>
            {data.unread_count > 9 ? "9+" : data.unread_count}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: 44, width: 320,
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 200, overflow: "hidden",
        }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>Notifications</span>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>{data.notifications.length} total</span>
          </div>

          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {data.notifications.length === 0 ? (
              <div style={{ padding: "36px 16px", textAlign: "center" }}>
                <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>No notifications yet</p>
              </div>
            ) : (
              data.notifications.map(n => (
                <div key={n.id} style={{
                  padding: "12px 18px", borderBottom: "1px solid #f9fafb",
                  background: n.is_read ? "#fff" : "#fafafa",
                  display: "flex", gap: 10, alignItems: "flex-start",
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", marginTop: 5, flexShrink: 0,
                    background: n.type === "booking" ? "#4f46e5" : n.type === "review" ? "#059669" : "#9ca3af",
                  }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: "0 0 2px" }}>{n.title}</p>
                    <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 3px", lineHeight: 1.5 }}>{n.message}</p>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
                      {new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {data.notifications.length > 0 && (
            <div style={{ padding: "10px 18px", borderTop: "1px solid #f3f4f6", textAlign: "center" }}>
              <button onClick={() => markAllRead()}
                style={{ background: "none", border: "none", color: "#4f46e5", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}