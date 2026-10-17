"use client";
import React, { useState, useEffect } from "react";

export default function RealtimeConsole() {
  const [data, setData] = useState<{ users: any[]; events: any[] }>({ users: [], events: [] });

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/telegram-webhook");
        if (res.ok) {
          const json = await res.json();
          setData({ users: json.users || [], events: json.events || [] });
        }
      } catch (e) {}
    };
    poll();
    const interval = setInterval(poll, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b0f17", color: "#e2e8f0", fontFamily: "monospace", padding: "20px" }}>
      <header style={{ borderBottom: "1px solid #1e293b", paddingBottom: "15px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "bold", margin: 0, color: "#f59e0b" }}>SyncPulse AI // Autonomous Coordinator</h1>
          <p style={{ margin: "5px 0 0", fontSize: "12px", color: "#94a3b8" }}>Real-Time Multi-Agent Sprint Engine · Track W-PS-1 · Patna to Pune</p>
        </div>
        <a href="https://t.me/syncpulse_solver_bot" target="_blank" rel="noreferrer" style={{ background: "#0284c7", color: "#fff", padding: "8px 16px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", fontSize: "12px" }}>
          Open @syncpulse_solver_bot ↗
        </a>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", padding: "16px" }}>
          <h3 style={{ margin: "0 0 12px", color: "#38bdf8", fontSize: "14px" }}>Active Telegram Nodes ({data.users.length})</h3>
          {data.users.length === 0 ? <p style={{ color: "#64748b", fontSize: "12px" }}>No nodes connected. Send /start on @syncpulse_solver_bot</p> : (
            data.users.map((u, i) => (
              <div key={i} style={{ padding: "10px", marginBottom: "8px", borderRadius: "8px", background: u.isBlocked ? "#450a0a" : "#1e293b", border: u.isBlocked ? "1px solid #ef4444" : "1px solid #334155" }}>
                <div style={{ fontWeight: "bold", color: "#fff" }}>{u.name} <span style={{ color: "#38bdf8" }}>({u.username})</span></div>
                <div style={{ fontSize: "11px", color: u.isBlocked ? "#fca5a5" : "#4ade80", marginTop: "4px" }}>
                  {u.isBlocked ? `🛑 BLOCKED: "${u.blockerReason}"` : "🟢 Active"}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", padding: "16px" }}>
          <h3 style={{ margin: "0 0 12px", color: "#4ade80", fontSize: "14px" }}>Live Escalation Stream (Real-Time Log)</h3>
          <div style={{ background: "#020617", padding: "12px", borderRadius: "8px", minHeight: "350px", maxHeight: "500px", overflowY: "auto", fontSize: "12px", border: "1px solid #1e293b" }}>
            {data.events.length === 0 ? <p style={{ color: "#475569" }}>Waiting for live activity... Message @syncpulse_solver_bot</p> : (
              data.events.map((ev, i) => (
                <div key={i} style={{ marginBottom: "8px", borderBottom: "1px solid #0f172a", paddingBottom: "6px" }}>
                  <span style={{ color: "#64748b" }}>[{ev.timestamp}] </span>
                  <strong style={{ color: ev.type === "escalation" ? "#ef4444" : ev.type === "unblock" ? "#4ade80" : "#f59e0b" }}>[{ev.type.toUpperCase()}] </strong>
                  <span style={{ color: "#e2e8f0" }}>{ev.actor}: {ev.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
