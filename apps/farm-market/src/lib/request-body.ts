/**
 * Reads and JSON-parses a request body while enforcing a hard size cap —
 * Next.js Route Handlers don't apply one on their own, so without this an
 * oversized POST body is an easy, cheap DoS vector against a public API
 * route. Returns null on any failure (too large, not valid JSON, etc.) so
 * callers can respond with a normal validation error.
 */
export async function readBoundedJson(req: Request, maxBytes = 32 * 1024): Promise<unknown> {
  const contentLength = req.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) return null;

  if (!req.body) return req.json().catch(() => null);

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null;
  }

  try {
    const text = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf-8");
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}
