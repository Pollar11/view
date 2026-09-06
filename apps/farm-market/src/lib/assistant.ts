import { FAQ } from "./faq";
import { CATALOG, CATEGORY_LABELS } from "./products";
import { FARM_ADDRESS_LABEL, FARM_HOURS, FARM_PHONE } from "./site";

const FALLBACK_ANSWER =
  "I'm not sure about that one — call the farm at " +
  FARM_PHONE +
  " or check the FAQ page, and a person can help.";

/** Simple keyword-overlap matcher against the FAQ — used whenever no LLM
 * API key is configured, so the assistant always works, just less flexibly. */
export function ruleBasedAnswer(question: string): string {
  const q = question.toLowerCase();
  let best: { score: number; answer: string } | null = null;

  for (const entry of FAQ) {
    const score = entry.keywords.reduce((sum, kw) => (q.includes(kw) ? sum + 1 : sum), 0);
    if (score > 0 && (!best || score > best.score)) {
      best = { score, answer: entry.answer };
    }
  }

  return best?.answer ?? FALLBACK_ANSWER;
}

export function buildSystemPrompt(): string {
  const catalogLines = CATALOG.map(
    (p) =>
      `- ${p.name} (${CATEGORY_LABELS[p.category]}, ${p.cutType}): ${
        p.unitType === "per_lb" ? `$${p.pricePerLb}/lb` : `$${p.pricePerUnit}/${p.unitNoun}`
      }`,
  ).join("\n");

  const faqLines = FAQ.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");
  const hoursLines = FARM_HOURS.map((h) => `${h.day}: ${h.hours}`).join(", ");

  return `You are the automated customer-support assistant for Meadow & Market, a real farm-to-door storefront selling sheep, goat, beef, chicken, duck, rabbit, and eggs.

Farm address: ${FARM_ADDRESS_LABEL}. Phone: ${FARM_PHONE}. Hours: ${hoursLines}.

Current catalog:
${catalogLines}

Frequently asked questions you can draw on:
${faqLines}

Rules:
- Only answer using the facts above. If you don't know, say so and point the customer to calling ${FARM_PHONE} — never invent a price, policy, or delivery date.
- Be concise — 1-3 sentences.
- You are clearly an automated assistant, not a human; don't pretend otherwise.
- Never claim a payment method actually charges money — card/Apple Pay/PayPal at checkout are demo-only in this build; "pay on delivery" is the only real one.`;
}

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Answers via a real LLM (Claude) when ANTHROPIC_API_KEY is configured —
 * grounded in the exact farm facts in buildSystemPrompt(), same mock/live
 * pattern as SMS. Without a key, falls back to the keyword-based FAQ
 * matcher so the assistant still works, just less flexibly, and is honest
 * about which mode is answering.
 */
export async function getAssistantReply(
  message: string,
  history: AssistantMessage[],
): Promise<{ reply: string; mode: "llm" | "fallback" }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { reply: ruleBasedAnswer(message), mode: "fallback" };
  }

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic();

    const response = await client.messages.create({
      model: process.env.ASSISTANT_MODEL || "claude-opus-5",
      max_tokens: 400,
      system: buildSystemPrompt(),
      messages: [
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: message },
      ],
    });

    const text = response.content.find((b) => b.type === "text");
    if (!text || text.type !== "text" || !text.text.trim()) {
      return { reply: ruleBasedAnswer(message), mode: "fallback" };
    }
    return { reply: text.text.trim(), mode: "llm" };
  } catch {
    return { reply: ruleBasedAnswer(message), mode: "fallback" };
  }
}
