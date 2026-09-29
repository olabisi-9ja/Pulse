@AGENTS.md

# PayVault

Offline payment infrastructure for Africa (B2B, EN/FR). **Read `docs/HANDOFF.md` first.** It has the agreed product decisions, the architecture, current status and next steps. The original plan is in `docs/PLAN.md`; parts of it are superseded by the handoff.

- The owner prefers very concise replies.
- Develop on branch `claude/hopeful-volta-m5q6kl`. Commit and push work before ending a session.
- Checks: `pnpm test` (set `DATABASE_URL` for server flow tests), `pnpm tsc --noEmit`, `pnpm lint`, `pnpm build`.
- Never claim offline double-spending is impossible: it is bounded, detected and recovered.
