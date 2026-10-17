import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8936095048:AAHGBEacdNgFe-xCLPc42JPH6oymu9z9cmo";

// ----------------------------------------------------
// SHARED REALTIME MEMORY STORE (Survives warm serverless)
// ----------------------------------------------------
declare global {
  var _syncpulse_users: Map<string, any> | undefined;
  var _syncpulse_events: any[] | undefined;
  var _syncpulse_pending_blockers: Map<string, any[]> | undefined;
}

if (!global._syncpulse_users) {
  global._syncpulse_users = new Map();
}
if (!global._syncpulse_events) {
  global._syncpulse_events = [];
}
if (!global._syncpulse_pending_blockers) {
  global._syncpulse_pending_blockers = new Map();
}

const usersMap = global._syncpulse_users!;
const eventsList = global._syncpulse_events!;
const pendingBlockers = global._syncpulse_pending_blockers!;

function logLiveEvent(eventType: string, actor: string, message: string, target?: string) {
  const event = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
    type: eventType,
    actor: actor,
    target: target || null,
    message: message,
    timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
  };
  eventsList.unshift(event);
  if (eventsList.length > 50) eventsList.pop();

  // Also push to Supabase if available
  try {
    supabase.from("activity_logs").insert({
      actor: actor,
      event_type: eventType,
      message: message,
      ai_interpretation: target ? `Autonomous escalation to ${target}` : "Live Sprint Telemetry"
    }).then(() => {}).catch(() => {});
  } catch (e) {}
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    users: Array.from(usersMap.values()),
    events: eventsList,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Handle Role Selection Buttons
    if (body.callback_query) {
      await handleCallbackQuery(body.callback_query);
      return NextResponse.json({ ok: true });
    }

    // 2. Handle Incoming Messages
    const message = body.message;
    if (!message || !message.text) return NextResponse.json({ ok: true });

    const from = message.from;
    const chatId = String(message.chat.id);
    const userId = String(from.id);
    const firstName = from.first_name || "Engineer";
    const lastName = from.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();
    const username = from.username ? `@${from.username}` : fullName;
    const text = message.text.trim();
    const lower = text.toLowerCase();

    // Retrieve or Register Real User (Strictly from real Telegram identity)
    let user = usersMap.get(chatId);
    if (!user) {
      user = {
        chatId: chatId,
        userId: userId,
        name: fullName,
        username: username,
        role: "Engineer",
        isBlocked: false,
        blockerReason: null,
        waitingFor: null,
        joinedAt: new Date().toLocaleTimeString(),
      };
      usersMap.set(chatId, user);
      logLiveEvent(
        "user_connected",
        fullName,
        `Node Connected: ${fullName} (${username}) with ChatID ${chatId}`
      );
    } else {
      // Keep name & username fresh
      user.name = fullName;
      user.username = username;
    }

    // Command: /start
    if (text.startsWith("/start")) {
      const welcome = 
        `🔒 *SyncPulse AI · Real-Time Autonomous Coordinator*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `✅ *AUTHENTICATED NODE CONNECTED*\n` +
        `👤 *Real Name:* ${fullName}\n` +
        `🏷️ *Telegram Handle:* ${username}\n` +
        `🆔 *Telegram Chat ID:* \`${chatId}\`\n\n` +
        `⚡ *You are now linked to the live autonomous coordinator network.*\n\n` +
        `👇 *Select your project role below:*`;

      const roleButtons = {
        inline_keyboard: [
          [
            { text: "🛠️ Frontend Lead", callback_data: "role_Frontend Lead" },
            { text: "⚙️ Backend Lead", callback_data: "role_Backend Lead" },
          ],
          [
            { text: "🤖 AI / ML Engineer", callback_data: "role_AI / ML Engineer" },
            { text: "🗄️ Database Engineer", callback_data: "role_Database Engineer" },
          ],
          [
            { text: "👑 Project Lead", callback_data: "role_Project Lead" },
            { text: "⚖️ Judge / Observer", callback_data: "role_Judge / Observer" },
          ]
        ]
      };

      await sendTelegram(chatId, welcome, roleButtons);
      return NextResponse.json({ ok: true });
    }

    // Command: /status or button "Sprint Status"
    if (text.startsWith("/status") || text.includes("Sprint Status") || text.includes("Status")) {
      const activeNodes = Array.from(usersMap.values());
      let nodesSummary = activeNodes.map(u => 
        `• *${u.name}* (${u.role}) — ${u.isBlocked ? `🔴 BLOCKED on ${u.waitingFor || "Dependency"}` : "🟢 Active"}`
      ).join("\n");

      const statusMsg = 
        `📊 *SYNCPULSE LIVE SPRINT TELEMETRY*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👥 *Connected Nodes:* ${activeNodes.length}\n` +
        `🌐 *Dashboard:* syncpulse-ai.vercel.app\n\n` +
        `*ACTIVE TEAM ROSTER:*\n` +
        (nodesSummary || "No nodes connected yet. Have teammates /start the bot!");

      await sendTelegram(chatId, statusMsg);
      return NextResponse.json({ ok: true });
    }

    // ----------------------------------------------------
    // CHECK 1: IS THIS USER ANSWERING A PENDING BLOCKER?
    // ----------------------------------------------------
    const pendingList = pendingBlockers.get(chatId) || [];
    if (pendingList.length > 0) {
      const blockerItem = pendingList.shift()!;
      if (pendingList.length === 0) pendingBlockers.delete(chatId);

      const requesterChatId = blockerItem.requesterChatId;
      const requesterName = blockerItem.requesterName;

      // Update requester state
      const reqUser = usersMap.get(requesterChatId);
      if (reqUser) {
        reqUser.isBlocked = false;
        reqUser.blockerReason = null;
        reqUser.waitingFor = null;
      }

      // 1. Send resolution notification to requester
      const unblockNotice = 
        `⚡ *TASK UNBLOCKED & RESOLVED!* 🚀\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 *${fullName}* (${user.role}) has replied to your blocker:\n\n` +
        `💬 *Message:* "${text}"\n\n` +
        `✅ Your dependency has been cleared! Sprint velocity restored.`;

      await sendTelegram(requesterChatId, unblockNotice);

      // 2. Confirm to current user
      const responderConfirm = 
        `✅ *Response Dispatched to ${requesterName}!*\\n` +
        `They have been notified on their Telegram and their task is marked *UNBLOCKED*. Thank you!`;
      await sendTelegram(chatId, responderConfirm);

      // 3. Log live event
      logLiveEvent(
        "blocker_resolved",
        fullName,
        `Resolved dependency for ${requesterName}: "${text}"`,
        requesterName
      );

      return NextResponse.json({ ok: true });
    }

    // ----------------------------------------------------
    // CHECK 2: IS THIS USER REPORTING A BLOCKER?
    // ----------------------------------------------------
    const isBlocker = 
      lower.includes("wait") || lower.includes("intezaar") || lower.includes("ruka") || 
      lower.includes("atke") || lower.includes("block") || lower.includes("stuck") || 
      lower.includes("chahiye") || lower.includes("need") || lower.includes("pending") ||
      lower.includes("delay") || lower.includes("de do");

    if (isBlocker) {
      // Find which registered user is mentioned in the text
      let targetUser: any = null;
      for (const [tChatId, u] of usersMap.entries()) {
        if (tChatId === chatId) continue; // Don't block on yourself
        const firstNameMatch = u.name.toLowerCase().split(" ")[0];
        const usernameMatch = u.username.toLowerCase().replace("@", "");
        if (
          lower.includes(firstNameMatch) || 
          lower.includes(usernameMatch) ||
          lower.includes(u.role.toLowerCase())
        ) {
          targetUser = u;
          break;
        }
      }

      // If no specific target matched, pick another active user if only 2 people are testing
      if (!targetUser) {
        for (const [tChatId, u] of usersMap.entries()) {
          if (tChatId !== chatId) {
            targetUser = u;
            break;
          }
        }
      }

      if (targetUser) {
        // Mark requester as blocked
        user.isBlocked = true;
        user.blockerReason = text;
        user.waitingFor = targetUser.name;

        // Register pending blocker for target
        const currentPending = pendingBlockers.get(targetUser.chatId) || [];
        currentPending.push({
          requesterChatId: chatId,
          requesterName: fullName,
          reason: text,
        });
        pendingBlockers.set(targetUser.chatId, currentPending);

        // 1. ACTUALLY SEND TELEGRAM ALERT TO TARGET USER'S PHONE!
        const targetAlert = 
          `🚨 *SYNCPULSE AUTONOMOUS ESCALATION ALERT*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `👤 *${fullName}* (${user.role}) is currently *BLOCKED* and waiting on you!\n\n` +
          `⚠️ *Blocker Details:* "${text}"\n\n` +
          `👇 *Action Required:* Please reply directly to this bot message with the required information to unblock them!`;

        await sendTelegram(targetUser.chatId, targetAlert);

        // 2. Notify requester
        const requesterNotice = 
          `🛑 *BLOCKER DETECTED & AUTONOMOUSLY ESCALATED!*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `I have registered that you are waiting for *${targetUser.name}* (${targetUser.role}).\n\n` +
          `📢 *Autonomous Action Executed:*\n` +
          `An urgent escalation alert has been dispatched directly to *${targetUser.name}'s Telegram*!\n\n` +
          `As soon as they reply, your task will be automatically unblocked and updated on the dashboard.`;

        await sendTelegram(chatId, requesterNotice);

        // 3. Log live event
        logLiveEvent(
          "escalation_sent",
          fullName,
          `Blocked on ${targetUser.name}: "${text}". Dispatched nudge to Telegram ChatID ${targetUser.chatId}`,
          targetUser.name
        );

        return NextResponse.json({ ok: true });
      } else {
        // Blocker reported but no other user has connected yet
        user.isBlocked = true;
        user.blockerReason = text;

        const noTargetNotice = 
          `🛑 *BLOCKER LOGGED TO DASHBOARD!*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Reason: "${text}"\n\n` +
          `⚠️ *Note:* No other teammate has connected to the bot yet.\n` +
          `Please have your teammate open @syncpulse_solver_bot and press /start so I can autonomously nudge them!`;

        await sendTelegram(chatId, noTargetNotice);

        logLiveEvent(
          "blocker_detected",
          fullName,
          `Blocker reported: "${text}". Waiting for dependent teammate to connect.`
        );

        return NextResponse.json({ ok: true });
      }
    }

    // ----------------------------------------------------
    // CHECK 3: COMPLETION / PROGRESS UPDATE
    // ----------------------------------------------------
    const isCompleted = 
      lower.includes("done") || lower.includes("complete") || lower.includes("ho gaya") || 
      lower.includes("finished") || lower.includes("ready") || lower.includes("100%");

    if (isCompleted) {
      user.isBlocked = false;
      user.blockerReason = null;
      user.waitingFor = null;

      const compMsg = 
        `✅ *MILESTONE ACHIEVED & LOGGED!* 🚀\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 *${fullName}* (${user.role})\n` +
        `📌 *Update:* "${text}"\n\n` +
        `📈 Recorded on live sprint telemetry at syncpulse-ai.vercel.app!`;

      await sendTelegram(chatId, compMsg);

      logLiveEvent(
        "milestone_completed",
        fullName,
        `Task completed: "${text}"`
      );

      return NextResponse.json({ ok: true });
    }

    // Default conversational update
    const genericMsg = 
      `👍 *Update Logged, ${fullName}!*\\n` +
      `"${text}"\\n\\n` +
      `Recorded in live sprint telemetry.`;
    await sendTelegram(chatId, genericMsg);

    logLiveEvent(
      "chat_update",
      fullName,
      `Update: "${text}"`
    );

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("Error in telegram webhook:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

// Handler for Role Selection Buttons
async function handleCallbackQuery(cq: any) {
  const data = cq.data;
  const chatId = String(cq.message.chat.id);
  const from = cq.from;
  const fullName = `${from.first_name || "Engineer"} ${from.last_name || ""}`.trim();

  if (data.startsWith("role_")) {
    const selectedRole = data.replace("role_", "");
    let user = usersMap.get(chatId);
    if (!user) {
      user = {
        chatId: chatId,
        userId: String(from.id),
        name: fullName,
        username: from.username ? `@${from.username}` : fullName,
        role: selectedRole,
        isBlocked: false,
        joinedAt: new Date().toLocaleTimeString(),
      };
      usersMap.set(chatId, user);
    } else {
      user.role = selectedRole;
    }

    const confirmMsg = 
      `✅ *ROLE CONFIRMED: ${selectedRole}*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Engineer:* ${fullName}\n` +
      `🏷️ *Telegram:* ${user.username}\n\n` +
      `Now simply chat with me! If you are blocked on any teammate, tell me and I will autonomously nudge them!`;

    await sendTelegram(chatId, confirmMsg);

    logLiveEvent(
      "role_assigned",
      fullName,
      `${fullName} assigned role: ${selectedRole}`
    );
  }
}

async function sendTelegram(chatId: string | number, text: string, replyMarkup?: any) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const payload: any = { chat_id: chatId, text, parse_mode: "Markdown" };
  if (replyMarkup) payload.reply_markup = replyMarkup;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.error("Telegram send error:", e);
  }
}
