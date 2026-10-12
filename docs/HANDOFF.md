# PayVault: Session Handoff

Last updated: 2026-10-12. Branch: `claude/hopeful-volta-m5q6kl` (repo `olabisi-9ja/Pulse`, to be renamed `PayVault` by the owner on GitHub).

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

## Deployment (2026-09-29)
- Vercel project `payvault` (id `prj_jWpsBiXPfGvJyRLlaVc9RbJUHSwN`, team `olabisi-side-projects`), linked to this repo. The production branch is `claude/hopeful-volta-m5q6kl`, and every push deploys. Live at https://payvault-phi.vercel.app. `vercel.json` runs `/api/cron` daily at 03:00 UTC (the Hobby limit).
- The site is live. The wallet shows "sign-in not configured" until Supabase and the env vars are set.
- The Vercel connector can't write env vars (403), and the Supabase connector can't create projects (it needs a cost confirmation). The owner does both in the dashboards, then Claude applies the migrations through the Supabase connector.

## Session 3 (2026-10-04 → 10-12)
- **Hackathon track: 3, Smart SME Financing (women-led businesses).** Pitch: a market trader's offline takings become her credit history. Merchant phones accept payments with no signal; each settled sale counts toward her overdraft score (`tradingDays` in `lib/server/policy.ts`, up to 20 of 100 points; sale day = payer's signed time, capped at sync time). Supporting angles: Track 1 (works where data is patchy), Track 7 (PIN-free small payments, large tap targets).
- CashTap (another agent's work): online tap payment wallet → merchant on the ledger, `lib/server/cashafrica.ts`, migration 0004. Not real NFC; the card number is a 9xxx placeholder; sheet text is English only; "CashAfrica" is unverified branding.
- From the offline-payments research (PBoC/e-CNY, Razorpay, ElasticPay): freeze a lost phone from Profile (revokes its vaults, reason `device_lost`, leftover refunded after expiry), holder-chosen lower vault limits, optional pay-without-PIN amount, merchant cap on unsynced value/count (country pack `merchantUnsynced*`, defaults 4× cap / 100).
- Display currency: Profile "Also show amounts in"; `lib/server/rates.ts` (exchangerate-api daily, XOF/XAF via euro peg), cached in the snapshot for offline. Display only.
- Maintenance (`lib/server/maintenance.ts`) runs after app requests at most hourly (`pv.job_runs`, migration 0005); `/api/cron` reuses it.
- `PV_DEMO_AUTH=1`: email-only sign-in on a deployed build without Supabase. Anyone can sign in as any email, so sandbox money only and don't set `PV_ADMIN_EMAILS`.

- **Basic phones (USSD + stall stickers):** `POST /api/ussd` is the Africa's Talking USSD callback (menu: balance, pay a trader by 8-digit code + USSD PIN, takings, trader code; EN/FR from the user's locale). Set the callback URL to `https://<host>/api/ussd?key=<USSD_SECRET>`; without `USSD_SECRET` it only answers in development. Users link a phone and a separate USSD PIN in Profile (`pv.users.phone`, `ussd_pin_hash`, `merchant_code`, migration 0006). USSD payments reuse `executeTapPayment` (transport `ussd`) and count toward trading days. Merchant sheet shows a stall sticker (QR of `/<locale>/app?pay=<merchantId>&n=<name>`, PNG download, Web NFC write); a customer scanning it pays offline with a locally built request, and the trader gets an SMS when it syncs (`lib/server/notify.ts`). SMS goes through Africa's Talking when `AT_USERNAME`/`AT_API_KEY` are set (`sandbox` for their simulator), otherwise it's logged.
- **USSD security:** a phone is linked only when its owner dials USSD from it and enters the 6-digit code the app shows (15 min, rate-limited; proving the number wins it from any earlier account). USSD PIN: 5 tries per 15 min, and 10 wrong in a row wipes it until re-linked. Known limit: Africa's Talking doesn't sign callbacks or send custom headers, so the only gate on `/api/ussd` is `?key=`; keep it out of logs and add their source-IP allowlist at the edge before real money.
- **Demo data:** Business card on Home for merchants; sandbox button seeds 3 weeks of offline sales from 6 demo customers (`lib/server/demo.ts`, `/api/app/demo/seed`, demo mode only).

## RumptyCloud (live pitch host)
- **URL:** https://payvault.rumptycloud.app (workspace `olabisiorg-01a0f838`, Lagos, zone `olas-closet`, single zone, no failover).
- **App:** deployment `payvault`, Free size (0.5 vCPU, 512 MB, sleeps when idle, ~8 s cold start). Repo `olabisi-9ja/Pulse`, branch `claude/hopeful-volta-m5q6kl`, auto-deploys on push. Built from the root `Dockerfile` (Next standalone, 2 build workers because the builder runs out of memory with more). Port 8080, health check `/api/health`. CVE scan and PR previews off (paid).
- **Container start:** `node scripts/migrate.mjs && node server.js`, so migrations apply on every boot.
- **Database:** `payvault-db`, Postgres 17, Playground (free, 256 MB, 2 GiB), public endpoint off. The app uses the internal URL `pg-15aa1f.db.rumpty.internal`.
- **Env vars (set in the console; the owner enters secrets):** `DATABASE_URL`, `PV_MASTER_KEY` (back it up: losing it orphans issuer keys), `PV_DEMO_AUTH=1`. RumptyCloud also passes env vars as Docker build args. `NEXT_PUBLIC_SITE_URL` defaults to the Rumpty URL in the Dockerfile.
- **No email, cron or auth service on Rumpty:** that's why maintenance runs in-app and sign-in is demo mode. Supabase settings are read at runtime via `/api/auth/config` if ever added.
- **Vercel** (payvault-phi.vercel.app) still exists and is unaffected by the Dockerfile.
- **Local Postgres on Windows:** `%TEMP%/pvpg/start.mjs` (embedded-postgres, port 54329, user/pass postgres). `.env.local` points at a Docker DB on 5432; `.claude/launch.json` overrides it for the preview server.

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
