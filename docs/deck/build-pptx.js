// PayVault pitch deck (.pptx). Mirrors docs/deck/pitch-deck.html.
const pptxgen = require("pptxgenjs");
const sharp = require("sharp");
const path = require("path");
const { applyTheme } = require("/root/.claude/skills/synced/dccfdf36-5e5a-41c8-8cc4-ceca6d91e826_50663c84-2e58-4b91-84a6-049149774669/pptx/scripts/apply_theme.js");

const REPO = "/home/user/Pulse";
const OUT = path.join(REPO, "docs/deck/PayVault-Pitch-Deck.pptx");
const photo = (f) => path.join(REPO, "public/photos", f);

const THEME = {
  name: "PayVault",
  headFontFace: "Arial",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "10161D", lt1: "FFFFFF", dk2: "14365A", lt2: "F4F6F8",
    accent1: "046B4F", accent2: "2FB386", accent3: "0B1F36", accent4: "E3F1EC",
    accent5: "5B6672", accent6: "C4D3E3", hlink: "046B4F", folHlink: "14365A",
  },
};

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
  pres.title = "PayVault: No signal. Still paid.";
  pres.author = "PayVault";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;
  const W = 13.333, M = 0.75;

  const svgPng = async (file) =>
    "image/png;base64," + (await sharp(path.join(REPO, "public/brand", file), { density: 600 }).resize(240).png().toBuffer()).toString("base64");
  const markLight = await svgPng("payvault-mark.svg");
  const markDark = await svgPng("payvault-mark-dark.svg");

  const footer = (dark) => [
    { image: { x: M, y: 6.88, w: 0.26, h: 0.27, data: dark ? markDark : markLight } },
    { text: { text: "PAYVAULT", options: { x: M + 0.34, y: 6.86, w: 2, h: 0.3, fontSize: 11, bold: true, charSpacing: 1, color: dark ? C.background1 : C.text2, margin: 0, fontFace: "Arial" } } },
  ];
  const kicker = (dark) => ({
    placeholder: { options: { name: "kicker", type: "body", x: M, y: 0.55, w: 11.8, h: 0.35, fontSize: 13, bold: true, charSpacing: 3, color: dark ? C.accent2 : C.accent1, margin: 0, valign: "top" }, text: "" },
  });
  const titlePh = (dark) => ({
    placeholder: { options: { name: "title", type: "title", x: M, y: 0.95, w: 10.6, h: 1.35, fontSize: 36, bold: true, color: dark ? C.background1 : C.text2, margin: 0, valign: "top", fontFace: "Arial" }, text: "" },
  });

  pres.defineSlideMaster({
    title: "PV Light", background: { color: C.background1 },
    objects: [kicker(false), titlePh(false), ...footer(false)],
    slideNumber: { x: 12.1, y: 6.86, w: 0.5, h: 0.3, fontSize: 11, color: C.accent5, align: "right" },
  });
  pres.defineSlideMaster({
    title: "PV Dark", background: { color: C.text2 },
    objects: [kicker(true), titlePh(true), ...footer(true)],
    slideNumber: { x: 12.1, y: 6.86, w: 0.5, h: 0.3, fontSize: 11, color: C.accent6, align: "right" },
  });
  pres.defineSlideMaster({ title: "PV Cover", background: { color: C.text2 }, objects: [] });

  // Helpers -----------------------------------------------------------------
  let n = 0;
  const id = (s) => `${s}-${++n}`;
  function card(slide, x, y, w, h, title, body, o = {}) {
    const dark = !!o.dark;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w, h, rectRadius: 0.12, line: { type: "none" },
      fill: { color: o.fill ?? (dark ? C.background1 : C.background2), transparency: dark ? 90 : 0 }, objectName: id("card"),
    });
    let ty = y + 0.3;
    if (o.num) {
      slide.addShape(pres.shapes.OVAL, { x: x + 0.3, y: ty, w: 0.45, h: 0.45, fill: { color: dark ? C.accent2 : C.accent4 }, line: { type: "none" }, objectName: id("num") });
      slide.addText(String(o.num), { x: x + 0.3, y: ty, w: 0.45, h: 0.45, align: "center", valign: "middle", fontSize: 14, bold: true, color: dark ? C.text2 : C.accent1, margin: 0, isTextBox: true, objectName: id("numtxt") });
      ty += 0.65;
    }
    if (o.tag) {
      slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.3, y: ty, w: 1.45, h: 0.36, rectRadius: 0.18, fill: { color: o.tagFill ?? C.accent4 }, line: { type: "none" }, objectName: id("tag") });
      slide.addText(o.tag, { x: x + 0.3, y: ty, w: 1.45, h: 0.36, align: "center", valign: "middle", fontSize: 11, bold: true, color: C.accent1, margin: 0, isTextBox: true, objectName: id("tagtxt") });
      ty += 0.55;
    }
    // Titles that won't fit on one line get a two-line box (Arial bold ~0.56em per char).
    const th = title.length * (18 / 72) * 0.56 > w - 0.6 ? 0.8 : 0.45;
    slide.addText(title, { x: x + 0.3, y: ty, w: w - 0.6, h: th, fontSize: 18, bold: true, color: o.titleColor ?? (dark ? C.background1 : C.text1), margin: 0, valign: "top", fontFace: "Arial", isTextBox: true, objectName: id("cardtitle") });
    slide.addText(body, { x: x + 0.3, y: ty + th + 0.05, w: w - 0.6, h: y + h - (ty + th + 0.05) - 0.2, fontSize: 14, color: dark ? C.accent6 : C.accent5, margin: 0, valign: "top", lineSpacingMultiple: 1.1, isTextBox: true, objectName: id("cardbody") });
  }
  const cols = (count, gap = 0.3, x0 = M, width = W - 2 * M) => {
    const w = (width - gap * (count - 1)) / count;
    return Array.from({ length: count }, (_, i) => ({ x: x0 + i * (w + gap), w }));
  };

  // 1. Cover ----------------------------------------------------------------
  pres.addSection({ title: "Opening" });
  let s = pres.addSlide({ masterName: "PV Cover", sectionTitle: "Opening" });
  s.addImage({ path: photo("trader.jpg"), x: 7.2, y: 0, w: 6.133, h: 7.5, sizing: { type: "cover", w: 6.133, h: 7.5 }, objectName: "cover-photo" });
  s.addImage({ data: markDark, x: M, y: 0.6, w: 0.55, h: 0.57, objectName: "logo" });
  s.addText([{ text: "PAY", options: { bold: true } }, { text: "VAULT" }], { x: M + 0.7, y: 0.66, w: 3, h: 0.45, fontSize: 22, color: C.background1, margin: 0, fontFace: "Arial", isTextBox: true, objectName: "wordmark" });
  s.addText("SMART SME FINANCING AND GROWTH PLATFORM", { x: M, y: 2.7, w: 6.2, h: 0.35, fontSize: 13, bold: true, charSpacing: 3, color: C.accent2, margin: 0, isTextBox: true, objectName: "track" });
  s.addText([{ text: "No signal.", options: { color: C.background1, breakLine: true } }, { text: "Still paid.", options: { color: C.accent2 } }], {
    x: M, y: 3.1, w: 6.2, h: 2.1, fontSize: 60, bold: true, margin: 0, fontFace: "Arial", valign: "top", isTextBox: true, objectName: "headline",
  });
  s.addText("Offline payments that turn a market trader's daily sales into the credit history a bank can lend against.", {
    x: M, y: 5.3, w: 6.0, h: 0.95, fontSize: 18, color: C.accent6, margin: 0, valign: "top", isTextBox: true, objectName: "subhead",
  });
  s.addText("Live demo: payvault.rumptycloud.app", { x: M, y: 6.6, w: 6, h: 0.35, fontSize: 13, color: C.accent6, margin: 0, isTextBox: true, objectName: "demo" });
  s.addNotes("PayVault lets market traders get paid with no network, and turns every settled sale into credit history their bank can lend against.");

  // 2. Problem --------------------------------------------------------------
  pres.addSection({ title: "Problem and users" });
  s = pres.addSlide({ masterName: "PV Light", sectionTitle: "Problem and users" });
  s.addImage({ path: photo("stall.jpg"), x: 8.6, y: 0, w: 4.733, h: 7.5, sizing: { type: "cover", w: 4.733, h: 7.5 }, objectName: "problem-photo" });
  s.addText("THE PROBLEM", { placeholder: "kicker" });
  s.addText("Africa's traders are creditworthy but invisible", { placeholder: "title", w: 7.4 });
  const problems = [
    ["Payments stop when the signal stops.", "In markets with weak networks, transfers fail, so sales fall back to cash."],
    ["Cash leaves no record.", "Banks can't see a trader's real income, however steady it is."],
    ["No record, no credit.", "Women-led micro-businesses are refused loans or pushed to costly informal lenders."],
    ["Growth stalls.", "On a slow day she can't restock, and a missed day is lost income."],
  ];
  problems.forEach(([b, t], i) => {
    const y = 2.55 + i * 1.0;
    s.addShape(pres.shapes.OVAL, { x: M, y: y + 0.08, w: 0.2, h: 0.2, fill: { color: C.accent1 }, line: { type: "none" }, objectName: id("dot") });
    s.addText([{ text: b + " ", options: { bold: true, color: C.text1 } }, { text: t, options: { color: C.accent5 } }], {
      x: M + 0.4, y, w: 6.9, h: 0.85, fontSize: 16, margin: 0, valign: "top", isTextBox: true, objectName: id("problem"),
    });
  });

  // 3. Target users ---------------------------------------------------------
  s = pres.addSlide({ masterName: "PV Light", sectionTitle: "Problem and users" });
  s.addText("TARGET USERS", { placeholder: "kicker" });
  s.addText("Built for the trader. Sold to the institutions that serve her", { placeholder: "title" });
  const users = [
    ["Market traders", "Women-led micro and small businesses: market stalls, kiosks, food sellers, agents. Smartphone or basic phone."],
    ["Their customers", "Shoppers who want to pay digitally even where data is patchy, including on basic phones via USSD."],
    ["Partners (who pay)", "Banks, microfinance banks, mobile money operators and fintechs. They hold the licences and funds; PayVault is the layer underneath."],
  ];
  cols(3).forEach((c, i) => card(s, c.x, 2.6, c.w, 2.9, users[i][0], users[i][1], { num: i + 1 }));
  s.addText("Starting market: Nigeria. Designed for 15 African markets in English and French.", { x: M, y: 5.9, w: 11, h: 0.4, fontSize: 14, color: C.accent5, margin: 0, isTextBox: true, objectName: "users-note" });

  // 4. Solution -------------------------------------------------------------
  pres.addSection({ title: "Solution" });
  s = pres.addSlide({ masterName: "PV Dark", sectionTitle: "Solution" });
  s.addText("THE SOLUTION", { placeholder: "kicker" });
  s.addText("PayVault: payments that work offline, and sales that become credit", { placeholder: "title" });
  const sol = [
    ["Pays offline", "The customer's phone signs a payment with no network. The trader's phone verifies it on the spot. It settles automatically when any phone reconnects."],
    ["Sales become credit", "Every settled sale counts as a trading day. A steady month of trading lifts her score and unlocks an overdraft from the partner bank."],
    ["Works on any phone", "Web app for smartphones; USSD menu, SMS confirmations and a printed stall sticker (QR / NFC) for everyone else."],
  ];
  cols(3).forEach((c, i) => card(s, c.x, 2.7, c.w, 3.0, sol[i][0], sol[i][1], { dark: true, num: i + 1 }));

  // 5. How a sale works -----------------------------------------------------
  s = pres.addSlide({ masterName: "PV Light", sectionTitle: "Solution" });
  s.addText("HOW A SALE WORKS", { placeholder: "kicker" });
  s.addText("From a stall with no signal to a loan offer", { placeholder: "title" });
  const steps = [
    ["Load the vault", "Once online, the customer moves money into an offline vault on her phone, plus an optional overdraft."],
    ["Pay with no signal", "She scans the trader's code and enters her PIN. The trader's phone verifies the signed payment in under a second."],
    ["Settle automatically", "When either phone, or any nearby PayVault phone, gets signal, the payment settles and the trader gets an SMS."],
    ["Unlock credit", "Settled sales build her trading history. The partner bank sees verified income and offers an overdraft."],
  ];
  const sc = cols(4, 0.45);
  sc.forEach((c, i) => {
    card(s, c.x, 2.6, c.w, 3.6, steps[i][0], steps[i][1], { num: i + 1 });
    if (i < 3) s.addText("→", { x: c.x + c.w + 0.02, y: 3.95, w: 0.41, h: 0.5, fontSize: 22, bold: true, color: C.accent1, align: "center", margin: 0, isTextBox: true, objectName: id("arrow") });
  });

  // 6. Innovation -----------------------------------------------------------
  s = pres.addSlide({ masterName: "PV Light", sectionTitle: "Solution" });
  s.addText("INNOVATION", { placeholder: "kicker" });
  s.addText("What's new about PayVault", { placeholder: "title" });
  const inn = [
    ["Offline overdraft", "Pay-later credit that works with no network, inside the same signed vault as the customer's own money."],
    ["Offline sales as credit data", "Trading days and takings, collected even without signal, become alternative data for lending."],
    ["Cryptographic trust", "Every payment is signed on the phone (ECDSA P-256) and hash-chained, so tampering and double-spends are detectable."],
    ["Delivery by any route", "A payment reaches the bank via the trader's phone, the customer's phone, a nearby phone relaying it by QR, or SMS."],
    ["Any phone", "Smartphone web app, USSD, SMS and printed stall stickers: no app store, no new hardware."],
    ["Pan-African by design", "Country rules are configuration, not code. 15 markets set up, in English and French."],
  ];
  const ic = cols(3);
  inn.forEach(([t, b], i) => card(s, ic[i % 3].x, 2.35 + Math.floor(i / 3) * 2.25, ic[i % 3].w, 2.1, t, b, { titleColor: C.accent1 }));

  // 7. Trust ----------------------------------------------------------------
  s = pres.addSlide({ masterName: "PV Dark", sectionTitle: "Solution" });
  s.addText("WHY IT'S SAFE TO PAY OFFLINE", { placeholder: "kicker" });
  s.addText("Offline double-spending: bounded, detected, recovered", { placeholder: "title" });
  const trust = [
    ["Bounded", "Small vault caps, per-payment and per-trader limits set per country. The worst case is a known, small amount."],
    ["Detected", "Payments are numbered and hash-chained. A cloned phone shows up as a \"fork\" the moment payments sync."],
    ["Recovered", "The trader is paid in full from a risk pool; the loss is recovered from the ID-verified holder. Lost phones can be frozen."],
  ];
  cols(3).forEach((c, i) => card(s, c.x, 2.7, c.w, 2.8, trust[i][0], trust[i][1], { dark: true, titleColor: C.accent2 }));

  // 8. Impact ---------------------------------------------------------------
  pres.addSection({ title: "Impact and model" });
  s = pres.addSlide({ masterName: "PV Light", sectionTitle: "Impact and model" });
  s.addImage({ path: photo("shop.jpg"), x: 9.0, y: 0, w: 4.333, h: 7.5, sizing: { type: "cover", w: 4.333, h: 7.5 }, objectName: "impact-photo" });
  s.addText("IMPACT", { placeholder: "kicker" });
  s.addText("More sales, a credit history and fairer loans", { placeholder: "title", w: 7.9 });
  const imp = [
    ["Traders", "Never lose a digital sale to bad network. Build a verifiable record. Get an overdraft to restock."],
    ["Customers", "Pay digitally anywhere, on any phone, with small pay-later when short."],
    ["Partners", "New, lower-risk SME lending backed by real sales data, plus volume that used to be cash."],
  ];
  cols(3, 0.25, M, 7.9).forEach((c, i) => card(s, c.x, 2.45, c.w, 2.5, imp[i][0], imp[i][1]));
  s.addText("WHAT THE PILOT WILL MEASURE", { x: M, y: 5.2, w: 7.9, h: 0.3, fontSize: 12, bold: true, charSpacing: 3, color: C.accent1, margin: 0, isTextBox: true, objectName: "measure-kicker" });
  const metrics = ["Sales captured offline", "Settlement rate", "Time to settle", "Fraud loss vs volume", "Traders reaching credit", "Repayment rate", "Women-led share"];
  let mx = M, my = 5.6;
  metrics.forEach((t) => {
    const w = 0.25 + t.length * 0.095;
    if (mx + w > M + 7.9) { mx = M; my += 0.5; }
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: mx, y: my, w, h: 0.38, rectRadius: 0.19, fill: { color: C.accent4 }, line: { type: "none" }, objectName: id("pill") });
    s.addText(t, { x: mx, y: my, w, h: 0.38, fontSize: 12, bold: true, color: C.accent1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: id("pilltxt") });
    mx += w + 0.15;
  });

  // 9. Business model -------------------------------------------------------
  s = pres.addSlide({ masterName: "PV Light", sectionTitle: "Impact and model" });
  s.addText("BUSINESS MODEL", { placeholder: "kicker" });
  s.addText("B2B infrastructure, white-labelled into our partners' apps", { placeholder: "title" });
  const biz = [
    ["Transaction fee", "Small fee on each settled offline payment."],
    ["Credit share", "Share of overdraft fees on credit that PayVault data unlocks."],
    ["Platform licence", "Per partner and per country, with integration support."],
    ["Risk pool", "Optional guarantee premium covering offline fraud losses."],
  ];
  cols(4).forEach((c, i) => card(s, c.x, 2.5, c.w, 2.7, biz[i][0], biz[i][1], { num: i + 1 }));
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 5.55, w: W - 2 * M, h: 0.8, rectRadius: 0.12, fill: { color: C.accent4 }, line: { type: "none" }, objectName: "custody" });
  s.addText("PayVault never holds customer funds. Licensed partners are the lender and custodian of record.", { x: M + 0.3, y: 5.55, w: W - 2 * M - 0.6, h: 0.8, fontSize: 16, bold: true, color: C.accent1, valign: "middle", margin: 0, isTextBox: true, objectName: "custody-txt" });

  // 10. Implementation ------------------------------------------------------
  pres.addSection({ title: "Delivery" });
  s = pres.addSlide({ masterName: "PV Light", sectionTitle: "Delivery" });
  s.addText("IMPLEMENTATION APPROACH", { placeholder: "kicker" });
  s.addText("From working prototype to live pilot", { placeholder: "title" });
  const phases = [
    ["Done", "Phase 0: Prototype", "Live wallet, merchant mode, USSD, partner console, API and docs. Automated tests on payments, fraud and credit."],
    ["0–3 months", "Phase 1: Pilot", "One partner bank, MFB or mobile money operator and about 50 traders from one market association."],
    ["3–6 months", "Phase 2: Harden", "Android SDK, phone sign-in, independent security audit, hardware-secured keys, CBN regulatory sandbox."],
    ["6+ months", "Phase 3: Scale", "More partners and markets via country packs; cross-border settlement through PAPSS."],
  ];
  cols(4).forEach((c, i) =>
    card(s, c.x, 2.4, c.w, 3.3, phases[i][1], phases[i][2], { tag: phases[i][0], fill: i === 0 ? C.accent4 : undefined, tagFill: i === 0 ? C.background1 : C.accent4 }),
  );
  s.addText([
    { text: "Integration points: ", options: { bold: true, color: C.text1 } },
    { text: "partner core banking or wallet ledger (REST API + signed webhooks), KYC (NIN / BVN), SMS and USSD aggregator (Africa's Talking).", options: { color: C.accent5 } },
  ], { x: M, y: 5.85, w: W - 2 * M, h: 0.7, fontSize: 15, margin: 0, valign: "top", isTextBox: true, objectName: "integration" });

  // 11. Technology ----------------------------------------------------------
  s = pres.addSlide({ masterName: "PV Light", sectionTitle: "Delivery" });
  s.addText("TECHNOLOGY", { placeholder: "kicker" });
  s.addText("Built with proven, open technology", { placeholder: "title" });
  const tech = [
    ["App", "Next.js / React Progressive Web App, TypeScript, service workers and IndexedDB for offline use."],
    ["Security", "WebCrypto ECDSA P-256 signatures, non-extractable device keys, hash-chained payments, encrypted issuer keys."],
    ["Payments", "Compact signed payment protocol over QR codes; PostgreSQL double-entry ledger and reconciliation."],
    ["Credit", "Rules-based scoring on alternative data (trading days, sales, repayments); machine learning once pilot data exists."],
    ["Integration", "REST APIs, HMAC-signed webhooks, Africa's Talking USSD and SMS."],
    ["Cloud", "Docker, hosted in Lagos (RumptyCloud), with Vercel for the web front end."],
  ];
  const tc = cols(3);
  tech.forEach(([t, b], i) => card(s, tc[i % 3].x, 2.35 + Math.floor(i / 3) * 2.25, tc[i % 3].w, 2.1, t, b));

  // 12. Close ---------------------------------------------------------------
  s = pres.addSlide({ masterName: "PV Cover", sectionTitle: "Delivery" });
  s.addImage({ path: photo("agent.jpg"), x: 7.6, y: 0, w: 5.733, h: 7.5, sizing: { type: "cover", w: 5.733, h: 7.5 }, objectName: "close-photo" });
  s.addText("TRY IT TODAY", { x: M, y: 0.8, w: 6.4, h: 0.35, fontSize: 13, bold: true, charSpacing: 3, color: C.accent2, margin: 0, isTextBox: true, objectName: "close-kicker" });
  s.addText([{ text: "Every trading day becomes ", options: { color: C.background1 } }, { text: "credit history.", options: { color: C.accent2 } }], {
    x: M, y: 1.3, w: 6.5, h: 2.4, fontSize: 44, bold: true, margin: 0, valign: "top", fontFace: "Arial", isTextBox: true, objectName: "close-headline",
  });
  s.addText("We're looking for a partner bank or mobile money operator and a market association to run the first pilot.", {
    x: M, y: 3.7, w: 6.3, h: 1.0, fontSize: 18, color: C.accent6, margin: 0, valign: "top", isTextBox: true, objectName: "close-ask",
  });
  s.addText([{ text: "Live demo  ", options: { color: C.accent6 } }, { text: "payvault.rumptycloud.app", options: { color: C.background1, bold: true } }], {
    x: M, y: 5.2, w: 6.3, h: 0.4, fontSize: 17, margin: 0, isTextBox: true, objectName: "close-demo",
  });
  s.addText("Demo uses test money only. Country limits are illustrative until agreed with partners and regulators.", {
    x: M, y: 5.65, w: 6.3, h: 0.5, fontSize: 11, color: C.accent6, margin: 0, valign: "top", isTextBox: true, objectName: "close-note",
  });
  s.addImage({ data: markDark, x: M, y: 6.6, w: 0.4, h: 0.42, objectName: "close-logo" });
  s.addText([{ text: "PAY", options: { bold: true } }, { text: "VAULT" }], { x: M + 0.52, y: 6.62, w: 2.5, h: 0.4, fontSize: 17, color: C.background1, margin: 0, fontFace: "Arial", isTextBox: true, objectName: "close-wordmark" });

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
