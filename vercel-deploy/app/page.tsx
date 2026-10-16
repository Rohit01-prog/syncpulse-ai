"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Bot, AlertTriangle, CheckCircle2, Clock, ListTodo, Send, 
  ExternalLink, Sparkles, RefreshCw, Plus, Users, Globe, ShieldCheck, 
  ArrowRight, ArrowLeft, MessageSquare, Zap, Check, Bell, Cpu, 
  Layers, Play, RotateCcw, Activity, HelpCircle, Flame
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
  model_type?: string;
}

export default function SyncPulseApp() {
  // Navigation: 5 Pages/Sections
  const [currentPage, setCurrentPage] = useState<1 | 2 | 3 | 4 | 5>(1);

  // 4 AI Engineers Training Models (As requested by Rohit)
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      task_code: "AI-101",
      title: "BERT Text Classifier Training",
      description: "Dataset tokenization, fine-tuning BERT base model, and validating accuracy metrics.",
      assigned_to_name: "Meera",
      status: "completed",
      priority: "high",
      is_blocked: false,
      model_type: "NLP Classifier",
    },
    {
      id: "2",
      task_code: "AI-102",
      title: "ResNet-50 Computer Vision Model",
      description: "Image augmentation, transfer learning on ResNet-50, and exporting ONNX weights.",
      assigned_to_name: "Sumit",
      status: "completed",
      priority: "high",
      is_blocked: false,
      model_type: "Vision Model",
    },
    {
      id: "3",
      task_code: "AI-103",
      title: "Llama-3 8B Instruction Fine-Tuning",
      description: "LoRA adapter training for domain instruction tasks. Waiting for GPU cluster credentials.",
      assigned_to_name: "Kabir",
      status: "blocked",
      priority: "urgent",
      is_blocked: true,
      blocker_reason: "Waiting for GPU Cluster API Key & Model Weights from Meera",
      blocked_by_member_name: "Meera",
      model_type: "LLM Fine-Tuning",
    },
    {
      id: "4",
      task_code: "AI-104",
      title: "Whisper Audio Speech-to-Text Model",
      description: "Audio pipeline preprocessing and inference speed benchmark.",
      assigned_to_name: "Jaswant",
      status: "in_progress",
      priority: "medium",
      is_blocked: false,
      model_type: "Audio AI",
    },
  ]);

  // Animated Flow Simulation State (Page 4)
  const [animStep, setAnimStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSimulating, setIsSimulating] = useState(false);

  // Auto-advance animation stepper if simulating
  useEffect(() => {
    if (!isSimulating) return;
    const timer = setTimeout(() => {
      if (animStep < 4) {
        setAnimStep((prev) => (prev + 1) as any);
      } else {
        setIsSimulating(false);
      }
    }, 2800);
    return () => clearTimeout(timer);
  }, [isSimulating, animStep]);

  // Unblock Action (Resolves the blocker)
  const resolveBlocker = () => {
    setTasks((prev) =>
      prev.map((t) =>
        t.task_code === "AI-103"
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
  };

  const resetBlocker = () => {
    setTasks((prev) =>
      prev.map((t) =>
        t.task_code === "AI-103"
          ? {
              ...t,
              status: "blocked",
              is_blocked: true,
              blocker_reason: "Waiting for GPU Cluster API Key & Model Weights from Meera",
              blocked_by_member_name: "Meera",
            }
          : t
      )
    );
  };

  const kabirTask = tasks.find((t) => t.task_code === "AI-103");
  const isKabirBlocked = kabirTask?.is_blocked;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* ======================================================== */}
      {/* TOP BRAND HEADER (Always visible on all pages) */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-50 bg-[#0a0d16]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white space-heading">SyncPulse AI</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AUTONOMOUS COORDINATOR
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Track W-PS-1 · Hackathon Kurukshetra · Powered by Worcflow.ai
              </p>
            </div>
          </div>

          {/* 5 Page Navigation Switcher */}
          <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setCurrentPage(1)}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                currentPage === 1 ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>1. Who & Tasks</span>
            </button>

            <button
              onClick={() => setCurrentPage(2)}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                currentPage === 2 ? "bg-red-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>2. Blocker Radar</span>
              {isKabirBlocked && (
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
              )}
            </button>

            <button
              onClick={() => setCurrentPage(3)}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                currentPage === 3 ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>3. AI Team Story</span>
            </button>

            <button
              onClick={() => setCurrentPage(4)}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                currentPage === 4 ? "bg-cyan-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>4. Animated Flow</span>
            </button>

            <button
              onClick={() => setCurrentPage(5)}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                currentPage === 5 ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>5. Solution Impact</span>
            </button>
          </nav>

          {/* Quick Telegram Bridge Pill */}
          <a
            href="https://t.me/syncpulse_solver_bot"
            target="_blank"
            rel="noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>@syncpulse_solver_bot</span>
          </a>

        </div>
      </header>

      {/* ======================================================== */}
      {/* MAIN DYNAMIC CONTENT CONTAINER */}
      {/* ======================================================== */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 flex flex-col justify-between">
        
        {/* ======================================================== */}
        {/* PAGE 1: WHO IS DOING WHAT (Clean Tasks & Team Grid) */}
        {/* ======================================================== */}
        {currentPage === 1 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Page Header */}
            <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Page 1 · Live Overview</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                  Who Is Doing What Task?
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Clean assignment board showing each team member, their assigned AI milestone, and current progress.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  Total Milestones: <strong className="text-white">4</strong>
                </span>
                <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800/40 text-emerald-400">
                  Completed: <strong>{tasks.filter((t) => t.status === "completed").length}</strong>
                </span>
              </div>
            </div>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map((task) => {
                const isBlocked = task.is_blocked;
                const isDone = task.status === "completed";

                return (
                  <div
                    key={task.id}
                    className={`p-5 rounded-2xl border transition-all duration-300 ${
                      isBlocked
                        ? "bg-red-950/25 border-red-500/50 shadow-xl shadow-red-950/30"
                        : isDone
                        ? "bg-slate-900/60 border-emerald-500/30 shadow-md"
                        : "bg-slate-900/60 border-slate-800"
                    }`}
                  >
                    {/* Top Row: Code & Status */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                          {task.task_code}
                        </span>
                        <span className="text-xs text-indigo-400 font-semibold">{task.model_type}</span>
                      </div>

                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isBlocked
                            ? "bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse"
                            : isDone
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                        }`}
                      >
                        {isBlocked ? "🚨 BLOCKED" : isDone ? "✓ COMPLETED" : "⚡ IN PROGRESS"}
                      </span>
                    </div>

                    {/* Task Title & Desc */}
                    <h3 className="text-base font-bold text-white mb-1.5">{task.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{task.description}</p>

                    {/* Blocker Alert Line if blocked */}
                    {isBlocked && (
                      <div className="mb-4 p-2.5 rounded-xl bg-red-950/60 border border-red-800/40 text-xs text-red-300 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Stuck on:</strong> {task.blocker_reason}
                        </div>
                      </div>
                    )}

                    {/* Member Assigned */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-[11px]">
                          {task.assigned_to_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-slate-400">Owner:</span>{" "}
                          <strong className="text-white">{task.assigned_to_name}</strong>
                        </div>
                      </div>

                      <span className="text-slate-500 text-[11px]">Priority: {task.priority.toUpperCase()}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Callout */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Notice how <strong>AI-103 (Kabir)</strong> is flagged as BLOCKED. Want to see why?</span>
              <button
                onClick={() => setCurrentPage(2)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center gap-2"
              >
                <span>View Blocker Radar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PAGE 2: WHO IS STUCK, WHERE, AND WHY (Blocker Radar) */}
        {/* ======================================================== */}
        {currentPage === 2 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Page Header */}
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Page 2 · Critical Bottlenecks</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                Blocker Radar: Who Is Stuck & Why?
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Instant diagnostic showing the exact team member who is blocked, their bottleneck reason, and the blocking dependency.
              </p>
            </div>

            {isKabirBlocked ? (
              /* ACTIVE BLOCKER SPOTLIGHT */
              <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-red-950/40 via-red-900/20 to-slate-950 border border-red-500/60 shadow-2xl shadow-red-950/50 space-y-6">
                
                {/* Header Badge */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                      <AlertTriangle className="w-6 h-6 animate-bounce" />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-red-400">TASK-103 IN JEOPARDY</span>
                      <h3 className="text-xl font-extrabold text-white">Kabir Is Currently Blocked</h3>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold">
                    🚨 CRITICAL BOTTLENECK
                  </span>
                </div>

                {/* 3 Questions Answered Cleanly */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Who */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <div className="text-xs text-slate-400 font-medium">1. WHO IS STUCK?</div>
                    <div className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">KB</span>
                      Kabir (AI Engineer)
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Assigned to Llama-3 Fine-Tuning</p>
                  </div>

                  {/* Where */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <div className="text-xs text-slate-400 font-medium">2. WHERE IS HE STUCK?</div>
                    <div className="text-lg font-bold text-red-300 mt-1">GPU Compute Cluster</div>
                    <p className="text-xs text-slate-400 mt-1">Cannot launch training job without access</p>
                  </div>

                  {/* Why & On Whom */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <div className="text-xs text-slate-400 font-medium">3. WAITING ON WHOM?</div>
                    <div className="text-lg font-bold text-amber-400 mt-1 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-black text-xs font-bold flex items-center justify-center">MR</span>
                      Meera (Frontend & API Lead)
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Holds the test credentials & API keys</p>
                  </div>
                </div>

                {/* Autonomous Action Banner */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Bot className="w-5 h-5 text-cyan-400 shrink-0" />
                    <p className="text-xs text-slate-300">
                      <strong>Autonomous Action Taken:</strong> SyncPulse AI detected this dependency from Kabir&apos;s natural chat and automatically dispatched a targeted nudge to <strong>Meera</strong>.
                    </p>
                  </div>

                  <button
                    onClick={resolveBlocker}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-900/40 shrink-0"
                  >
                    <Check className="w-4 h-4" />
                    <span>Meera Shares Keys (Unblock)</span>
                  </button>
                </div>

              </div>
            ) : (
              /* RESOLVED SUCCESS STATE */
              <div className="p-8 rounded-3xl bg-emerald-950/20 border border-emerald-500/40 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">All Blockers Have Been Resolved!</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Meera shared the required credentials. Kabir was unblocked and Llama-3 fine-tuning completed successfully!
                </p>
                <button
                  onClick={resetBlocker}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Reset Blocker (For Testing)
                </button>
              </div>
            )}

            {/* Navigation Row */}
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setCurrentPage(1)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Tasks</span>
              </button>

              <button
                onClick={() => setCurrentPage(3)}
                className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 flex items-center gap-1.5"
              >
                <span>3. See 4-Person AI Story</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PAGE 3: 4 ENGINEERS TRAINING AI MODELS STORY */}
        {/* ======================================================== */}
        {currentPage === 3 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Page Header */}
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Page 3 · Presentation Story</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                The Scenario: 4 Engineers Training AI Models
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                In this project, Meera, Sumit, Kabir, and Jaswant must train 4 AI models sequentially (बारी-बारी).
              </p>
            </div>

            {/* 4 People Stage Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Person 1: Meera */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/30 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                    1
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">DONE</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Meera</h4>
                  <p className="text-xs text-indigo-400 font-medium">BERT Text Model</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Trained the NLP dataset and pushed weights. Finished on schedule.
                </p>
              </div>

              {/* Person 2: Sumit */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/30 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                    2
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">DONE</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Sumit</h4>
                  <p className="text-xs text-indigo-400 font-medium">ResNet Vision Model</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Exported vision feature embeddings and completed testing.
                </p>
              </div>

              {/* Person 3: Kabir */}
              <div className={`p-4 rounded-2xl border space-y-3 relative ${
                isKabirBlocked 
                  ? "bg-red-950/30 border-red-500/60 shadow-lg shadow-red-950/40" 
                  : "bg-slate-900/60 border-emerald-500/30"
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`w-8 h-8 rounded-full text-white font-bold flex items-center justify-center text-xs ${
                    isKabirBlocked ? "bg-red-600" : "bg-emerald-600"
                  }`}>
                    3
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isKabirBlocked ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"
                  }`}>
                    {isKabirBlocked ? "BLOCKED" : "DONE"}
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Kabir</h4>
                  <p className="text-xs text-indigo-400 font-medium">Llama-3 Fine-Tuning</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isKabirBlocked 
                    ? "ATKA HUA HAI: Needs GPU cluster credentials from Meera to start!"
                    : "Received credentials and finished LoRA fine-tuning!"}
                </p>
              </div>

              {/* Person 4: Jaswant */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-xs">
                    4
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">WORKING</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Jaswant</h4>
                  <p className="text-xs text-indigo-400 font-medium">Whisper Audio AI</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Preprocessing audio samples. Next in line after Kabir finishes.
                </p>
              </div>
            </div>

            {/* Simple English Explanation Box */}
            <div className="p-5 rounded-2xl bg-indigo-950/25 border border-indigo-500/30 space-y-2">
              <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                The Core Problem In Easy English:
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                3 members (Meera, Sumit, Jaswant) are ready or working. But the entire project pipeline is 
                <strong> frozen</strong> because Kabir cannot train Model #3 without credentials from Meera. 
                Instead of waiting 8 hours for a standup meeting, <strong>SyncPulse AI unblocks him automatically in 45 seconds!</strong>
              </p>
            </div>

            {/* Navigation Row */}
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setCurrentPage(2)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Blocker Radar</span>
              </button>

              <button
                onClick={() => {
                  setCurrentPage(4);
                  setAnimStep(1);
                  setIsSimulating(true);
                }}
                className="px-5 py-2 rounded-lg bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500 flex items-center gap-1.5 shadow-lg shadow-cyan-900/30"
              >
                <span>4. Watch Animated AI Flow</span>
                <Play className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PAGE 4: ANIMATED AUTONOMOUS AI FLOW (Step-by-step Visual) */}
        {/* ======================================================== */}
        {currentPage === 4 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Page Header */}
            <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Page 4 · Visual Simulation</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                  How SyncPulse AI Works (Animated Flow)
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Step-by-step visual animation demonstrating proactive inquiry, natural NLP, and autonomous nudge.
                </p>
              </div>

              <button
                onClick={() => {
                  setAnimStep(1);
                  setIsSimulating(true);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 self-start"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Animation</span>
              </button>
            </div>

            {/* Stepper Tabs */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {[
                { s: 1, title: "1. Autonomous Follow-up" },
                { s: 2, title: "2. Participant Reply" },
                { s: 3, title: "3. Agent Reasoning" },
                { s: 4, title: "4. Autonomous Escalation" },
              ].map((step) => (
                <div
                  key={step.s}
                  onClick={() => setAnimStep(step.s as any)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition ${
                    animStep === step.s
                      ? "bg-cyan-950/50 border-cyan-500 text-cyan-300 font-bold"
                      : "bg-slate-900/50 border-slate-800 text-slate-500"
                  }`}
                >
                  {step.title}
                </div>
              ))}
            </div>

            {/* Animated Canvas Box */}
            <div className="min-h-[320px] rounded-3xl bg-slate-950/80 border border-slate-800 p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
              
              {/* STEP 1: AI Messages Kabir */}
              {animStep === 1 && (
                <div className="space-y-4 max-w-lg animate-fadeIn">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center border border-blue-500/40 shadow-lg shadow-blue-900/30">
                    <Bot className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-blue-400 font-bold">STEP 1: PROACTIVE IN-APP CHECK-IN</span>
                    <h3 className="text-xl font-bold text-white mt-1">AI Coordinator Contacts Kabir</h3>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-900/50 text-xs text-blue-200 text-left">
                    💬 <strong>SyncPulse AI:</strong> &quot;Hey Kabir! Quick check-in on <strong>[AI-103] Llama-3 Fine-Tuning</strong>. How is progress coming along? Any blockers?&quot;
                  </div>
                </div>
              )}

              {/* STEP 2: Kabir Replies */}
              {animStep === 2 && (
                <div className="space-y-4 max-w-lg animate-fadeIn">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/40 shadow-lg shadow-amber-900/30">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-amber-400 font-bold">STEP 2: NATURAL HUMAN RESPONSE</span>
                    <h3 className="text-xl font-bold text-white mt-1">Kabir Reports Status in Plain Words</h3>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-900/50 text-xs text-amber-200 text-left">
                    👤 <strong>Kabir:</strong> &quot;I have configured the LoRA scripts, but I am waiting for test credentials from Meera to access the cluster.&quot;
                  </div>
                </div>
              )}

              {/* STEP 3: Mistral Reasoning */}
              {animStep === 3 && (
                <div className="space-y-4 max-w-lg animate-fadeIn">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center border border-indigo-500/40 shadow-lg shadow-indigo-900/30">
                    <Sparkles className="w-8 h-8 animate-spin" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-indigo-400 font-bold">STEP 3: MISTRAL AI AGENT BRAIN</span>
                    <h3 className="text-xl font-bold text-white mt-1">Semantic NLP Blocker Extraction</h3>
                  </div>
                  <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-900/50 text-xs text-indigo-200 text-left font-mono space-y-1">
                    <div>• <strong>Status Inferred:</strong> <span className="text-red-400 font-bold">BLOCKED</span></div>
                    <div>• <strong>Blocker Reason:</strong> &quot;Waiting for test credentials&quot;</div>
                    <div>• <strong>Blocking Dependency:</strong> <span className="text-amber-300 font-bold">Meera</span></div>
                    <div>• <strong>Dashboard Action:</strong> Mark AI-103 as RED in Supabase</div>
                  </div>
                </div>
              )}

              {/* STEP 4: Auto Nudge to Meera */}
              {animStep === 4 && (
                <div className="space-y-4 max-w-lg animate-fadeIn">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 mx-auto flex items-center justify-center border border-red-500/40 shadow-lg shadow-red-950/40">
                    <Zap className="w-8 h-8 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-red-400 font-bold">STEP 4: AUTONOMOUS ESCALATION</span>
                    <h3 className="text-xl font-bold text-white mt-1">AI Directly Nudges Meera to Unblock!</h3>
                  </div>
                  <div className="p-4 rounded-2xl bg-red-950/40 border border-red-900/50 text-xs text-red-200 text-left">
                    ⚡ <strong>Autonomous Alert to Meera:</strong> &quot;🚨 Hey Meera! Kabir is waiting on cluster credentials to finish Llama-3 fine-tuning. Could you please share them to keep the project moving?&quot;
                  </div>
                </div>
              )}

            </div>

            {/* Navigation Row */}
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setCurrentPage(3)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Story</span>
              </button>

              <button
                onClick={() => setCurrentPage(5)}
                className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 flex items-center gap-1.5 shadow-lg shadow-emerald-900/30"
              >
                <span>5. See Solution & Impact</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PAGE 5: FINAL SOLUTION & BUSINESS IMPACT */}
        {/* ======================================================== */}
        {currentPage === 5 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Page Header */}
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Page 5 · Final Impact</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                How Was The Problem Solved?
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Comparing standard traditional project delays versus SyncPulse AI&apos;s autonomous resolution.
              </p>
            </div>

            {/* Comparison Cards: Before vs After */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Traditional Way */}
              <div className="p-6 rounded-3xl bg-slate-900/40 border border-red-900/40 space-y-4">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-red-950 flex items-center justify-center text-xs">✕</span>
                  <span>Without SyncPulse (Traditional Way)</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span>Kabir stays blocked for <strong>8+ hours</strong> without anyone noticing.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span>Meera assumes Kabir is already building and doesn&apos;t check.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span>The blocker is only discovered at the next day&apos;s standup meeting.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span><strong>Project misses deadline</strong> and fails submission.</span>
                  </li>
                </ul>
              </div>

              {/* SyncPulse Autonomous Way */}
              <div className="p-6 rounded-3xl bg-emerald-950/20 border border-emerald-500/40 space-y-4 shadow-xl shadow-emerald-950/20">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-900 flex items-center justify-center text-xs">✓</span>
                  <span>With SyncPulse AI (Our Solution)</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>AI proactively checks in on Kabir within scheduled sprint cycle.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>Blocker and Meera dependency extracted in <strong>under 1 second</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>Meera is autonomously nudged via Web App and Telegram immediately.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>Blocker resolved in <strong>45 seconds</strong>. Project ships on time!</span>
                  </li>
                </ul>
              </div>

            </div>

            {/* Impact Metric Strip */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="text-2xl font-black text-indigo-400">95%</div>
                <div className="text-xs text-slate-400 mt-1">Faster Blocker Resolution</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="text-2xl font-black text-cyan-400">0</div>
                <div className="text-xs text-slate-400 mt-1">Wasted Standup Hours</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="text-2xl font-black text-emerald-400">100%</div>
                <div className="text-xs text-slate-400 mt-1">On-Time Project Delivery</div>
              </div>
            </div>

            {/* Return to Start */}
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setCurrentPage(4)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Animation</span>
              </button>

              <button
                onClick={() => setCurrentPage(1)}
                className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 flex items-center gap-1.5"
              >
                <span>Restart Presentation (Page 1)</span>
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ======================================================== */}
      {/* PERSISTENT FOOTER */}
      {/* ======================================================== */}
      <footer className="border-t border-slate-800/80 bg-[#080b12] px-6 py-3 text-center text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-2">
        <div>
          SyncPulse AI · Autonomous Group Project Coordinator · Track W-PS-1
        </div>
        <div className="flex items-center gap-3">
          <span>Dr. D.Y. Patil Institute, Pune</span>
          <span>•</span>
          <span className="text-indigo-400">Sponsored by Worcflow.ai</span>
        </div>
      </footer>

    </div>
  );
}
