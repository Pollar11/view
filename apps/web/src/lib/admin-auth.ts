import { cookies } from "next/headers";

export const ADMIN_COOKIE = "view_admin";

export function adminConfigured(): boolean {
  return !!process.env.ADMIN_TOKEN && process.env.ADMIN_TOKEN.length >= 8;
}

export async function isAdmin(): Promise<boolean> {
  if (!adminConfigured()) return false;
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value === process.env.ADMIN_TOKEN;
}
