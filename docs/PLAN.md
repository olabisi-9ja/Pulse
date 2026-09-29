# PayVault: Build Plan

> Offline payment infrastructure for Africa, delivered as a service.
> Status: **concept / prototype**. All limits, fees and country data in this repo are illustrative until validated with partners and regulators.

---

## 1. Positioning

### 1.1 What PayVault is
PayVault is **not a bank or wallet**. It is the infrastructure layer that lets *existing* licensed players (banks, mobile money operators, fintechs, PSPs, aid agencies) accept and make payments **when there is no network**, with settlement once connectivity returns.

Analogy: Stripe/Flutterwave for the online world. PayVault covers offline.

| PayVault does | PayVault does not |
|---|---|
| Protocol, SDKs, offline authorization | Hold customer funds (non-custodial) |
| Reconciliation, double-spend detection, risk engine | Issue accounts or wallets |
| Settlement instructions to partner ledgers and rails | Need a banking licence in each country |
| Partner console, APIs, per-country configuration | Face end users directly (partners own the brand) |

**Why this model works for a 54-country continent:** the licensed partner in each market carries the regulatory and custodial burden. PayVault registers as a technology service provider where required. Expansion becomes a partner and config problem, not a licensing problem per country.

### 1.2 Customers (in suggested order)
1. **Mobile money operators and agent-network fintechs.** They have huge merchant and agent networks and lose transactions to network downtime.
2. **Humanitarian and government cash transfers** (aid disbursement in low-connectivity areas). Offline need is acute, and small limits are acceptable there.
3. **Transit and ticketing** (buses, ferries, rural routes). These are high-frequency, low-value payments where connectivity is often absent.
4. **Banks and PSPs** that want offline acceptance for their POS and app users.
5. **Cross-border traders** at land borders. This is later and needs cross-border settlement (PAPSS).

### 1.3 Revenue model (suggestions)
- **Per-transaction fee** on settled offline transactions (basis points, capped).
- **Platform tier** (monthly): console, SLA, higher limits, dedicated support.
- **Guarantee premium:** an optional charge for PayVault's risk pool to cover merchants against double-spend losses.
- **SDK licensing** for white-label integrations.

---

## 2. Feedback on the current mockups

The mockups (landing page, mobile screens, folder, tee) have a strong system: deep green and navy on off-white, heavy uppercase display type, and a shield watermark. Keep that.

Suggested changes:

1. **Imagery.** The masked figure and black glove read as anonymity/hacker/streetwear. For a trust product aimed at African merchants and operators, that signal works against us. Keep the green-toned editorial style, but show real contexts: market stalls, bus conductors, agents, border traders, phones mid-payment.
2. **Leftover template copy.** "Shop", "New arrivals", "Spring/Summer collection 2025" and "Los Angeles, California" come from a fashion template. Replace them with: Product, How it works, Developers, Use cases, Pricing, Contact.
3. **Headline.** "Secure payments. Smart future." is generic. The product's real edge is offline:
   - "Payments that don't wait for the network."
   - "Pay offline. Settle later. Lose nothing."
   - "No signal. Still paid."
4. **B2B framing.** The mockups sell to consumers. The site should sell to partners ("Add offline payments to your app in days"), with consumer scenes as proof.
5. **The "100" / "+1" elements** have no meaning yet. Repurpose them as real stats (e.g. "0 network required", "54 countries targeted", "<1s offline verification").

---

## 3. How the protocol works

### 3.1 Core idea: the Offline Vault
A user **locks** part of their balance with their partner (bank/MMO) into an offline allowance, similar to UPI Lite in India. The partner signs an **Allowance Certificate** bound to the user's device key. The device can then spend that allowance offline. Merchants verify everything cryptographically with no network.

Why this model:
- **Losses are bounded.** At worst, a cheater can double-spend their own allowance. Risk equals the allowance cap, which the partner controls.
- **Funds are real.** The value was locked before it was spent offline. This is not credit.
- **Fraud is provable.** A double-spend produces two signed payments with the same sequence number. That pair is cryptographic evidence against a KYC'd account.

### 3.2 Seven layers (matches the case study)

| # | Layer | Responsibility |
|---|---|---|
| 1 | **Identity & Keys** | Device keypair in hardware keystore (Android StrongBox/TEE, iOS Secure Enclave, SIM applet). Device attestation at enrolment. |
| 2 | **Allowance** | Partner-signed certificate: device pubkey, cap, currency, expiry, allowance ID, issuer key ID. |
| 3 | **Payment** | Payer-signed payment: allowance ID, sequence number, cumulative spent, amount, merchant ID, request nonce, previous-payment hash. |
| 4 | **Transport** | QR (primary), NFC/HCE, BLE. Later: SMS fallback, USSD, data-over-sound for feature phones. |
| 5 | **Queue & Sync** | Merchant stores payments durably; syncs opportunistically; pulls revocation lists and issuer key updates. |
| 6 | **Reconciliation & Risk** | Validate, deduplicate, detect forks, apply limits and velocity rules, score risk, trigger revocation. |
| 7 | **Settlement** | Produce settlement batches, send them to the partner ledger (same-partner), domestic rails (cross-partner), or PAPSS (cross-border). |

### 3.3 Payment flow (merchant-initiated, two scans)
```
Merchant device                             Payer device
───────────────                             ────────────
1. Create request {merchantId, amount,
   currency, nonce}  ──── QR ─────────────▶ 2. Scan, show amount, confirm with PIN/biometric
                                            3. Sign payment (seq+1, cumulative+amount, prevHash)
4. Scan payment QR ◀──────────── QR ─────── 
5. Verify offline:
   • issuer signature on allowance (cached issuer keys)
   • allowance not expired / not revoked (last sync)
   • payer signature
   • merchantId + nonce match my request
   • currency matches, cumulative ≤ cap
   • seq/cumulative consistent with any earlier payments seen from this allowance
6. Accept → store in queue → show receipt
   (optional: merchant-signed receipt back to payer)
```
Alternative flows:
- **Static merchant QR:** the payer scans a printed QR and enters the amount, then the merchant scans back.
- **NFC tap:** a single tap that exchanges both directions.

### 3.4 Double-spend handling (honest version)
Offline double-spend **cannot be prevented with certainty**. It can only be made hard, bounded, detected and recovered:

| Defence | Effect |
|---|---|
| Hardware-backed keys + attestation | Cloning a device key is expensive |
| Allowance cap + per-txn limit + expiry | Caps maximum loss |
| Hash-chained, sequenced payments | Any double-spend creates a detectable fork |
| Merchant-side consistency checks | Blocks naive replays at the same merchant |
| Revocation list synced to merchants | Stops a known offender once merchants sync |
| KYC'd allowance holder | Loss recovered from the offender's account |
| Risk pool | Merchant is paid regardless (the guarantee) |

**The "guarantee":** a merchant who accepted a payment that passed all offline checks gets paid. Fork losses are covered by the partner's or PayVault's risk pool and recovered from the offender.

### 3.5 Cryptography choices
- **ECDSA P-256** (not secp256k1 or Ed25519). This is the curve iOS Secure Enclave and Android StrongBox support natively. It matches the case study's "ECDSA".
- **SHA-256** for hash chains.
- **CBOR** binary encoding (COSE-style) to keep QR payloads small.
- **Estimated payload size:** about 140 B for the payment plus about 125 B for the allowance cert, roughly 270 B total. That fits one QR at version ~11. Merchants cache certs, so repeat payments are smaller.
- **Libraries:** `@noble/curves` + `@noble/hashes` (audited, isomorphic, deterministic signatures, easy to test).
- **Clocks:** device clocks are untrusted. Sequence numbers do the ordering, and expiry allows a skew window.

### 3.6 Threat model (initial)

| Threat | Mitigation |
|---|---|
| Cloned device / extracted key | Hardware keystore, attestation, low caps, fork detection, revocation |
| Replay to same merchant | Request nonce + seq checks |
| Replay to a different merchant | Payment bound to merchantId |
| Counter rollback on device | Hash chain makes rollback a fork, which is detected at reconciliation |
| Fake payment by merchant | Impossible without payer's private key |
| Lost/stolen phone | PIN/biometric before signing; remaining allowance is at risk like cash, capped; key revocable |
| Expired or revoked allowance | Checked offline against last-synced list; risk accepted within the sync window |
| Coercion / scams | Low offline limits; merchant-bound payments |
| Merchant data loss before sync | Durable encrypted queue; payer keeps a copy and can also sync it (either side can settle) |
| Privacy | Merchants see pseudonymous allowance IDs, not identity |

### 3.7 Useful idea for later: courier sync
Any PayVault device that comes online can relay other merchants' encrypted, signed receipts to reconciliation. The payload is already signed, so relays can't tamper with it. This speeds up fork detection in areas where only some devices ever get signal.

---

## 4. Pan-African design: countries as data

Every market-specific rule lives in a **Country Pack** (JSON validated by a schema), not in code. Adding a country means adding a file.

```jsonc
{
  "country": "SN",
  "name": "Senegal",
  "bloc": "WAEMU",
  "regulator": "BCEAO",
  "currency": { "code": "XOF", "minorUnits": 0 },
  "offlineLimits": {             // illustrative
    "perTransaction": 10000,
    "allowanceCap": 50000,
    "allowanceTtlHours": 72,
    "maxOfflinePayments": 50
  },
  "kycTiers": ["basic", "full"],
  "idSystems": ["CNI"],
  "rails": { "domestic": ["gim-uemoa", "wave", "orange-money"], "crossBorder": ["papss"] },
  "dataResidency": "in-region",
  "languages": ["fr", "wo"],
  "status": "concept"
}
```

Starting set (spread across blocs and currencies): **Nigeria (NGN), Ghana (GHS), Kenya (KES), Senegal (XOF), Côte d'Ivoire (XOF), Cameroon (XAF), Rwanda (RWF), South Africa (ZAR)**.

**Currency rules:**
- Every payment carries its currency. No offline FX.
- Cross-currency trade converts at settlement, online.
- Amounts are stored as integers in minor units.

---

## 5. What gets built in this repo (prototype)

### 5.1 Scope
1. **`@payvault/protocol`:** the real protocol library, fully tested. This is the core IP.
2. **`@payvault/countries`:** the Country Packs with schema.
3. **Simulator:** an interactive, in-browser demo of the whole system, including attacks.
4. **Marketing site:** partner-facing, using the brand system.
5. **Partner console (mock):** a dashboard showing exposure, reconciliation, fork alerts and country config.

Not in the prototype: real money, real partner integrations, native mobile SDKs, USSD/SIM applets. These are documented as next phases.

### 5.2 Stack

| Concern | Choice | Why |
|---|---|---|
| Monorepo | pnpm workspaces + Turborepo | Shared protocol lib across apps |
| App | Next.js (App Router) + TypeScript | One app for site, simulator and console; deploys to Vercel |
| Styling | Tailwind CSS v4 + CSS variables for brand tokens | Fast, consistent, themeable |
| Motion | Framer Motion | Hero and flow animations |
| Crypto | @noble/curves, @noble/hashes | Audited, isomorphic, deterministic |
| Encoding | cbor-x | Compact payloads |
| Validation | zod | Country packs + API inputs |
| QR | `qrcode` (generate), `@zxing/browser` (camera scan) | Real scan-to-pay demo across two phones |
| State (simulator) | Zustand | Many simulated devices, simple store |
| Tests | Vitest (unit), Playwright (e2e smoke) | |
| CI | GitHub Actions: lint, typecheck, test, build | |
| Hosting | Vercel | Static + edge; you already have the connector |

**Why the simulator runs fully in the browser:** "PayVault Cloud" (reconciliation, settlement, risk) is simulated in a Web Worker using the same protocol library. There is no backend to host, and anyone can open the link and play. A real API (Hono + Postgres) comes in phase 2 and reuses the same code.

### 5.3 Repo layout
```
payvault/
├─ apps/
│  └─ web/                      Next.js: site + /simulator + /console
│     ├─ app/(site)/            marketing pages
│     ├─ app/simulator/         interactive demo
│     ├─ app/console/           mock partner dashboard
│     └─ components/            UI kit (brand)
├─ packages/
│  ├─ protocol/                 keys, allowance, payment, encode, verify, chain, reconcile
│  ├─ countries/                country packs + schema
│  └─ ui/                       (optional) shared design tokens
├─ docs/
│  ├─ PLAN.md                   this file
│  ├─ PROTOCOL.md               wire format + verification rules (spec)
│  └─ THREAT-MODEL.md
└─ .github/workflows/ci.yml
```

### 5.4 Protocol library API (draft)
```ts
// Issuer (partner) side
issueAllowance(issuerKey, { devicePubKey, cap, currency, ttl, country }): AllowanceCert

// Device (payer) side
createWallet(): DeviceKeypair
signPayment(wallet, allowance, request, state): { payment: Payment, nextState }

// Merchant side (offline)
createRequest(merchant, amount, currency): PaymentRequest
verifyPayment(payment, allowance, ctx: { issuerKeys, revocations, request, seen }): VerifyResult

// Encoding
encode(obj): Uint8Array   decode(bytes)
toQR(bytes): string       fromQR(string)

// Cloud side
reconcile(batch: Payment[]): { settled, duplicates, forks, rejected }
buildSettlement(settled, countryPack): SettlementBatch[]
```
Test targets: signature round-trips, tamper detection on every field, replay rejection, cap and limit enforcement, fork detection, expiry and revocation, encoding size budget (under 300 B), and property-based tests for chain consistency.

### 5.5 Simulator (the demo that sells it)
**Layout:** a map/scene with devices as cards, and "PayVault Cloud" plus a partner ledger on the side.

**Controls:** signal toggle per device, time fast-forward, country picker (changes currency and limits live).

**Scenarios:**
1. **Market day, Kano (NGN):** a trader accepts ten payments offline, then syncs at night. Settlement lands.
2. **Rural bus, Kenya (KES):** a conductor device stays offline all day. A passenger's phone comes online first and relays receipts (courier sync).
3. **Double-spend attack:** clone a wallet, spend the same allowance at two merchants.
   - Both accept offline.
   - Reconciliation detects the fork.
   - The key is revoked and the risk pool pays the merchant.
   - Recovery comes from the offender's account.
4. **Tamper attempt:** edit the amount in the QR payload, and the merchant rejects it instantly.
5. **Cross-border, Lomé → Cotonou (XOF):** same currency, two partners, settled via inter-partner batch.

**Views:** a live event log, a payload inspector (decoded CBOR fields plus signature status), and a real QR mode that uses two phones and the camera.

### 5.6 Marketing site (partner-facing)

| Page | Content |
|---|---|
| **Home** | Hero ("No signal. Still paid."), the problem (connectivity gaps), how it works (3 steps), who it's for, simulator CTA, request-a-pilot CTA |
| **How it works** | Seven layers, animated payment flow, double-spend explained plainly |
| **Product** | SDKs (Android/iOS/Web; USSD/SIM planned), Reconciliation API, Partner Console, Risk Pool |
| **Use cases** | Mobile money and agents, humanitarian cash, transit, retail/POS, cross-border trade |
| **Coverage** | Africa map: countries by status (concept / pilot-ready / live), driven by Country Packs |
| **Developers** | Code snippets, protocol spec, sandbox keys (mock) |
| **Security** | Threat model summary, crypto choices, non-custodial model |
| **Pricing** | Starter / Growth / Enterprise (indicative) |
| **About / Case study** | Origin, principles, status: concept |
| **Contact** | Pilot request form (partner type, country, volume) |

**Brand tokens** (approximated from mockups, to be confirmed):
- `--pv-green` ≈ `#0B6B45`
- `--pv-navy` ≈ `#13294B`
- `--pv-paper` ≈ `#F4F4F2`
- `--pv-ink` ≈ `#0E0E0E`
- **Type:** Montserrat (display, uppercase, heavy) + Inter (body).
- **Logo:** use the supplied shield and wordmark as SVG.

**Quality bar:**
- Mobile-first, with Lighthouse ≥ 90.
- WCAG AA contrast.
- English and French from the start (francophone West/Central Africa), with i18n-ready copy for more languages.
- Light pages; many visitors are on slow networks, so practise what we preach.

### 5.7 Partner console (mock)
- **Overview:** outstanding offline exposure, payments pending sync, settled today, fork rate.
- **Reconciliation:** batches, statuses, drill-down into payments.
- **Risk:** fork alerts with evidence (the two conflicting signed payments), revoked keys.
- **Allowances:** issued, active, expired, by country.
- **Countries:** view Country Packs and limits.
- **Developers:** API keys, webhooks (mock).

This runs on data produced by the simulator, so the simulator and the console tell one story.

---

## 6. Milestones

| # | Milestone | Deliverables | Done when |
|---|---|---|---|
| M0 | Scaffold | Monorepo, Next app, Tailwind tokens, CI, lint/format | CI green on empty app |
| M1 | Protocol | `@payvault/protocol` + `PROTOCOL.md` + `THREAT-MODEL.md` | All tests pass; payload < 300 B |
| M2 | Countries | 8 Country Packs + schema + tests | Invalid packs fail CI |
| M3 | Simulator | Scenarios 1–5, payload inspector, event log | Double-spend demo runs end to end |
| M4 | Site | All pages, EN/FR, responsive | Lighthouse ≥ 90, AA contrast |
| M5 | Console | Mock dashboard fed by simulator | Fork alert visible after attack scenario |
| M6 | Real QR | Two-phone camera flow | Pay between two real phones in airplane mode |
| M7 | Deploy | Vercel preview + production | Public URL (after your approval) |

**Order of work:** M0 → M1 → M2 run first because everything depends on them. M3 and M4 can then progress in parallel.

---

## 7. After the prototype

| Phase | Work |
|---|---|
| **Phase 2: Pilot-ready** | Real reconciliation API (Hono + Postgres, region-hosted), Android SDK (Kotlin, StrongBox, Play Integrity), partner ledger adapter interface, webhook events, audit logs, key rotation |
| **Phase 3: Pilot** | One partner, one market (WAEMU recommended for its single regulator and currency across 8 countries), regulator sandbox engagement, independent security audit of the protocol, risk-pool funding |
| **Phase 4: Network** | Multi-partner interoperability (PayVault as issuer-key directory and inter-partner settlement), iOS SDK, SIM applet/USSD for feature phones, PAPSS cross-border, ISO 27001 / SOC 2 |

**Before any real money:**
- Independent cryptography and security audit.
- Legal opinion per launch market on TSP registration and data protection (NDPA, Kenya DPA, POPIA, etc.).
- Partner agreement defining who bears double-spend loss.

---

## 8. Open decisions (need your input)

1. **Repo:** keep the name `Pulse`, or rename to `payvault`?
2. **Logo files:** can you share the logo as SVG, plus exact brand hex codes and fonts?
3. **Imagery:** OK to replace the masked-model/glove imagery with African commerce scenes? Do you have photos, or should I use placeholders or illustrations?
4. **Headline:** pick one from section 2, or keep "Secure payments. Smart future."
5. **Languages:** EN + FR at launch? Add Portuguese, Swahili or Arabic?
6. **Deploy:** Vercel under your account?
7. **Case-study link:** should the site link back to olabisiadigun.xyz as the origin/case study?
