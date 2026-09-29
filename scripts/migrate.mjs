// Applies supabase/migrations/*.sql in order, once each. Usage: DATABASE_URL=... node scripts/migrate.mjs
import { readdir, readFile } from "node:fs/promises";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const sql = postgres(url, { prepare: false, max: 1, onnotice: () => {} });
const dir = new URL("../supabase/migrations/", import.meta.url);

await sql`create table if not exists public.pv_migrations (name text primary key, applied_at timestamptz not null default now())`;
const done = new Set((await sql`select name from public.pv_migrations`).map((r) => r.name));
for (const file of (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort()) {
  if (done.has(file)) continue;
  const body = await readFile(new URL(file, dir), "utf8");
  await sql.begin(async (tx) => {
    await tx.unsafe(body);
    await tx`insert into public.pv_migrations (name) values (${file})`;
  });
  console.log(`applied ${file}`);
}
await sql.end();
