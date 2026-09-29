/** English copy for the marketing site. French mirrors this shape in fr.ts. */
const site = {
  meta: {
    home: {
      title: "No signal. Still paid.",
      description:
        "Payment infrastructure for unreliable networks. Offline transaction infrastructure with controlled risk and automatic reconciliation, sold as a service to PSPs, banks, mobile money operators and merchant platforms in Africa.",
    },
    howItWorks: {
      title: "How it works",
      description:
        "Vault, sign, scan, verify, sync. See how PayVault lets a payment be accepted and checked in under a second with no network, then reconciled later.",
    },
    product: {
      title: "Product",
      description:
        "A reliability layer and guaranteed offline acceptance: connectivity state machine, durable queue, reconciliation, offline vault and overdraft. Non-custodial by design.",
    },
    payLater: {
      title: "Offline overdraft and pay later",
      description:
        "Let customers pay even when their balance is short and the network is down. Funded value is spent first, then a small overdraft that becomes a short-term loan after sync.",
    },
    useCases: {
      title: "Use cases",
      description:
        "PSPs, POS networks, banks, mobile money operators, merchant platforms, transport ticketing, school payments, retail chains and field-agent networks.",
    },
    coverage: {
      title: "Coverage",
      description:
        "Country Packs turn currency, limits, KYC tiers, rails and data-protection rules into data. Fifteen African countries are configured at concept stage.",
    },
    developers: {
      title: "Developers",
      description:
        "REST API v1, webhooks and SDKs. Issue allowances, sync payments and receive reconciliation events in your own ledger.",
    },
    security: {
      title: "Security",
      description:
        "Threat model, cryptography choices and the non-custodial model. Double-spend is bounded, always detected and recovered from the KYC'd holder.",
    },
    pricing: {
      title: "Pricing",
      description:
        "An integration fee, a platform fee, usage-based pricing per active device or settled transaction, and enterprise support. Contact us about a pilot.",
    },
    about: {
      title: "About",
      description:
        "Payment infrastructure for unreliable networks. PayVault is an early-stage company building offline transaction infrastructure for Africa. What we are building, what we are not, and how we work.",
    },
    contact: {
      title: "Request a pilot",
      description:
        "Tell us about your organisation and your market. We reply to every pilot request personally.",
    },
  },

  nav: {
    product: "Product",
    howItWorks: "How it works",
    payLater: "Pay later",
    useCases: "Use cases",
    coverage: "Coverage",
    developers: "Developers",
    pricing: "Pricing",
    openApp: "Open app",
    console: "Partner console",
    menu: "Menu",
    closeMenu: "Close menu",
    primary: "Primary",
    language: "Language",
    skip: "Skip to content",
    switchTo: "Français",
    switchLabel: "Read this page in French",
  },

  footer: {
    blurb:
      "Payment infrastructure for unreliable networks. Sold as a service to licensed partners.",
    disclaimer:
      "PayVault is a technology provider. It is not a bank, a wallet or a money transmitter, and it never holds customer funds.",
    productTitle: "Product",
    companyTitle: "Company",
    resourcesTitle: "Resources",
    security: "Security",
    about: "About",
    contact: "Contact",
    docs: "Docs",
    rights: "© {year} PayVault",
    privacy: "Privacy",
    terms: "Terms",
    status: "Early stage. Country data is at concept status.",
  },

  notFound: {
    eyebrow: "404",
    title: "This page isn't here.",
    body: "The link may be old or mistyped. Everything else still works, with or without signal.",
    home: "Back to home",
  },

  common: {
    requestPilot: "Request a pilot",
    seeHow: "See how it works",
    readDocs: "Read the docs",
    seeCoverage: "See coverage",
    illustrative: "Illustrative figures and screens.",
    partners: "Licensed partners",
    status: "Status",
    available: "Available",
    planned: "Planned",
    inPreview: "In preview",
  },

  mock: {
    offline: "No signal",
    greeting: "Offline Vault",
    vaultNote: "Locked with your partner",
    overdraft: "Overdraft available",
    overdraftNote: "Extended by your partner",
    pay: "Pay",
    request: "Request",
    recent: "Recent payments",
    payments: [
      { name: "Market stall", meta: "Signed offline, 09:12", amount: "-1,500" },
      { name: "Bus fare", meta: "Signed offline, 07:40", amount: "-500" },
      { name: "Pharmacy", meta: "Synced, yesterday", amount: "-3,200" },
    ],
    currency: "XOF",
    vaultAmount: "18,000",
    overdraftAmount: "4,000",
    caption: "Illustrative screen. Amounts are sample data.",
    scanToPay: "Scan to pay",
    screen: {
      initials: "AK",
      hello: "Hello, Aminata",
      balance: "Your balance",
      balanceAmount: "XOF 42,500",
      topUp: "Top up",
      request: "Request",
      pay: "Pay",
      vault: "Offline Vault",
      vaultAmount: "XOF 18,000",
      ready: "Ready offline",
      expires: "Expires Oct 2",
      activity: "Recent activity",
      seeAll: "See all",
      rows: [
        { title: "Paid Market stall", date: "Today, 09:12", amount: "−XOF 1,500", incoming: false, pending: "Pending" },
        { title: "From Kofi", date: "Today, 08:05", amount: "+XOF 5,000", incoming: true, pending: "" },
        { title: "Paid Pharmacy", date: "Yesterday", amount: "−XOF 3,200", incoming: false, pending: "" },
      ],
      home: "Home",
    },
  },

  flow: {
    title: "One payment, two scans, no network",
    lead: "The merchant and the payer never need a connection to each other or to a server.",
    merchant: "Merchant",
    payer: "Payer",
    anyone: "Either device",
    steps: [
      {
        actor: "merchant",
        title: "Show the request",
        body: "The merchant device shows a QR with the amount, currency and a one-time request number.",
      },
      {
        actor: "payer",
        title: "Scan and confirm",
        body: "The payer scans, sees the amount, and confirms with their PIN.",
      },
      {
        actor: "payer",
        title: "Sign and show",
        body: "The phone signs the payment with its hardware-backed key and shows a payment QR.",
      },
      {
        actor: "merchant",
        title: "Verify in under a second",
        body: "The merchant scans and checks everything offline: issuer signature, payer signature, limits, replay and chain.",
      },
      {
        actor: "anyone",
        title: "Sync when there is signal",
        body: "The first device to get a connection uploads. Settlement follows to the partner ledger.",
      },
    ],
  },

  layers: {
    title: "Seven layers, each with one job",
    lead: "A small, auditable protocol. Every layer can be reviewed, tested and replaced on its own.",
    items: [
      { name: "Identity & Keys", body: "A device key pair in the hardware keystore, attested at enrolment." },
      { name: "Allowance", body: "A partner-signed certificate: device key, cap, currency, expiry, allowance ID." },
      { name: "Payment", body: "A payer-signed payment with a sequence number, a running total and the previous payment's hash." },
      { name: "Transport", body: "QR first. NFC and Bluetooth next. SMS and USSD fallbacks planned." },
      { name: "Queue & Sync", body: "A durable encrypted queue that uploads whenever any device gets signal." },
      { name: "Reconciliation & Risk", body: "Deduplicate, detect forks, apply limits and velocity rules, revoke keys." },
      { name: "Settlement", body: "Batches to the partner ledger, domestic rails, or PAPSS for cross-border." },
    ],
  },

  twoLayers: {
    eyebrow: "Two layers, one integration",
    title: "Reliability first. Guaranteed offline acceptance on top.",
    lead: "Offline transaction infrastructure with controlled risk and automatic reconciliation. Start with the reliability layer, then add guaranteed acceptance where it pays off.",
    reliability: {
      tag: "Layer A",
      title: "Reliability layer",
      body: "Keeps every transaction safe through connectivity loss, whatever the payment method underneath.",
      statesLabel: "Connectivity state machine",
      states: ["Online", "Degraded", "Offline", "Reconnecting", "Reconciling", "Settled"],
      points: [
        "Durable local queue on the device",
        "Idempotent signed transaction envelopes",
        "Automatic retry with back-off",
        "Duplicate and conflict detection",
        "Reconciliation against your ledger",
        "Monitoring dashboard in the Partner Console",
      ],
    },
    acceptance: {
      tag: "Layer B",
      title: "Guaranteed offline acceptance",
      body: "Lets a merchant accept a payment with no network, with risk that is bounded and priced.",
      points: [
        "Pre-funded Offline Vault, locked at the partner",
        "Optional offline overdraft on top",
        "Merchant verifies offline in under a second",
        "Risk bounded by caps, limits and expiry",
        "Double-spend detected as a fork at reconciliation, then recovered",
      ],
    },
  },

  home: {
    hero: {
      eyebrow: "Payment infrastructure for unreliable networks.",
      line1: "No signal.",
      line2: "Still paid.",
      lead: "Payments and pay-later that don't wait for the network. PayVault is offline transaction infrastructure with controlled risk and automatic reconciliation, for PSPs, POS networks, banks and mobile money operators.",
      fine: "Sold as a service to licensed partners. PayVault is not a bank or a wallet and never holds customer funds.",
    },
    tagline: {
      title: "Pay offline. Settle later. Lose nothing.",
      items: [
        {
          title: "Pay offline",
          body: "Payer and merchant exchange two QR codes. No server, no data, no waiting for a bar of signal.",
        },
        {
          title: "Settle later",
          body: "Payments queue safely on the device. Whichever device gets a connection first syncs for both.",
        },
        {
          title: "Lose nothing",
          body: "Merchants are guaranteed for payments that pass the offline checks. Fraud is detected and recovered.",
        },
      ],
    },
    problem: {
      eyebrow: "The problem",
      title: "Networks fail. Commerce does not stop.",
      body: "Markets, buses, rural clinics and border posts keep trading when the signal drops. Today those sales are lost, delayed or done in cash that no one can trace. Partners lose transactions, and customers lose trust.",
      points: [
        { title: "Lost sales", body: "A customer with money in an account still cannot pay when the terminal cannot reach the server." },
        { title: "Cash by default", body: "Cash is the offline fallback, and it is untraceable, risky to carry and outside your ecosystem." },
        { title: "Short of a few coins", body: "The customer is a little short, the network is down, and the sale is gone. Pay later needs a live connection today." },
      ],
    },
    flowEyebrow: "How it works",
    payLater: {
      eyebrow: "Offline overdraft",
      title: "Pay later, even with no signal.",
      body: "On top of the funded vault, your partner can extend a small credit line into the same allowance. Customers keep paying when their balance runs short, and the network stays out of it.",
      points: [
        "Funded value is spent first, then the overdraft.",
        "After sync, the overdraft becomes a short-term loan with a fee and a due date, for example 14 days.",
        "It is repaid automatically from incoming funds.",
        "The limit depends on the customer's KYC tier and repayment history.",
      ],
      cta: "Explore pay later",
    },
    audience: {
      eyebrow: "Who it is for",
      title: "Built for the businesses that already run the payments.",
      lead: "You own the customer, the brand, the licence and the funds. PayVault supplies the reliability and offline rails underneath.",
      items: [
        { title: "PSPs and POS networks", body: "Keep terminals transacting through outages and reconcile automatically when they reconnect." },
        { title: "Banks", body: "Offline acceptance for your merchants and app users, inside your own ledger." },
        { title: "Mobile money operators", body: "Keep agents and merchants transacting through network outages." },
        { title: "Merchant platforms and retail chains", body: "Take payments in stores and pop-ups with poor coverage." },
        { title: "Transport ticketing", body: "Fares on buses and ferries that stay offline all day." },
        { title: "Schools and field-agent networks", body: "School fees, cash collection and disbursement in low-connectivity areas." },
      ],
    },
    honest: {
      eyebrow: "Honest by design",
      title: "Offline double-spend is bounded, detected and recovered.",
      body: "No system can fully prevent a cloned phone from spending twice while offline. We do not pretend otherwise. We make it hard, we cap the damage, and we always catch it.",
      items: [
        { title: "Bounded", body: "Limits, caps and expiry mean the most anyone can double-spend is their own allowance." },
        { title: "Detected", body: "A double-spend breaks the hash chain. At reconciliation it shows as a cryptographic fork, with both signed payments as proof." },
        { title: "Recovered", body: "The key is revoked, the merchant is still paid from a risk pool, and the loss is recovered from the KYC'd holder." },
      ],
      cta: "Read the security model",
    },
    surfaces: {
      eyebrow: "Product",
      title: "One protocol, four surfaces.",
      items: [
        { title: "Reference app", body: "A white-label wallet and merchant PWA that partners can ship or use as a template.", status: "Available" },
        { title: "Partner Console", body: "Exposure, reconciliation, fork alerts and country configuration.", status: "Available" },
        { title: "REST API and webhooks", body: "Issue allowances, sync payments, receive events.", status: "Available" },
        { title: "SDKs", body: "Web now. Android, iOS and USSD/SIM planned.", status: "Web available" },
      ],
    },
    coverage: {
      eyebrow: "Coverage",
      title: "Pan-African by configuration, not by rewrite.",
      body: "Per-country rules live in data we call Country Packs: currency, limits, KYC tiers, rails and data protection. Adding a market is a configuration and partner task.",
      countries: "countries configured",
      currencies: "currencies",
      regions: "regions",
      note: "All packs are at concept status. Limits are illustrative and are not regulatory approvals.",
      cta: "See coverage",
    },
    cta: {
      title: "No signal. Still paid.",
      body: "Tell us about your market. We are running pilots with a small number of licensed partners.",
    },
  },

  howItWorks: {
    hero: {
      eyebrow: "How it works",
      title: "Vault, sign, scan, verify, sync.",
      lead: "A user locks part of their balance into an Offline Vault. From then on, payments are signed on the phone and verified on the merchant's device, with no network in between.",
    },
    lifecycle: {
      title: "The life of an allowance",
      steps: [
        {
          title: "Lock",
          body: "The user moves part of their balance into an Offline Vault with their partner. That value is reserved at the partner and cannot be spent elsewhere.",
        },
        {
          title: "Certify",
          body: "The partner signs an allowance certificate bound to the user's phone key (ECDSA P-256). It states the cap, currency and expiry.",
        },
        {
          title: "Spend",
          body: "The phone signs each payment. Funded value is used first, then any overdraft the partner extended.",
        },
        {
          title: "Reconcile",
          body: "Payments sync, duplicates and forks are checked, and settlement is produced. Unused value is released back after the grace period.",
        },
      ],
    },
    verify: {
      title: "What the merchant checks, offline, in under a second",
      lead: "Everything below runs on the merchant's device with cached issuer keys and the last synced revocation list.",
      checks: [
        "The issuer signature on the allowance certificate",
        "The allowance is not expired or revoked, as of the last sync",
        "The payer's signature on the payment",
        "The merchant ID and request number match this sale",
        "The currency matches and the running total is within the cap",
        "Sequence and running total are consistent with earlier payments from this allowance",
        "The previous-payment hash continues the chain",
      ],
    },
    doubleSpend: {
      title: "What happens if someone cheats",
      body: "Offline double-spend cannot be prevented with certainty. It can be made hard, bounded, detected and recovered. Here is each defence and what it buys you.",
      head: { defence: "Defence", effect: "Effect" },
      rows: [
        { defence: "Non-extractable device keys (hardware-backed and attested in native SDKs, planned)", effect: "Copying a device key out is hard; cloning a whole device is contained by caps and fork detection." },
        { defence: "Allowance cap, per-transaction limit, expiry", effect: "Caps the maximum loss." },
        { defence: "Hash-chained, sequenced payments", effect: "Any double-spend becomes a detectable fork." },
        { defence: "Merchant-side consistency checks", effect: "Blocks naive replays at the same merchant." },
        { defence: "Revocation list synced to merchants", effect: "Stops a known offender once merchants sync." },
        { defence: "KYC'd allowance holder", effect: "The loss is recovered from the offender." },
        { defence: "Risk pool guarantee", effect: "The merchant is paid regardless." },
      ],
    },
    sync: {
      title: "Sync happens whenever anyone has signal",
      body: "The merchant does not need to be the one who connects. Either device can upload the signed payment, and each payment is already signed, so relaying it cannot change it.",
      points: [
        { title: "Either side can settle", body: "If the merchant's device fails before it syncs, the payer's copy can still be uploaded." },
        { title: "Settlement, your way", body: "Batches go to your hosted ledger or your external ledger over the API and webhooks, over domestic rails, or through PAPSS for cross-border." },
      ],
    },
    cta: { title: "See it on your own network.", body: "A pilot can start in a sandbox with test money." },
  },

  product: {
    hero: {
      eyebrow: "Product",
      title: "Everything a partner needs to run offline payments.",
      lead: "One protocol and four surfaces, designed so that your customers see your brand and your ledger stays the source of truth.",
    },
    surfaces: [
      {
        title: "Reference app (white-label PWA)",
        status: "Available",
        body: "A progressive web app with a wallet mode for payers and a merchant mode for acceptance. Partners can ship it under their own brand or use it as a template for their own apps. It is not a consumer brand.",
        bullets: ["Offline Vault and overdraft balance", "Pay, request and scan with the camera", "Merchant queue with sync status"],
      },
      {
        title: "Partner Console",
        status: "Available",
        body: "Where risk, finance and operations teams see what is happening and configure how it behaves.",
        bullets: ["Outstanding offline exposure and pending sync", "Reconciliation and settlement", "Fork alerts with the two conflicting signed payments", "Country Pack and limit configuration"],
      },
      {
        title: "REST API v1 and webhooks",
        status: "Available",
        body: "Issue allowances, accept synced payments and receive events in your own systems. Your ledger stays authoritative.",
        bullets: ["Idempotent requests", "Signed webhook events", "Hosted ledger or external ledger"],
      },
      {
        title: "SDKs",
        status: "Web available. Android, iOS and USSD/SIM planned.",
        body: "Embed offline payments in your own app. The Web SDK is available now. Native SDKs will use the hardware keystore on each platform.",
        bullets: ["Web SDK", "Android (planned)", "iOS (planned)", "USSD / SIM (planned)"],
      },
    ],
    nonCustodial: {
      eyebrow: "Non-custodial by design",
      title: "Your licence. Your funds. Our rails.",
      body: "PayVault is a technology service provider. It is not a bank or a wallet. It never holds customer funds.",
      partnerTitle: "The partner",
      partner: ["Holds the licence and the customer relationship", "Holds the funds and the ledger", "Does KYC and sets limits", "Sets overdraft terms and fees"],
      payvaultTitle: "PayVault",
      payvault: ["Runs the offline protocol and SDKs", "Reconciles and detects forks", "Operates the risk pool and guarantee", "Produces settlement batches"],
    },
    cta: { title: "Try the sandbox.", body: "Free, with test money. No commitment." },
  },

  payLater: {
    hero: {
      eyebrow: "Offline overdraft",
      title: "Pay later that works without a network.",
      lead: "Some customers are a little short exactly when the network is down. Your partner can extend a small credit line into the same allowance, so the sale still happens.",
    },
    how: {
      title: "How it works",
      steps: [
        { title: "Extend", body: "Your partner adds an overdraft to the customer's allowance, sized by KYC tier and repayment history." },
        { title: "Spend", body: "Funded value is used first. Only when it runs out does the payment draw on the overdraft." },
        { title: "Sync", body: "When the payment reaches the server, the overdraft amount becomes a short-term loan with a fee and a due date." },
        { title: "Repay", body: "The loan is repaid automatically from incoming funds, for example the customer's next deposit." },
      ],
    },
    example: {
      title: "A worked example",
      note: "Illustrative numbers. Fees, terms and limits are set by the partner.",
      rows: [
        { label: "Funded vault", value: "10,000" },
        { label: "Overdraft extended", value: "3,000" },
        { label: "Purchase at the market", value: "11,500" },
        { label: "Paid from funded value", value: "10,000" },
        { label: "Paid from overdraft", value: "1,500" },
        { label: "After sync", value: "Short-term loan of 1,500 plus fee, due in 14 days" },
      ],
    },
    limit: {
      title: "What sets the credit limit",
      items: [
        { title: "KYC tier", body: "Higher verification, higher ceiling. Tiers are defined per country in the Country Pack." },
        { title: "Repayment history", body: "Customers who repay on time see their limit grow. Missed repayments lower it." },
        { title: "Partner policy", body: "Your risk team sets the caps, fees, due dates and which customers are eligible." },
      ],
    },
    guardrails: {
      title: "Guardrails",
      items: [
        "The overdraft sits inside the allowance cap, so exposure is bounded up front.",
        "Every offline payment is signed and chained, so repayment obligations are provable.",
        "Overdraft use is visible in the Partner Console, per customer and per country.",
        "Credit is extended by your licensed institution. PayVault supplies the mechanics, not the loan.",
      ],
    },
    lender: {
      title: "Your institution is the lender of record",
      body: "The licensed partner extends the credit, holds the loan and carries the credit risk. PayVault provides decisioning, limits and repayment tracking. PayVault does not lend and does not hold customer funds.",
    },
    cta: { title: "Add pay later to your offline payments.", body: "We will size an overdraft model with your risk team." },
  },

  useCases: {
    hero: {
      eyebrow: "Use cases",
      title: "Where offline matters most.",
      lead: "These are scenarios we are designing for. We are early, and we will name customers only when they agree to be named.",
    },
    labels: { scenario: "Scenario", benefit: "What changes" },
    cases: [
      {
        title: "PSPs and POS or terminal networks",
        scenario: "Terminals lose their link to the switch several times a day, and every failed attempt is a lost or duplicated sale.",
        benefit: "A durable local queue, signed idempotent transactions and automatic retry keep the terminal selling and reconcile without duplicates.",
      },
      {
        title: "Banks",
        scenario: "Card and app payments fail at merchants when the POS link drops.",
        benefit: "Accept offline payments from your own customers, with limits and KYC you control.",
      },
      {
        title: "Mobile money operators",
        scenario: "A regional outage cuts data to a market town. Agents and merchants stop transacting.",
        benefit: "Customers pay from an Offline Vault. Merchants verify on the spot and settle into your ledger after the outage.",
      },
      {
        title: "Merchant platforms and retail chains",
        scenario: "Your merchant app must keep taking payments in stores and pop-ups with poor coverage.",
        benefit: "Embed the SDK, call the REST API, and get reconciliation events by webhook.",
      },
      {
        title: "Transport ticketing",
        scenario: "A rural bus stays offline all day, and passengers arrive with little cash.",
        benefit: "Fares are signed and verified on board. A passenger's phone may sync first and relay for the conductor.",
      },
      {
        title: "School payments",
        scenario: "Parents pay fees and canteen charges where the bursar's office has unreliable connectivity.",
        benefit: "Payments are accepted on the spot and reconcile to the school's account when the network returns.",
      },
      {
        title: "Field-agent networks and cash transfers",
        scenario: "Agents and aid teams collect or disburse cash in areas where connectivity is intermittent for days.",
        benefit: "Recipients hold a capped allowance, spend at local vendors, and vendors are paid once anyone syncs.",
      },
      {
        title: "Cross-border traders",
        scenario: "Traders at a land border need to pay across a currency line with poor signal.",
        benefit: "Payments queue offline and settle later through PAPSS where the corridor supports it. This is a later phase.",
      },
    ],
    cta: { title: "Have a scenario in mind?", body: "Describe it and we will tell you honestly whether PayVault fits." },
  },

  coverage: {
    hero: {
      eyebrow: "Coverage",
      title: "Fifteen countries configured. All at concept stage.",
      lead: "Country Packs hold the rules of each market as data: currency, limits, KYC tiers, rails and data protection. This page is generated from those packs.",
    },
    stats: { countries: "Countries", currencies: "Currencies", regions: "Regions", concept: "At concept status" },
    regions: {
      west: "West Africa",
      east: "East Africa",
      central: "Central Africa",
      southern: "Southern Africa",
      north: "North Africa",
    },
    status: { concept: "Concept", pilot_ready: "Pilot ready", live: "Live" },
    card: {
      currency: "Currency",
      perTransaction: "Per payment",
      allowanceCap: "Allowance cap",
      rails: "Domestic rails",
      centralBank: "Central bank",
      dataLaw: "Data protection",
      papss: "PAPSS",
      papssYes: "Cross-border via PAPSS",
      bloc: "Bloc",
      residency: { none: "No residency rule", preferred: "Local hosting preferred", required: "Local hosting required" },
    },
    notice: {
      title: "What concept status means",
      body: "The limits shown are illustrative starting points. They are not regulatory approvals, and no country is live. Moving a pack to pilot-ready means agreeing limits with a licensed partner and its regulator.",
    },
    what: {
      title: "What a Country Pack contains",
      items: [
        "Currency, minor units and symbol",
        "Per-payment limit, allowance cap, allowance lifetime and payment count",
        "KYC tiers and the share of the cap each tier may use",
        "Domestic payment rails and cross-border options",
        "Languages, phone format and national ID systems",
        "Data-protection law, authority and residency level",
      ],
    },
    cta: { title: "Do not see your market?", body: "Adding a country is mostly configuration and a conversation with a partner." },
  },

  developers: {
    hero: {
      eyebrow: "Developers",
      title: "An API that stays out of your ledger's way.",
      lead: "Issue allowances, sync payments and receive events. Your systems remain the source of truth for balances.",
    },
    steps: [
      { title: "Issue an allowance", body: "Your backend asks PayVault to sign an allowance for a user's device key, after you lock the funds in your ledger." },
      { title: "Sync payments", body: "Devices upload signed, chained payments when they have signal. You get accepted, duplicate and fork results back." },
      { title: "Listen to events", body: "Webhooks tell your ledger when to settle, recover or revoke." },
    ],
    codeTitle: "Two calls to get going",
    codeNote: "Request shapes are shown for orientation. See the docs for the current reference.",
    codeLabels: { issue: "Issue an allowance", sync: "Sync payments", webhook: "Webhook event" },
    sdk: {
      title: "SDKs",
      items: [
        { name: "Web SDK", status: "Available" },
        { name: "Android (Kotlin)", status: "Planned" },
        { name: "iOS (Swift)", status: "Planned" },
        { name: "USSD / SIM", status: "Planned" },
      ],
    },
    principles: {
      title: "Built for integrators",
      items: [
        "Idempotent payment sync, so retries are safe",
        "Signed webhooks with replay protection",
        "Sandbox with test money and the same API",
        "Amounts as integers in minor units",
      ],
    },
    cta: { title: "Start in the sandbox.", body: "Free, with test money." },
  },

  security: {
    hero: {
      eyebrow: "Security",
      title: "Honest about what offline can and cannot promise.",
      lead: "The design goal is not perfect prevention. It is bounded loss, guaranteed detection and a clear path to recovery.",
    },
    custody: {
      title: "Non-custodial by design",
      body: "PayVault never holds customer funds. Value is locked at your institution, and the allowance certificate only authorises spending it. If PayVault disappeared tomorrow, your customers' money would still be in your ledger.",
    },
    threats: {
      title: "Threat model summary",
      head: { threat: "Threat", mitigation: "Mitigation" },
      rows: [
        { threat: "Cloned device or extracted key", mitigation: "Non-extractable keys (hardware keystore and attestation planned for native SDKs), low caps, fork detection and revocation." },
        { threat: "Replay to the same merchant", mitigation: "One-time request number and sequence checks." },
        { threat: "Replay to a different merchant", mitigation: "Each payment is bound to a merchant ID." },
        { threat: "Counter rollback on the device", mitigation: "The hash chain turns a rollback into a fork that reconciliation detects." },
        { threat: "Fake payment made by a merchant", mitigation: "Not possible without the payer's private key." },
        { threat: "Lost or stolen phone", mitigation: "PIN before signing. Remaining allowance is at risk like cash, is capped, and the key can be revoked." },
        { threat: "Expired or revoked allowance", mitigation: "Checked offline against the last synced list. Risk within the sync window is accepted and bounded." },
        { threat: "Coercion and scams", mitigation: "Low offline limits and merchant-bound payments." },
        { threat: "Merchant data loss before sync", mitigation: "Durable encrypted queue. The payer keeps a copy and can also sync it." },
      ],
    },
    crypto: {
      title: "Cryptography choices",
      items: [
        { name: "ECDSA P-256", body: "Supported natively by iOS Secure Enclave and Android StrongBox, so keys stay in hardware." },
        { name: "SHA-256", body: "Used for the hash chain that links each payment to the one before." },
        { name: "Fixed-layout binary encoding", body: "Deterministic, compact payloads: a full payment bundle is 276 bytes and fits in a single QR code." },
        { name: "Platform cryptography", body: "Signing and hashing use the platform's built-in WebCrypto, with no third-party crypto dependency." },
        { name: "Untrusted clocks", body: "Ordering comes from sequence numbers. Expiry allows a skew window." },
      ],
    },
    guarantee: {
      title: "The merchant guarantee",
      body: "A merchant who accepted a payment that passed every offline check gets paid. If a fork is later found, the key is revoked, the merchant is paid from the risk pool, and the loss is recovered from the KYC'd holder.",
    },
    status: {
      title: "Where we are",
      body: "PayVault is early. We have not completed an independent security audit, and we hold no certifications. We will publish results here when that changes.",
    },
    cta: { title: "Want the full threat model?", body: "We share it with prospective partners under NDA." },
  },

  metrics: {
    eyebrow: "Pilot metrics we measure",
    title: "What the console tracks during a pilot.",
    lead: "These are the measures we agree with each partner up front. They describe what we track, not results we have achieved.",
    note: "No results are published yet. We will share figures only from real pilots, with the partner's agreement.",
    items: [
      "Share of transactions affected by connectivity loss",
      "Recovery after reconnect",
      "Duplicate rate",
      "Reconciliation accuracy",
      "Median time to settle",
      "Transaction loss",
      "Offline fraud, bounded by policy",
      "Integration time",
    ],
  },

  pricing: {
    hero: {
      eyebrow: "Pricing",
      title: "Start free. Pay for what settles.",
      lead: "We are early, so we price with partners, not from a public rate card. No numbers are published yet.",
    },
    model: {
      title: "How pricing is built",
      lead: "Four parts, agreed with you during the pilot. Contact us for figures.",
      items: [
        { title: "Integration fee", body: "One-time work to connect PayVault to your ledger, terminals and Country Pack." },
        { title: "Platform fee", body: "Recurring fee for the Partner Console, monitoring, risk tooling and hosting." },
        { title: "Usage", body: "Priced per active device or terminal, or per settled offline transaction, whichever fits your model." },
        { title: "Enterprise support", body: "Dedicated support, reviews and service levels for regulated institutions." },
      ],
    },
    plans: [
      {
        name: "Sandbox",
        price: "Free",
        note: "Test money only",
        body: "Everything you need to build and demo.",
        features: ["Full REST API and webhooks", "Web app and Partner Console", "Simulated fork and revocation scenarios", "Test money, no live settlement"],
        cta: "Start in the sandbox",
        featured: "",
      },
      {
        name: "Growth",
        price: "Integration + platform + usage",
        note: "Contact us",
        body: "For partners running a pilot or a first market.",
        features: ["Usage per active device or settled transaction", "Live settlement to your ledger", "Overdraft and pay-later tooling", "Support during your pilot"],
        cta: "Request a pilot",
        featured: "For pilots",
      },
      {
        name: "Enterprise",
        price: "Custom",
        note: "Contact us",
        body: "For multi-country programmes and regulated institutions.",
        features: ["Custom terms and volumes", "Risk pool and guarantee terms", "Dedicated support and reviews", "Country Pack onboarding"],
        cta: "Talk to us",
        featured: "",
      },
    ],
    faq: {
      title: "Good to know",
      items: [
        { q: "What is a settled offline transaction?", a: "A payment made offline that has been synced, reconciled and passed to your ledger for settlement." },
        { q: "Are there setup fees or minimums?", a: "We will agree these with you during the pilot. Nothing is charged in the Sandbox." },
        { q: "Who sets the customer's fees and loan terms?", a: "You do. Overdraft fees and due dates are set by your institution." },
      ],
    },
    cta: { title: "Let us shape a pilot together.", body: "Tell us your market and volumes." },
  },

  about: {
    hero: {
      eyebrow: "About",
      title: "Payments should not depend on a bar of signal.",
      lead: "Payment infrastructure for unreliable networks. PayVault builds offline transaction infrastructure for Africa, sold as a service to licensed partners.",
    },
    mission: {
      title: "What we are building",
      body: "A small, open protocol and the tools around it, so that a bank, a mobile money operator or a fintech can let customers pay and pay later when the network is down, without giving up control of licences, funds or customers.",
    },
    principles: {
      title: "How we work",
      items: [
        { title: "Honest about limits", body: "Offline double-spend cannot be fully prevented. We say so and design for bounded loss." },
        { title: "Partners hold the licence", body: "We are a technology provider. We do not compete for your customers or hold their money." },
        { title: "Configuration over rewrites", body: "Each country is a Country Pack, not a fork of the product." },
        { title: "Small and auditable", body: "A compact protocol that partners and regulators can actually review." },
      ],
    },
    status: {
      title: "Where we are today",
      body: "We are at an early, concept-to-pilot stage. All country packs are at concept status. We have no public customers, and we will not claim any until partners agree.",
    },
    cta: { title: "Work with us.", body: "We would like to hear about your market." },
  },

  contact: {
    hero: {
      eyebrow: "Request a pilot",
      title: "Tell us about your market.",
      lead: "We are working with a small number of licensed partners. Share a few details and we will reply personally.",
    },
    form: {
      name: "Full name",
      email: "Work email",
      organisation: "Organisation",
      organisationType: "Organisation type",
      country: "Country",
      volume: "Monthly transaction volume",
      message: "How would you use PayVault?",
      choose: "Select…",
      submit: "Send request",
      sending: "Sending…",
      required: "Required",
      successTitle: "Thank you. We have your request.",
      successBody: "We will reply to your work email soon.",
      errorTitle: "We could not send your request.",
      errorBody: "Please check the form and try again, or try again in a moment.",
      another: "Send another request",
      privacy: "We use these details only to reply to your request.",
      invalidEmail: "Enter a valid email address.",
    },
    orgTypes: [
      { value: "bank", label: "Bank" },
      { value: "mmo", label: "Mobile money operator" },
      { value: "fintech", label: "Fintech" },
      { value: "psp", label: "PSP or POS network" },
      { value: "platform", label: "Merchant platform or retailer" },
      { value: "ngo", label: "NGO or field-agent network" },
      { value: "transit", label: "Transport or ticketing" },
      { value: "government", label: "Government" },
      { value: "other", label: "Other" },
    ],
    volumes: [
      { value: "unknown", label: "Not sure yet" },
      { value: "lt-10k", label: "Under 10,000" },
      { value: "10k-100k", label: "10,000 to 100,000" },
      { value: "100k-1m", label: "100,000 to 1 million" },
      { value: "gt-1m", label: "Over 1 million" },
    ],
    aside: {
      title: "What happens next",
      items: [
        "We read every request.",
        "We schedule a short call to understand your market and licence position.",
        "We set you up in the Sandbox, then shape a pilot.",
      ],
    },
  },
} as const;

export default site;

type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : T extends object
      ? { -readonly [K in keyof T]: Widen<T[K]> }
      : T;

export type SiteMessages = Widen<typeof site>;
