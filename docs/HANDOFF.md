# PayVault: Session Handoff

Last updated: 2026-09-29. Branch: `claude/hopeful-volta-m5q6kl` (repo `olabisi-9ja/Pulse`, to be renamed `PayVault` by the owner on GitHub).

## Product decisions (agreed with owner)
- **Positioning:** B2B "Payment infrastructure for unreliable networks". Headline "No signal. Still paid." / FR "Pas de réseau. Payé quand même." Not a bank; partners hold licences and funds. The web app is the reference / white-label wallet, not a consumer brand.
- **Two layers:**
  1. Reliability: connectivity state machine (ONLINE → DEGRADED → OFFLINE → RECONNECTING → RECONCILING → SETTLED), queue, retry, reconciliation.
  2. Guaranteed offline acceptance: pre-funded offline vault ("allowance") plus an **offline overdraft / pay-later** credit line.
- **Honesty rule:** never claim double-spend is impossible. It is bounded (limits), detected (hash-chain forks) and recovered (risk pool + KYC'd holder).
- **Scope:** pan-African. Country rules live in data (`packages/countries`, 15 packs, all "concept", illustrative limits).
- **Languages:** English + French. Web app first (PWA). Deploy on Vercel. Sign-in: email OTP now, phone OTP later.
- **Model use:** the owner wants Opus for big decisions and smaller models as subagents for smaller work.
- **Logo:** vector recreation at `public/brand/payvault-mark.svg` and `components/brand/Logo.tsx`. Colours: green `#046B4F`, navy `#14365A`.

## Architecture
- **Stack:** Next.js 16 app at the repo root, pnpm workspace with packages in `packages/*`, Tailwind v4 (tokens in `app/globals.css`), TypeScript. The middleware file is `proxy.ts` (Next 16 name): locale redirect + Supabase session refresh.
- `packages/protocol`: ECDSA P-256 over WebCrypto, fixed binary codec.
  - Sizes: allowance body 82 B + 64 B sig; payment body 64 B + sig; bundle 276 B.
  - QR: base45 with "PV" prefix.
  - Wallet: `signPayment`, `signClose`. Merchant: `verifyBundle`. Server: `analyzeAllowance`.
  - Allowance = funded + credit.
- `packages/countries`: country packs, zod schema, `formatMinor` / `toMinor`.
- `lib/server/*`: postgres.js (`DATABASE_URL`), Postgres schema `pv` (`supabase/migrations/0001_init.sql`, `0002_contact.sql`, applied by `node scripts/migrate.mjs`).
  - `ledger.ts`: double-entry ledger.
  - `allowances.ts`: issue, close statement, expiry sweep, revoke.
  - `settlement.ts`: ingest bundles. Allocation order: funded → overdraft → holder wallet → risk pool. Also runs fork/chain detection.
  - `credit.ts`: scoring (`policy.ts`), loans, fees, repay.
  - `issuer.ts`: partner signing keys, sealed with `PV_MASTER_KEY` via `keybox.ts`.
  - `auth.ts`: Supabase auth, plus a dev-only email sign-in when Supabase is not configured.
  - `apikeys.ts`, `events.ts` (webhook outbox with HMAC), `snapshot.ts`.
- **API routes:**
  - `app/api/app/*`: wallet app API.
  - `app/api/v1/*`: partner API, API-key auth.
  - `app/api/network`, `app/api/cron` (needs `CRON_SECRET`), `app/api/auth/*`, `app/api/contact`.
- **Wallet PWA:**
  - Routes: `app/[locale]/app` and `app/[locale]/sign-in`.
  - Components: `components/wallet/*`.
  - Client libs: `lib/client/*`.
    - `kv.ts`: IndexedDB store.
    - `security.ts`: non-extractable device key + PBKDF2 PIN.
    - `offline.ts`: vault, outbox, merchant accept.
    - `store.ts`: zustand store, connectivity state machine, sync with retry.
  - `public/sw.js` and `app/manifest.ts`.
- **Marketing site:** `app/[locale]/(site)/*`, `components/site`, `messages/site`. Done.
- **Partner console:** `app/[locale]/console/*`, `lib/console`, `app/api/console`, `components/console`, `messages/console`. Written by a subagent that was interrupted; **not reviewed, may be incomplete**.
- **Developer docs:** `app/[locale]/docs/*`, `components/docs`, `messages/docs`. Written by a subagent that was interrupted; **not reviewed, may be incomplete**. `docs/PROTOCOL.md` may be missing.

## Status
- **Tests:** `pnpm test` runs 47 tests (protocol, countries, and server flows against Postgres when `DATABASE_URL` is set). All passed at last run.
- **Typecheck:** `pnpm tsc --noEmit` was clean at the handoff commit.
- **Wallet PWA:** code complete but **never run in a browser**. Not yet checked: `next build`, lint, screenshots, and a two-device offline test.

## Session 2 (2026-09-29, Windows machine)
- Done: steps 1 and 2 below. Lint, typecheck and `next build` all pass. 49/49 tests pass against Postgres.
- On a fresh clone, run `pnpm next typegen` before `pnpm tsc`: the `PageProps` / `LayoutProps` / `RouteContext` globals are generated.
- Console reviewed: every mutation checks the partner role and every query is scoped by `partner_id`. Webhook URLs now reject private, loopback and link-local hosts, and delivery doesn't follow redirects.
- Docs: added the missing Security page. The site developers page samples now match the real API. Removed overclaims from the site's security copy (CBOR, "audited libraries", attestation and biometric described as current). Partner issuance now returns 400 `unsupported_country` / `over_limit` instead of 500.
- Local Postgres on Windows: the `embedded-postgres` npm package, kept outside the repo, on port 54329.
- Full QA walkthrough passed in the browser, with two "phones" (`localhost` and `127.0.0.1`; `allowedDevOrigins` covers the second): sign-in → onboarding → PIN → top-up → KYC → vault with overdraft → cash out → offline pay (request and payment codes passed via the scanner's paste fallback) → sync from both sides settles once → loan → repay, after which the credit limit rose.
- Wallet redesign: follows the owner's inspiration (a tracking-app layout) in the brand colours (navy #14365A surfaces, green #046B4F actions), with a wallet-scoped palette in `globals.css` (`.pv-wallet`). Copy trimmed hard. No sync or connectivity UI is shown to users; sync is automatic. Owner feedback: keep text minimal and hide internals.
- PWA: the service worker precaches both locale shells and every chunk they reference. A production offline launch of `/app` was verified with the server stopped. Not yet tested: installing on a real Android/iOS device.

## Next steps
1. ~~Run `pnpm lint` and `pnpm build`; fix any errors.~~ Done.
2. ~~Review and finish the console and docs work.~~ Done.
3. Run the app locally and QA it with screenshots:
   - Start Postgres (see below), then `DATABASE_URL=... pnpm dev`.
   - Dev sign-in works when no Supabase env vars are set.
   - Test the full flow: top-up → KYC → load vault with overdraft → pay offline between two browser profiles → sync → loan → repay.
4. **Supabase:** creating the `payvault` project (region eu-west-2, org `wgquzrwzeeisrkvgnydu`) failed because of the 2-free-project limit. The owner must pause "Habby Logs" (hibernating, so the API can't pause it) or "safe-db" in the dashboard. Then:
   - create the project;
   - apply the migrations;
   - set Auth to use an email OTP template (`{{ .Token }}`) and custom SMTP for production.
5. **Vercel** (team `olabisi-side-projects`): create a project linked to the repo and set env vars:
   - `DATABASE_URL` (Supabase transaction pooler, port 6543)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `PV_MASTER_KEY` (32 random bytes, base64)
   - `CRON_SECRET`
   - `PV_ADMIN_EMAILS`
   - `NEXT_PUBLIC_SITE_URL`
   
   Also add `vercel.json` with a cron for `/api/cron`.
6. **Later:** reliability SDK / reconciliation API for partners' own online transactions (the "wedge"), Android SDK, phone OTP (Termii / Africa's Talking), KMS for issuer keys, security audit.

## Local Postgres (container-specific)
```
D=/var/lib/pvdata; id postgres || useradd -m postgres; mkdir -p $D && chown postgres $D
su postgres -c "/usr/lib/postgresql/16/bin/initdb -D $D -A trust -U postgres && /usr/lib/postgresql/16/bin/pg_ctl -D $D -l $D/log -o '-p 54329 -k /tmp' start"
psql -h /tmp -p 54329 -U postgres -c "create database payvault"
export DATABASE_URL=postgres://postgres@localhost:54329/payvault && node scripts/migrate.mjs
```
