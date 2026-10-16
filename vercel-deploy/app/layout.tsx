import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SyncPulse AI | Autonomous Group Project Coordinator",
  description: "Autonomous Agentic Group Project Coordinator with real-time Telegram follow-ups and blocker escalation. Built for Hackathon Kurukshetra.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
