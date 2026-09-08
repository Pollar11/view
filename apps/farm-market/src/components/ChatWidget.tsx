"use client";

import { useState } from "react";
import { FARM_PHONE } from "@/lib/site";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const GREETING: ChatMessage = {
  role: "assistant",
  content: `Hi! I'm the Meadow & Market farm assistant — an automated bot, not a person. Ask about delivery, pricing, or hours, or call ${FARM_PHONE} for a human.`,
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: nextMessages.slice(-8),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.ok ? data.reply : "Something went wrong — try again or call " + FARM_PHONE + ".",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Network error — call ${FARM_PHONE} for help.` },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl2 border border-line-light bg-surface-light shadow-soft dark:border-line-dark dark:bg-surface-dark dark:shadow-softDark">
          <div className="flex items-center justify-between border-b border-line-light px-4 py-3 dark:border-line-dark">
            <div>
              <div className="text-sm font-semibold">Farm Assistant</div>
              <div className="text-xs text-ink-light/80 dark:text-ink-dark/80">Automated · not a live person</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-xl2 px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-ink-light text-canvas-light dark:bg-ink-dark dark:text-canvas-dark"
                    : "bg-black/5 dark:bg-white/10"
                }`}
              >
                {m.content}
              </div>
            ))}
            {sending && (
              <div className="max-w-[85%] rounded-xl2 bg-black/5 px-3 py-2 text-sm text-ink-light/80 dark:bg-white/10 dark:text-ink-dark/80">
                Thinking…
              </div>
            )}
          </div>

          <form onSubmit={send} className="flex gap-2 border-t border-line-light p-3 dark:border-line-dark">
            <input
              className="input"
              placeholder="Ask about delivery, pricing…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={sending || !input.trim()} className="btn-primary shrink-0 px-4">
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl text-white shadow-soft transition hover:opacity-90 dark:shadow-softDark"
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
