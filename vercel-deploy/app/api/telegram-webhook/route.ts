import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8936095048:AAHGBEacdNgFe-xCLPc42JPH6oymu9z9cmo";
const MISTRAL_KEY = process.env.MISTRAL_API_KEY || "mstrl_mrbTsK7iy2Z8TUs9G0tpAoNLhNu8Z2Lk_1Ht6bI";

// Persistent Quick Action Reply Keyboard (Appears directly on user's keyboard)
const MAIN_REPLY_KEYBOARD = {
  keyboard: [
    [{ text: "⚡ Check-in" }, { text: "📋 View Tasks" }],
    [{ text: "📊 Project Status" }, { text: "🚨 Blocker Demo" }],
    [{ text: "✨ Resolve Blocker" }]
  ],
  resize_keyboard: true,
  is_persistent: true
};

// Inline Action Buttons (Clickable buttons under messages)
const ACTION_INLINE_BUTTONS = {
  inline_keyboard: [
    [
      { text: "⚡ Check-in Now", callback_data: "btn_checkin" },
      { text: "📋 View Tasks", callback_data: "btn_tasks" }
    ],
    [
      { text: "📊 Project Status", callback_data: "btn_status" },
      { text: "🚨 Blocker Demo", callback_data: "btn_blocker_demo" }
    ]
  ]
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Handle Inline Button Clicks (Callback Queries)
    const callbackQuery = body.callback_query;
    if (callbackQuery) {
      await handleCallbackQuery(callbackQuery);
      return NextResponse.json({ ok: true });
    }

    // 2. Handle Incoming Messages
    const message = body.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const fromUser = message.from;
    const senderName = fromUser.first_name || "Teammate";
    const username = fromUser.username ? `@${fromUser.username}` : senderName;

    // Command: /start
    if (text.startsWith("/start")) {
      const welcomeText = 
        `👋 *Welcome to SyncPulse AI, ${senderName}!* \n\n` +
        "I am your autonomous *Group Project Coordinator* for Hackathon Kurukshetra.\n" +
        "I proactively follow up on pending tasks, identify blockers using AI, and auto-escalate dependencies!\n\n" +
        "👇 *Tap your identity below to link your account:*";

      const inlineKeyboard = {
        inline_keyboard: [
          [
            { text: "👤 I am Kabir", callback_data: "iam_Kabir" },
            { text: "👤 I am Meera", callback_data: "iam_Meera" },
            { text: "👤 I am Aanya", callback_data: "iam_Aanya" },
          ],
          [{ text: "⚖️ Judge / Guest", callback_data: "iam_Guest" }]
        ]
      };

      await sendTelegramMessage(chatId, welcomeText, inlineKeyboard);
      return NextResponse.json({ ok: true });
    }

    // Command: /tasks or button "📋 View Tasks"
    if (text.startsWith("/tasks") || text === "📋 View Tasks" || text === "📋 Tasks") {
      await sendTasksList(chatId);
      return NextResponse.json({ ok: true });
    }

    // Command: /checkin or button "⚡ Check-in"
    if (text.startsWith("/checkin") || text === "⚡ Check-in" || text === "⚡ Check-in Now") {
      await sendCheckinPrompt(chatId, senderName);
      return NextResponse.json({ ok: true });
    }

    // Command: /status or button "📊 Project Status"
    if (text.startsWith("/status") || text === "📊 Project Status" || text === "📊 Status") {
      await sendProjectStatus(chatId);
      return NextResponse.json({ ok: true });
    }

    // Command: Blocker Demo trigger
    if (text === "🚨 Blocker Demo" || text.toLowerCase().includes("waiting for test credentials")) {
      await processMemberReply(chatId, "The API is connected, but I am waiting for test credentials from Meera.", senderName);
      return NextResponse.json({ ok: true });
    }

    // Command: Resolve Demo trigger
    if (text === "✨ Resolve Blocker" || text.toLowerCase().includes("credentials received")) {
      await processMemberReply(chatId, "Meera shared the credentials! Integration tested and verified.", senderName);
      return NextResponse.json({ ok: true });
    }

    // Natural Language Reply Processing
    await processMemberReply(chatId, text, senderName);
    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("Error in telegram webhook:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

// Handler for Inline Button Clicks
async function handleCallbackQuery(cq: any) {
  const data = cq.data;
  const chatId = cq.message.chat.id;
  const senderName = cq.from.first_name || "Teammate";

  // Identity selection buttons
  if (data.startsWith("iam_")) {
    const memberName = data.replace("iam_", "");
    const username = cq.from.username ? `@${cq.from.username}` : memberName;

    if (memberName !== "Guest") {
      await supabase
        .from("team_members")
        .update({ telegram_chat_id: String(chatId), telegram_username: username })
        .ilike("name", memberName);
    }

    const responseText = 
      `✅ *Identity Linked:* You are now registered as *${memberName}*.\n\n` +
      "👇 *Tap any button below to interact immediately (no typing needed):*";

    await sendTelegramMessage(chatId, responseText, MAIN_REPLY_KEYBOARD);
    return;
  }

  // Action button clicks
  if (data === "btn_checkin") {
    await sendCheckinPrompt(chatId, senderName);
  } else if (data === "btn_tasks") {
    await sendTasksList(chatId);
  } else if (data === "btn_status") {
    await sendProjectStatus(chatId);
  } else if (data === "btn_blocker_demo") {
    await processMemberReply(chatId, "The API is connected, but I am waiting for test credentials from Meera.", senderName);
  } else if (data === "btn_resolve_demo") {
    await processMemberReply(chatId, "Meera shared the credentials! Integration tested and verified.", senderName);
  }
}

// Sends live tasks from Supabase
async function sendTasksList(chatId: string | number) {
  const { data: tasks } = await supabase.from("tasks").select("*").order("created_at", { ascending: true });
  let reply = "📋 *Live Project Task Board:*\n\n";
  
  const taskList = tasks && tasks.length > 0 ? tasks : [
    { task_code: "TASK-101", title: "Finalize Presentation Slides", status: "completed", assigned_to_name: "Aanya", is_blocked: false },
    { task_code: "TASK-102", title: "Connect Payment API & Webhooks", status: "in_progress", assigned_to_name: "Kabir", is_blocked: false },
    { task_code: "TASK-103", title: "Frontend UI Integration", status: "in_progress", assigned_to_name: "Meera", is_blocked: false }
  ];

  for (const t of taskList) {
    const icon = t.is_blocked ? "🛑" : (t.status === "completed" ? "✅" : "⏳");
    const badge = t.is_blocked ? `BLOCKED (${t.blocker_reason || 'Dependency'})` : t.status.toUpperCase();
    reply += `${icon} \`[${t.task_code}]\` *${t.title}*\n   • Owner: *${t.assigned_to_name}* | Status: ${badge}\n\n`;
  }

  await sendTelegramMessage(chatId, reply, ACTION_INLINE_BUTTONS);
}

// Sends check-in inquiry
async function sendCheckinPrompt(chatId: string | number, senderName: string) {
  const prompt = 
    `👋 Hey ${senderName}! Autonomous check-in from SyncPulse AI.\n\n` +
    "How is *[TASK-102] Connect Payment API & Webhooks* progressing?\n\n" +
    "👇 *Tap a response below or reply with your own words:*";

  const checkinQuickButtons = {
    inline_keyboard: [
      [
        { text: "🚨 Blocked on Meera (Credentials)", callback_data: "btn_blocker_demo" }
      ],
      [
        { text: "✅ Milestone Finished / Done", callback_data: "btn_resolve_demo" }
      ]
    ]
  };

  await sendTelegramMessage(chatId, prompt, checkinQuickButtons);
}

// Sends overall project status
async function sendProjectStatus(chatId: string | number) {
  const { data: tasks } = await supabase.from("tasks").select("*");
  const total = tasks?.length || 5;
  const blocked = tasks?.filter(t => t.is_blocked).length || 0;
  const completed = tasks?.filter(t => t.status === "completed").length || 1;
  
  const statusMsg = 
    `📊 *SyncPulse Project Health:*\n\n` +
    `• Total Milestones: *${total}*\n` +
    `• Shipped: *${completed}*\n` +
    `• Active Blockers: *${blocked}*\n` +
    `• Autonomous Loop: *24/7 Cloud on Vercel* 🟢`;
  
  await sendTelegramMessage(chatId, statusMsg, ACTION_INLINE_BUTTONS);
}

// Processes participant replies with AI reasoning and handles autonomous escalation
async function processMemberReply(chatId: string | number, text: string, senderName: string) {
  const analysis = await analyzeReplyWithAI(text, senderName);
  const isBlocked = analysis.is_blocked;
  const newStatus = analysis.status;

  // Update Supabase
  await supabase
    .from("tasks")
    .update({
      status: newStatus,
      is_blocked: isBlocked,
      blocker_reason: analysis.blocker_reason,
      blocked_by_member_name: analysis.blocked_by_member,
      updated_at: new Date().toISOString()
    })
    .eq("task_code", "TASK-102");

  // Insert Activity Log
  await supabase.from("activity_logs").insert({
    actor: senderName,
    event_type: isBlocked ? "blocker_detected" : (newStatus === "completed" ? "status_changed" : "member_reply"),
    message: text,
    ai_interpretation: analysis.summary
  });

  // Autonomous Escalation to Meera
  let nudgeSentTo = null;
  if (isBlocked && analysis.blocked_by_member) {
    try {
      const { data: member } = await supabase
        .from("team_members")
        .select("telegram_chat_id, name")
        .ilike("name", analysis.blocked_by_member)
        .single();

      if (member && member.telegram_chat_id && String(member.telegram_chat_id) !== String(chatId)) {
        const nudgeText = 
          `🚨 *Autonomous Blocker Alert for ${member.name}:*\n\n` +
          `*${senderName}* is currently blocked on *[TASK-102] Connect Payment API* waiting for:\n` +
          `👉 "${analysis.blocker_reason}"\n\n` +
          `Could you please share the required update/credentials to unblock ${senderName}?`;
        
        await sendTelegramMessage(member.telegram_chat_id, nudgeText);
        nudgeSentTo = member.name;
      }
    } catch (nudgeErr) {
      console.error("Autonomous nudge notice:", nudgeErr);
    }
  }

  // Reply back to the user
  let replyMsg = "";
  if (isBlocked) {
    replyMsg = 
      `🛑 *Blocker Detected & Logged in Supabase!*\n\n` +
      `I have updated *[TASK-102] Connect Payment API* to *BLOCKED*.\n` +
      `• *Reason:* ${analysis.blocker_reason}\n`;
    if (analysis.blocked_by_member) {
      replyMsg += `• *Dependency:* ${analysis.blocked_by_member}\n\n`;
      if (nudgeSentTo) {
        replyMsg += `🚀 *Autonomous Escalation Dispatched:* Sent a direct nudge to *${nudgeSentTo}* on Telegram!`;
      } else {
        replyMsg += `🚀 *Escalation Logged:* Escalated to *${analysis.blocked_by_member}* on the live dashboard.`;
      }
    }
  } else if (newStatus === "completed") {
    replyMsg = 
      `🎉 *Awesome progress, ${senderName}!* Milestone *[TASK-102]* marked as *COMPLETED* in the project dashboard!`;
  } else {
    replyMsg = `👍 *Understood, ${senderName}!* Status updated to *In Progress*. Keep pushing forward!`;
  }

  await sendTelegramMessage(chatId, replyMsg, ACTION_INLINE_BUTTONS);
}

// Sends Markdown-formatted messages via Telegram Bot API
async function sendTelegramMessage(chatId: string | number, text: string, replyMarkup?: any) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const payload: any = {
    chat_id: chatId,
    text: text,
    parse_mode: "Markdown"
  };
  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

// AI Reasoning Pipeline (Mistral AI API with high-precision fallback)
async function analyzeReplyWithAI(replyText: string, owner: string) {
  if (MISTRAL_KEY && !MISTRAL_KEY.startsWith("your_")) {
    try {
      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${MISTRAL_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: [
            {
              role: "system",
              content: 
                "You are SyncPulse AI, an autonomous Group Project Coordinator at a tech hackathon.\n" +
                "Analyze the participant's task reply and output ONLY valid JSON matching this schema:\n" +
                "{\n" +
                '  "status": "completed" | "in_progress" | "blocked",\n' +
                '  "is_blocked": boolean,\n' +
                '  "blocker_reason": string or null,\n' +
                '  "blocked_by_member": "Meera" | "Kabir" | "Aanya" | null,\n' +
                '  "summary": string\n' +
                "}"
            },
            {
              role: "user",
              content: `Task: Connect Payment API\nOwner: ${owner}\nParticipant Reply: "${replyText}"`
            }
          ],
          temperature: 0.1,
          response_format: { type: "json_object" }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return {
            status: parsed.status || "in_progress",
            is_blocked: Boolean(parsed.is_blocked),
            blocker_reason: parsed.blocker_reason || "Waiting on dependencies",
            blocked_by_member: parsed.blocked_by_member || null,
            summary: parsed.summary || `${owner} reported an update.`
          };
        }
      }
    } catch (e) {
      console.warn("Mistral API call notice, falling back to heuristics:", e);
    }
  }

  // Fallback Heuristics
  const lower = replyText.toLowerCase();

  if (
    lower.includes("waiting") || 
    lower.includes("blocked") || 
    lower.includes("credentials") || 
    lower.includes("stuck") ||
    lower.includes("delay") ||
    lower.includes("atke") ||
    lower.includes("nahi mila")
  ) {
    let blockedBy = "Meera";
    if (lower.includes("kabir")) blockedBy = "Kabir";
    else if (lower.includes("aanya")) blockedBy = "Aanya";

    let reason = "Waiting for test credentials from Meera";
    if (lower.includes("api")) reason = "Waiting for API endpoint specifications";
    else if (lower.includes("design") || lower.includes("ui")) reason = "Waiting for UI design assets";

    return {
      status: "blocked",
      is_blocked: true,
      blocker_reason: reason,
      blocked_by_member: blockedBy,
      summary: `${owner} is blocked waiting on ${blockedBy} for ${reason}.`
    };
  }

  if (
    lower.includes("done") || 
    lower.includes("completed") || 
    lower.includes("finish") || 
    lower.includes("ready") || 
    lower.includes("ho gya") ||
    lower.includes("shipped") ||
    lower.includes("verified")
  ) {
    return {
      status: "completed",
      is_blocked: false,
      blocker_reason: null,
      blocked_by_member: null,
      summary: `${owner} marked task as completed.`
    };
  }

  return {
    status: "in_progress",
    is_blocked: false,
    blocker_reason: null,
    blocked_by_member: null,
    summary: `${owner} reported active progress.`
  };
}
