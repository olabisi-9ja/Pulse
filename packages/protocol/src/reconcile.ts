/**
 * Server-side analysis of every payment seen for one allowance, across all
 * merchants. Payments must already have passed signature checks.
 *
 * Policy: every payment that passed offline checks is honoured to its
 * merchant (the guarantee). Fraud shows up as forks (two payments with the
 * same sequence number), broken chain links, or spending above the cap.
 * Anything spent above the cap is a loss covered by the risk pool and
 * recovered from the allowance holder.
 */
import { toHex } from "./bytes";
import { type AllowanceCert, capOf, type Payment } from "./types";

export type Entry = { id: string; payment: Payment };

export type Fork = { seq: number; ids: string[] };
export type ChainBreak = { seq: number; id: string; reason: "prev_hash" | "cumulative" };

export type AllowanceAnalysis = {
  honoured: Entry[];
  spent: number;
  fundedUsed: number;
  creditUsed: number;
  overspend: number;
  forks: Fork[];
  breaks: ChainBreak[];
  fraud: boolean;
  /** Highest contiguous sequence number received from seq 1. */
  contiguousTo: number;
};

export function analyzeAllowance(cert: AllowanceCert, genesisHex: string, entries: Entry[]): AllowanceAnalysis {
  const unique = new Map<string, Entry>();
  for (const e of entries) unique.set(e.id, e);
  const honoured = [...unique.values()].sort((a, b) => a.payment.seq - b.payment.seq || a.id.localeCompare(b.id));

  const bySeq = new Map<number, Entry[]>();
  for (const e of honoured) bySeq.set(e.payment.seq, [...(bySeq.get(e.payment.seq) ?? []), e]);

  const forks: Fork[] = [];
  for (const [seq, list] of bySeq) if (list.length > 1) forks.push({ seq, ids: list.map((e) => e.id) });

  const breaks: ChainBreak[] = [];
  let contiguousTo = 0;
  for (let seq = 1; bySeq.has(seq); seq++) {
    const list = bySeq.get(seq)!;
    if (list.length === 1) {
      const p = list[0].payment;
      const prev = seq === 1 ? undefined : bySeq.get(seq - 1);
      const expectedPrev = seq === 1 ? genesisHex : prev?.length === 1 ? prev[0].id : undefined;
      const expectedCum = seq === 1 ? 0 : prev?.length === 1 ? prev[0].payment.cumulative : undefined;
      if (expectedPrev !== undefined && toHex(p.prevHash) !== expectedPrev) {
        breaks.push({ seq, id: list[0].id, reason: "prev_hash" });
      } else if (expectedCum !== undefined && p.cumulative !== expectedCum + p.amount) {
        breaks.push({ seq, id: list[0].id, reason: "cumulative" });
      }
    }
    contiguousTo = seq;
  }

  const spent = honoured.reduce((n, e) => n + e.payment.amount, 0);
  const cap = capOf(cert);
  const fundedUsed = Math.min(spent, cert.funded);
  const creditUsed = Math.min(Math.max(0, spent - cert.funded), cert.credit);
  const overspend = Math.max(0, spent - cap);

  return {
    honoured,
    spent,
    fundedUsed,
    creditUsed,
    overspend,
    forks,
    breaks,
    fraud: forks.length > 0 || breaks.length > 0 || overspend > 0,
    contiguousTo,
  };
}
