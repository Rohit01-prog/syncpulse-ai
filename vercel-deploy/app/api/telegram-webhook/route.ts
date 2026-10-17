import { NextRequest, NextResponse } from "next/server";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8936095048:AAHGBEacdNgFe-xCLPc42JPH6oymu9z9cmo";

declare global {
  var _sp_users: Map<string, any> | undefined;
  var _sp_events: any[] | undefined;
  var _sp_pending: Map<string, any> | undefined;
}

if (!global._sp_users) global._sp_users = new Map();
if (!global._sp_events) global._sp_events = [];
if (!global._sp_pending) global._sp_pending = new Map();

const users = global._sp_users!;
const events = global._sp_events!;
const pending = global._sp_pending!;

function addEvent(type: string, actor: string, msg: string) {
  events.unshift({
    id: Date.now().toString(),
    type,
    actor,
    message: msg,
    timestamp: new Date().toLocaleTimeString("en-US", { hour12: false })
  });
  if (events.length > 40) events.pop();
}

export async function GET() {
  return NextResponse.json({ ok: true, users: Array.from(users.values()), events });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const msg = body.message;
    if (!msg || !msg.text) return NextResponse.json({ ok: true });

    const chatId = String(msg.chat.id);
    const name = msg.from?.first_name || "Engineer";
    const username = msg.from?.username ? `@${msg.from.username}` : name;
    const text = msg.text.trim();
    const lower = text.toLowerCase();

    // Register real user
    let user = users.get(chatId);
    if (!user) {
      user = { chatId, name, username, isBlocked: false, blockerReason: "" };
      users.set(chatId, user);
      addEvent("connect", name, `Real Node Connected: ${name} (${username}) [ChatID: ${chatId}]`);
    }

    // Command: /start
    if (text.startsWith("/start")) {
      const welcome = `🔒 *SyncPulse AI · Autonomous Coordinator*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `✅ *AUTHENTICATED REAL NODE CONNECTED*\n` +
        `👤 *Name:* ${name}\n` +
        `🏷️ *Telegram Handle:* ${username}\n` +
        `🆔 *Chat ID:* \`${chatId}\`\n\n` +
        `⚡ Chat with me naturally! If you are blocked on anyone, say:\n` +
        `👉 *"Waiting for [teammate] to send [item]"*.\n` +
        `I will autonomously notify their phone and unblock you!`;
      await sendTelegram(chatId, welcome);
      return NextResponse.json({ ok: true });
    }

    // Check if replying to pending blocker
    const pendingReq = pending.get(chatId);
    if (pendingReq) {
      pending.delete(chatId);
      const reqUser = users.get(pendingReq.fromChatId);
      if (reqUser) {
        reqUser.isBlocked = false;
        reqUser.blockerReason = "";
      }
      await sendTelegram(pendingReq.fromChatId, `⚡ *TASK UNBLOCKED!* 🚀\n\n👤 *${name}* (${username}) replied:\n💬 "${text}"\n\n✅ Your dependency has been cleared and logged to the dashboard!`);
      await sendTelegram(chatId, `✅ Thank you ${name}! Response dispatched to ${pendingReq.fromName} and unblocked!`);
      addEvent("unblock", name, `Unblocked ${pendingReq.fromName}: "${text}"`);
      return NextResponse.json({ ok: true });
    }

    // Check if reporting a blocker
    const isBlock = lower.includes("wait") || lower.includes("block") || lower.includes("stuck") || lower.includes("ruka") || lower.includes("atke") || lower.includes("intezaar") || lower.includes("need");
    if (isBlock) {
      user.isBlocked = true;
      user.blockerReason = text;

      let target: any = null;
      for (const [cId, u] of users.entries()) {
        if (cId !== chatId) { target = u; break; }
      }

      if (target) {
        pending.set(target.chatId, { fromChatId: chatId, fromName: name, reason: text });
        await sendTelegram(target.chatId, `🚨 *SYNCPULSE URGENT ESCALATION!*\n\n👤 *${name}* is BLOCKED waiting on you:\n⚠️ "${text}"\n\n👇 Please reply directly to this bot message with the update/key to unblock them!`);
        await sendTelegram(chatId, `🛑 *BLOCKER LOGGED & ESCALATED!* 🚨\n\nDispatched direct priority alert to *${target.name}* (${target.username})'s Telegram!\n\nAs soon as they reply, your task will be
