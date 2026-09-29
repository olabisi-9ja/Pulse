import "server-only";
import postgres from "postgres";

export type Sql = postgres.Sql;
export type Tx = postgres.TransactionSql;
/** Either the pool or an open transaction. */
export type Db = Sql | Tx;

const globalForDb = globalThis as { __pvSql?: Sql };

export function db(): Sql {
  if (globalForDb.__pvSql) return globalForDb.__pvSql;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = postgres(url, {
    // Supabase's transaction pooler does not support prepared statements.
    prepare: false,
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
    idle_timeout: 20,
    types: {
      // int8 → number. Amounts are minor units far below 2^53.
      bigint: { to: 20, from: [20], serialize: (x: number) => String(x), parse: (x: string) => Number(x) },
    },
    onnotice: () => {},
  });
  globalForDb.__pvSql = sql;
  return sql;
}

/** postgres.js returns bytea as Buffer; normalise to plain Uint8Array. */
export const bytes = (b: Uint8Array | Buffer): Uint8Array => new Uint8Array(b);
