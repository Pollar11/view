import { NextResponse } from "next/server";
import { z } from "zod";
import { getAssistantReply } from "@/lib/assistant";

const bodySchema = z.object({
  message: z.string().trim().min(1).max(500),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      }),
    )
    .max(12)
    .default([]),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ask something under 500 characters." }, { status: 422 });
  }

  const { reply, mode } = await getAssistantReply(parsed.data.message, parsed.data.history);
  return NextResponse.json({ reply, mode });
}
