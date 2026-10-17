"use client";

import React, { useState, useEffect } from "react";
import { 
  Bot, AlertTriangle, CheckCircle2, Clock, 
  Send, Sparkles, RefreshCw, Users, ShieldCheck, 
  Terminal, Activity, Zap, ExternalLink, Shield,
  ArrowRight, Radio, Laptop
} from "lucide-react";

interface ConnectedNode {
  chatId: string;
  userId: string;
  name: string;
  username: string;
  role: string;
  isBlocked: boolean;
  blockerReason?: string;
  waitingFor?: string;
  joinedAt?: string;
}

interface LiveEvent {
  id: string;
  type: string;
  actor: string;
  target?: string;
  message: string;
  timestamp: string;
}

export default function RealtimeSprintConsole() {
  const [nodes, setNodes] = useState<ConnectedNode[]>([]);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [lastSync, setLastSync] = useState<string>("Connecting...");
  const [isLive, setIsLive] = useState<boolean>(true);

  // Poll live telemetry stream every 1.5 seconds
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch("/api/live-stream");
        if (res.ok) {
          const data = await res.json();
          if (data.users) setNodes(data.users);
          if (data.events) setEvents(data.events);
          setLastSync(new Date().toLocaleTimeString());
          setIsLive(true);
        }
      } catch (e) {
        setIsLive(false);
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 1500);
    return () => clearInterval(interval);
  }, []);

  const blockedCount = nodes.filter(n => n.isBlocked).length;
  const velocity = nodes.length > 0 
    ? Math.round(((nodes.length - blockedCount) / nodes.length) * 100) 
    : 100;

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-mono text-xs selection:bg-amber-500 selection:text-black">
      
      {/* Top Engineering Header */}
      <header className="border-b border-slate-800 bg-[#0F1623]/90 px-4 md:px-8 py-3.5 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-black font-bold shadow-md shadow-amber-500/20">
              <Bot className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white">SyncPulse <span className="text-amber-400">AI</span></span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  TRACK W-PS-1
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  REALTIME ENGINE ONLINE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                Autonomous Multi-Agent Project Coordinator · CIMAGE Patna to Kurukshetra Pune
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Poll Interval: 1.5s</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300">Sync: {lastSync}</span>
            </div>

            <a
              href="https://t.me/syncpulse_solver_bot"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-900/20 transition hover:scale-105"
            >
              <Bot className="w-4 h-4" />
              <span>Connect Telegram: @syncpulse_solver_bot</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Realtime Workspace */}
      <main className="max-w-7xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* Left Column: Active Connected Telegram Nodes (4 Cols) */}
        <section className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-[#0F1623] border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h2 className="font-bold text-white text-sm">Active Telegram Nodes</h2>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                {nodes.length} Connected
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Anyone who types <code className="text-amber-400 font-mono">/start</code> on <a href="https://t.me/syncpulse_solver_bot" target="_blank" className="underline text-cyan-400">@syncpulse_solver_bot</a> automatically appears here with their verified Telegram account.
            </p>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {nodes.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center space-y-2">
                  <Laptop className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-slate-400 font-sans text-xs font-bold">No Telegram Nodes Connected Yet</p>
                  <p className="text-[10px] text-slate-500 font-sans">
                    Open Telegram on any phone, search <span className="text-amber-400 font-mono">@syncpulse_solver_bot</span>, and press /start to authenticate.
                  </p>
                </div>
              ) : (
                nodes.map((n, i) => (
                  <div 
                    key={n.chatId || i} 
                    className={`p-3 rounded-xl border transition-all ${
                      n.isBlocked 
                        ? "bg-red-950/20 border-red-500/40 text-red-200" 
                        : "bg-slate-900/60 border-slate-800 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${n.isBlocked ? "bg-red-500 animate-ping" : "bg-emerald-400"}`} />
                        <span className="font-bold text-white text-xs">{n.name}</span>
                        <span className="text-[10px] text-cyan-400 font-mono">{n.username}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                        n.isBlocked ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {n.isBlocked ? "BLOCKED" : "ACTIVE"}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="text-amber-300 font-sans font-semibold">Role: {n.role || "Engineer"}</span>
                      <span className="text-slate-500">ID: {n.chatId}</span>
                    </div>

                    {n.isBlocked && n.blockerReason && (
                      <div className="mt-2 pt-2 border-t border-red-500/20 text-[10px] text-red-300">
                        <span className="font-bold">⚠️ Blocker: </span>
                        <span>"{n.blockerReason}"</span>
                        {n.waitingFor && (
                          <div className="text-amber-300 mt-0.5">
                            Waiting on: <strong>{n.waitingFor}</strong>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#0F1623] border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400">SPRINT VELOCITY</span>
              <div className="text-2xl font-black text-amber-400">{velocity}%</div>
              <p className="text-[9px] text-slate-500">Unblocked ratio</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0F1623] border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400">ACTIVE BLOCKERS</span>
              <div className={`text-2xl font-black ${blockedCount > 0 ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>
                {blockedCount}
              </div>
              <p className="text-[9px] text-slate-500">Instant Escalation SLA</p>
            </div>
          </div>
        </section>

        {/* Center / Right Column: Live Event Stream Terminal (8 Cols) */}
        <section className="lg:col-span-8 flex flex-col space-y-4">
          <div className="p-4 rounded-2xl bg-[#0F1623] border border-slate-800 shadow-xl flex-1 flex flex-col space-y-3">
            
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h2 className="font-bold text-white text-sm">Autonomous Escalation Stream</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400">LIVE WEBSOCKET / POLLING STREAM</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-sans">
              Watch real-time inbound Telegram updates, autonomous AI blocker detections, outbound nudges to teammates, and dependency unblocks as they happen.
            </p>

            {/* Terminal Feed Box */}
            <div className="flex-1 bg-black/60 rounded-xl p-4 border border-slate-800 font-mono text-[11px] overflow-y-auto space-y-2.5 min-h-[420px] max-h-[560px]">
              {events.length === 0 ? (
                <div className="text-slate-600 flex items-center justify-center h-full space-x-2">
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Awaiting live Telegram activity... Send a message to @syncpulse_solver_bot</span>
                </div>
              ) : (
                events.map((ev, idx) => (
                  <div key={ev.id || idx} className="leading-relaxed border-b border-slate-900/80 pb-2">
                    <span className="text-slate-500">[{ev.timestamp}] </span>
                    {ev.type === "escalation_sent" ? (
                      <span className="text-red-400 font-bold">🚨 [ESCALATION DISPATCHED] </span>
                    ) : ev.type === "blocker_resolved" ? (
                      <span className="text-emerald-400 font-bold">⚡ [BLOCKER RESOLVED] </span>
                    ) : ev.type === "user_connected" ? (
                      <span className="text-cyan-400 font-bold">👤 [AUTH NODE] </span>
                    ) : (
                      <span className="text-amber-400 font-bold">📥 [INBOUND] </span>
                    )}
                    <span className="text-slate-300 font-semibold">{ev.actor}: </span>
                    <span className="text-slate-200">{ev.message}</span>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Flow: Person 1 reports blocker ➔ Bot notifies Person 2 on Telegram ➔ Person 2 replies ➔ Person 1 is unblocked.</span>
              </div>
              <span className="text-slate-500 font-mono">Status: Production Vercel</span>
            </div>

          </div>
        </section>

      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-900 bg-[#0A0D14] px-4 py-2.5 text-center text-[10px] text-slate-600">
        SyncPulse AI · Autonomous Group Project Coordinator · Track W-PS-1 · Dr. D.Y. Patil Institute of Technology, Pimpri, Pune
      </footer>

    </div>
  );
}
