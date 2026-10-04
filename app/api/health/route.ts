/** Liveness for container hosts' health checks. No auth, no database. */
export function GET() {
  return Response.json({ ok: true });
}
