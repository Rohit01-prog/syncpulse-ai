"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Bot, AlertTriangle, CheckCircle2, Clock, ListTodo, Send, 
  ExternalLink, Sparkles, ShieldCheck, RefreshCw, Plus, Users, ArrowRight 
} from "lucide-react";

interface Task {
  id: string;
  task_code: string;
  title: string;
  description: string;
  assigned_to_name: string;
  status: "todo" | "in_progress" | "blocked" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  is_blocked: boolean;
  blocker_reason?: string;
  blocked_by_member_name?: string;
  due_date?: string;
}

interface ActivityLog {
  id: string;
  actor: string;
  event_type: string;
  message: string;
  ai_interpretation?: string;
  created_at: string;
}

const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    task_code: "TASK-101",
    title: "Finalize Presentation Slides & Pitch Deck",
    description: "Create pitch deck covering architecture, value proposition, and demo script.",
    assigned_to_name: "Aanya",
    status: "completed",
    priority: "high",
    is_blocked: false,
    due_date: "Tomorrow",
  },
  {
    id: "2",
    task_code: "TASK-102",
    title: "Connect the Payment API & Webhook Handlers",
    description: "Integrate sandbox payment gateway API, verify checkout flow, and listen to webhooks.",
    assigned_to_name: "Kabir",
    status: "in_progress",
    priority: "urgent",
    is_blocked: false,
    due_date: "Today",
  },
  {
    id: "3",
    task_code: "TASK-103",
    title: "Frontend Dashboard & UI Integration",
    description: "Build user transaction history, connect with backend endpoints, and handle loading states.",
    assigned_to_name: "Meera",
    status: "in_progress",
    priority: "high",
    is_blocked: false,
    due_date: "In 2 days",
  },
  {
    id: "4",
    task_code: "TASK-104",
    title: "Security & End-to-End Test Suite",
    description: "Run automated integration tests and verify JWT authentication header enforcement.",
    assigned_to_name: "Kabir",
    status: "todo",
    priority: "medium",
    is_blocked: false,
    due_date: "In 3 days",
  },
];

const INITIAL_LOGS: ActivityLog[] = [
  {
    id: "l1",
    actor: "Agent Brain",
    event_type: "bot_followup",
    message: "SyncPulse AI initialized project tracking. Monitored 4 tasks across 3 team members.",
    ai_interpretation: "Autonomous coordinator loop is active.",
    created_at: "Just now",
  },
];

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_LOGS);
  const [isDemoTriggering, setIsDemoTriggering] = useState(false);
  const [customReply, setCustomReply] = useState("");
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);

  // Load from Supabase on mount & enable Realtime listener
  useEffect(() => {
    async function loadInitialData() {
      try {
        const { data: dbTasks, error } = await supabase
          .from("tasks")
          .select("*")
          .order("created_at", { ascending: true });

        if (!error && dbTasks && dbTasks.length > 0) {
          setTasks(dbTasks);
          setIsRealtimeActive(true);
        }

        const { data: dbLogs } = await supabase
          .from("activity_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (dbLogs && dbLogs.length > 0) {
          setLogs(dbLogs);
        }
      } catch (err) {
        console.log("Supabase awaiting connection or tables:", err);
      }
    }

    loadInitialData();

    // Setup Supabase Realtime channel
    const channel = supabase
      .channel("realtime_dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload) => {
          setIsRealtimeActive(true);
          loadInitialData();
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_logs" },
        (payload) => {
          setLogs((prev) => [payload.new as ActivityLog, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Compute metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const blockedTasks = tasks.filter((t) => t.is_blocked || t.status === "blocked").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress" && !t.is_blocked).length;
  const healthScore = Math.max(20, 100 - blockedTasks * 25);

  // Demo Action 1: Trigger Agent Check-in to Kabir
  const triggerCheckIn = () => {
    setIsDemoTriggering(true);
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      actor: "SyncPulse Bot",
      event_type: "bot_followup",
      message: "👋 Hey Kabir! How is [TASK-102] Connect Payment API progressing? Are you on track or is anything blocking you?",
      ai_interpretation: "Scheduled autonomous check-in dispatched to Telegram.",
      created_at: new Date().toLocaleTimeString(),
    };
    setLogs((prev) => [newLog, ...prev]);
    setIsDemoTriggering(false);
  };

  // Demo Action 2: Simulate Kabir's reply with blocker on Meera
  const simulateBlockerReply = () => {
    // 1. Update task state
    setTasks((prev) =>
      prev.map((t) =>
        t.task_code === "TASK-102"
          ? {
              ...t,
              status: "blocked",
              is_blocked: true,
              blocker_reason: "Waiting for test credentials from Meera",
              blocked_by_member_name: "Meera",
            }
          : t
      )
    );

    // 2. Add logs
    const memberLog: ActivityLog = {
      id: (Date.now() + 1).toString(),
      actor: "Kabir (Telegram)",
      event_type: "member_reply",
      message: "The API is connected, but I am waiting for test credentials from Meera.",
      ai_interpretation: "Intent: BLOCKED. Blocker: 'test credentials'. Dependency: Meera.",
      created_at: new Date().toLocaleTimeString(),
    };

    const escalationLog: ActivityLog = {
      id: (Date.now() + 2).toString(),
      actor: "Agent Brain (Auto-Escalation)",
      event_type: "escalation_sent",
      message: "🚨 Sent Telegram DM to Meera: 'Hey Meera! Kabir is waiting on test credentials for the Payment API. Could you please share them?'",
      ai_interpretation: "Autonomous dependency escalation executed to unblock Kabir.",
      created_at: new Date().toLocaleTimeString(),
    };

    setLogs((prev) => [escalationLog, memberLog, ...prev]);
  };

  // Demo Action 3: Unblock Kabir (Meera shares credentials, Kabir completes task)
  const simulateUnblockAndComplete = () => {
    setTasks((prev) =>
      prev.map((t) =>
        t.task_code === "TASK-102"
          ? {
              ...t,
              status: "completed",
              is_blocked: false,
              blocker_reason: undefined,
              blocked_by_member_name: undefined,
            }
          : t
      )
    );

    const log: ActivityLog = {
      id: Date.now().toString(),
      actor: "Kabir (Telegram)",
      event_type: "status_changed",
      message: "Got credentials from Meera! Test suite passed, webhook verified. Task completed!",
      ai_interpretation: "Intent: COMPLETED. Blocker resolved. Health score restored to 100%.",
      created_at: new Date().toLocaleTimeString(),
    };
    setLogs((prev) => [log, ...prev]);
  };

  return (
    <div className="min-h-screen text-slate-100 p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">SyncPulse AI</h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  W-PS-1 Agentic AI
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {isRealtimeActive ? "Supabase Realtime Live" : "Local Standalone Active"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Autonomous Group Project Coordinator · Hackathon Kurukshetra (DY Patil Pune) · Powered by Worcflow.ai
              </p>
            </div>
          </div>
        </div>

        {/* Live Telegram Bot Link & Demo Controller Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://t.me/syncpulse_solver_bot"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            Open Telegram Bot
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>

          <button
            onClick={triggerCheckIn}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            1. Trigger Check-in
          </button>

          <button
            onClick={simulateBlockerReply}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-medium border border-red-800/40 transition"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            2. Simulate Blocker
          </button>

          <button
            onClick={simulateUnblockAndComplete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-medium border border-emerald-800/40 transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            3. Resolve & Complete
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto mt-6 space-y-6">
        
        {/* Blocker Alert Banner (Shows when any task is blocked) */}
        {blockedTasks > 0 && (
          <div className="rounded-xl bg-gradient-to-r from-red-950/60 via-red-900/30 to-slate-900 border border-red-500/40 p-4 shadow-xl shadow-red-950/30 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-500/20 text-red-400 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-red-200">
                    Active Blocker Escalation · Immediate Action Required
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-mono">
                    AUTONOMOUS NUDGE SENT
                  </span>
                </div>
                <p className="text-xs text-red-300/80 mt-1">
                  <strong>Kabir</strong> is blocked on <span className="underline decoration-red-400">[TASK-102] Connect Payment API</span>: 
                  <em> &quot;Waiting for test credentials from Meera&quot;</em>.
                  SyncPulse AI has automatically dispatched an urgent Telegram nudge to <strong>Meera (@meera_frontend)</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Project Health & Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4">
            <div className="text-xs uppercase font-medium text-slate-400">Project Health</div>
            <div className="text-2xl font-bold mt-1 text-white flex items-center gap-2">
              {healthScore}%
              <span className={`text-xs px-2 py-0.5 rounded-full ${healthScore > 80 ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                {healthScore > 80 ? "Healthy" : "At Risk"}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${healthScore > 80 ? "bg-emerald-500" : "bg-amber-500"}`}
                style={{ width: `${healthScore}%` }}
              ></div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4">
            <div className="text-xs uppercase font-medium text-slate-400">Completed</div>
            <div className="text-2xl font-bold mt-1 text-emerald-400">
              {completedTasks} <span className="text-sm text-slate-500">/ {totalTasks}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">{Math.round((completedTasks / totalTasks) * 100)}% overall completion</p>
          </div>

          <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4">
            <div className="text-xs uppercase font-medium text-slate-400">In Progress</div>
            <div className="text-2xl font-bold mt-1 text-blue-400">{inProgressTasks}</div>
            <p className="text-xs text-slate-500 mt-2">Active momentum</p>
          </div>

          <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4">
            <div className="text-xs uppercase font-medium text-slate-400">Critical Blockers</div>
            <div className={`text-2xl font-bold mt-1 ${blockedTasks > 0 ? "text-red-400" : "text-slate-400"}`}>
              {blockedTasks}
            </div>
            <p className="text-xs text-slate-500 mt-2">{blockedTasks > 0 ? "Autonomous escalation active" : "Zero bottlenecks"}</p>
          </div>
        </div>

        {/* 2-Column Layout: Kanban Board on Left, Live Telegram Activity Stream on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Kanban Board (2 Columns wide) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-blue-400" />
                Live Project Kanban Board
              </h2>
              <span className="text-xs text-slate-400">Auto-synced with Telegram updates</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Todo Column */}
              <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-3 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
                  <span>TO-DO</span>
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px]">
                    {tasks.filter((t) => t.status === "todo").length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {tasks
                    .filter((t) => t.status === "todo")
                    .map((t) => (
                      <TaskCard key={t.id} task={t} />
                    ))}
                </div>
              </div>

              {/* In Progress Column */}
              <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-3 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-semibold text-blue-400 px-1">
                  <span>IN PROGRESS</span>
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">
                    {tasks.filter((t) => t.status === "in_progress" && !t.is_blocked).length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {tasks
                    .filter((t) => t.status === "in_progress" && !t.is_blocked)
                    .map((t) => (
                      <TaskCard key={t.id} task={t} />
                    ))}
                </div>
              </div>

              {/* Blocked or Completed Column */}
              <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-3 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
                  <span>BLOCKED / DONE</span>
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px]">
                    {tasks.filter((t) => t.status === "blocked" || t.status === "completed").length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {tasks
                    .filter((t) => t.status === "blocked" || t.status === "completed")
                    .map((t) => (
                      <TaskCard key={t.id} task={t} />
                    ))}
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Live Telegram Activity Feed & Agent Reasoning */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" />
                Live Agent & Telegram Feed
              </h2>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                POLLING ACTIVE
              </span>
            </div>

            <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4 h-[560px] flex flex-col justify-between">
              
              {/* Feed Items */}
              <div className="overflow-y-auto space-y-3 pr-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-blue-400 flex items-center gap-1">
                        {log.actor.includes("Bot") || log.actor.includes("Agent") ? (
                          <Bot className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Users className="w-3 h-3 text-sky-400" />
                        )}
                        {log.actor}
                      </span>
                      <span className="text-[10px] text-slate-500">{log.created_at}</span>
                    </div>

                    <p className="text-slate-300 leading-relaxed font-sans">{log.message}</p>

                    {log.ai_interpretation && (
                      <div className="mt-1.5 pt-1.5 border-t border-slate-800/60 text-[11px] text-emerald-400/90 flex items-start gap-1 font-mono">
                        <Sparkles className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span>AI Reasoning: {log.ai_interpretation}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bot Interaction Info Footer */}
              <div className="pt-3 border-t border-slate-800 text-center">
                <p className="text-[11px] text-slate-400">
                  Judges can interact live on Telegram: <strong className="text-blue-400">@syncpulse_solver_bot</strong>
                </p>
              </div>

            </div>
          </div>

        </div>

      </main>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const isBlocked = task.is_blocked || task.status === "blocked";
  const isCompleted = task.status === "completed";

  return (
    <div
      className={`p-3.5 rounded-xl border transition-all duration-200 ${
        isBlocked
          ? "bg-red-950/30 border-red-500/50 shadow-md shadow-red-950/40"
          : isCompleted
          ? "bg-emerald-950/20 border-emerald-500/30"
          : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
      }`}
    >
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="font-mono text-slate-400 font-medium">{task.task_code}</span>
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold ${
            isBlocked
              ? "bg-red-500/20 text-red-300 border border-red-500/30"
              : isCompleted
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-blue-500/20 text-blue-300"
          }`}
        >
          {isBlocked ? "BLOCKED" : task.status.replace("_", " ")}
        </span>
      </div>

      <h4 className="text-xs font-semibold text-slate-200 line-clamp-2">{task.title}</h4>
      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{task.description}</p>

      {/* Blocker Reason Box */}
      {isBlocked && task.blocker_reason && (
        <div className="mt-2.5 p-2 rounded bg-red-950/60 border border-red-800/40 text-[11px] text-red-300">
          <div className="font-semibold flex items-center gap-1 text-red-400">
            <AlertTriangle className="w-3 h-3" /> Blocker:
          </div>
          <div>{task.blocker_reason}</div>
          {task.blocked_by_member_name && (
            <div className="mt-1 text-[10px] text-red-400/80 font-mono">
              Auto-escalated to: @{task.blocked_by_member_name}
            </div>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-3 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3 text-slate-500" />
          <span>{task.assigned_to_name}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-500">
          <Clock className="w-3 h-3" />
          <span>{task.due_date || "Today"}</span>
        </div>
      </div>
    </div>
  );
}
