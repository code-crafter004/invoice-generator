/** Local dev: set in .env.local. Production: uses /api/generate (Vercel → Python). */
export function getGenerateUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "/api/generate";
}
