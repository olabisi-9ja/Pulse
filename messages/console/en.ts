/** English copy for the PayVault Partner Console. French must mirror this shape. */
export type ConsoleMessages = {
  nav: {
    overview: string;
    metrics: string;
    allowances: string;
    payments: string;
    risk: string;
    credit: string;
    users: string;
    developers: string;
    settings: string;
    docs: string;
    signOut: string;
    menu: string;
    close: string;
    partner: string;
    language: string;
    console: string;
    signedInAs: string;
  };
  common: {
    measured: string;
    search: string;
    apply: string;
    reset: string;
    all: string;
    previous: string;
    next: string;
    pageOf: string;
    results: string;
    none: string;
    never: string;
    yes: string;
    you: string;
    no: string;
    save: string;
    saving: string;
    cancel: string;
    back: string;
    id: string;
    status: string;
    country: string;
    currency: string;
    created: string;
    amount: string;
    role: string;
    actions: string;
    readOnly: string;
    ownerOnly: string;
    copy: string;
    copied: string;
    showOnce: string;
    open: string;
    definition: string;
    noData: string;
    window: string;
    days: string;
    total: string;
    error: string;
    confirm: string;
  };
  labels: {
    allowanceStatus: Record<string, string>;
    paymentStatus: Record<string, string>;
    via: Record<string, string>;
    fraudStatus: Record<string, string>;
    fraudKind: Record<string, string>;
    loanStatus: Record<string, string>;
    kyc: Record<string, string>;
    userStatus: Record<string, string>;
    role: Record<string, string>;
    kind: Record<string, string>;
    ledger: Record<string, string>;
    issuerStatus: Record<string, string>;
  };
  overview: {
    title: string;
    subtitle: string;
    activeVaults: string;
    activeVaultsHint: string;
    exposure: string;
    exposureHint: string;
    settled24: string;
    settled7: string;
    settledHint: string;
    overdraft: string;
    overdraftHint: string;
    openCases: string;
    openCasesHint: string;
    riskLoss: string;
    riskLossHint: string;
    recentEvents: string;
    noEvents: string;
    noEventsHint: string;
    payments: string;
    emptyTitle: string;
    emptyBody: string;
    viewDocs: string;
    eventCols: { time: string; type: string; detail: string; delivery: string };
    delivered: string;
    pending: string;
  };
  onboarding: {
    title: string;
    subtitle: string;
    name: string;
    namePlaceholder: string;
    kind: string;
    countries: string;
    countriesHint: string;
    ledgerMode: string;
    ledgerHosted: string;
    ledgerHostedHint: string;
    ledgerExternal: string;
    ledgerExternalHint: string;
    create: string;
    sandboxTitle: string;
    sandboxBody: string;
    sandboxButton: string;
    alreadyMember: string;
    goToConsole: string;
    kinds: Record<string, string>;
  };
  metrics: {
    title: string;
    subtitle: string;
    window: string;
    lastDays: string;
    payments: string;
    paymentsDef: string;
    channels: string;
    channelsDef: string;
    courier: string;
    merchant: string;
    payer: string;
    api: string;
    settleTime: string;
    settleTimeDef: string;
    median: string;
    p90: string;
    duplicates: string;
    duplicatesDef: string;
    notTracked: string;
    forkRate: string;
    forkRateDef: string;
    per10k: string;
    lossRate: string;
    lossRateDef: string;
    overdraftDrawn: string;
    overdraftDrawnDef: string;
    repayRate: string;
    repayRateDef: string;
    dueLoans: string;
    reconciliation: string;
    reconciliationDef: string;
    gapAllowances: string;
    gapPayments: string;
    noPaymentsWindow: string;
    noLoansDue: string;
    noLoansDrawn: string;
    seconds: string;
    fraudCases: string;
  };
  allowances: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    cols: { id: string; ref: string; holder: string; funded: string; credit: string; settled: string; payments: string; expires: string; status: string };
    emptyTitle: string;
    emptyBody: string;
    noMatch: string;
    detail: {
      certificate: string;
      settlement: string;
      chain: string;
      fraud: string;
      revoke: string;
      revokeConfirm: string;
      revokeReason: string;
      revokeReasonDefault: string;
      revoked: string;
      notFound: string;
      fields: {
        id: string;
        externalRef: string;
        holder: string;
        device: string;
        issuerKid: string;
        country: string;
        currency: string;
        funded: string;
        credit: string;
        perTx: string;
        maxPayments: string;
        issuedAt: string;
        expiresAt: string;
        closedAt: string;
        declared: string;
      };
      split: {
        settledFunded: string;
        settledCredit: string;
        loss: string;
        refunded: string;
        paymentsCount: string;
        remaining: string;
      };
      chainCols: { seq: string; id: string; amount: string; cumulative: string; split: string; via: string; deviceTime: string; receivedAt: string; status: string };
      noPayments: string;
      noFraud: string;
      gap: string;
    };
  };
  payments: {
    title: string;
    subtitle: string;
    cols: { id: string; allowance: string; seq: string; amount: string; split: string; via: string; deviceTime: string; receivedAt: string; status: string };
    splitFunded: string;
    splitCredit: string;
    splitRisk: string;
    emptyTitle: string;
    emptyBody: string;
    noMatch: string;
  };
  risk: {
    title: string;
    subtitle: string;
    cols: { kind: string; allowance: string; seq: string; payments: string; loss: string; status: string; opened: string; actions: string };
    emptyTitle: string;
    emptyBody: string;
    open: string;
    lossTotal: string;
    evidenceFork: string;
    evidenceOne: string;
    noEvidence: string;
    setStatus: string;
  };
  credit: {
    title: string;
    subtitle: string;
    outstanding: string;
    drawn: string;
    repaid: string;
    fees: string;
    cols: { user: string; allowance: string; principal: string; fee: string; repaid: string; due: string; status: string };
    emptyTitle: string;
    emptyBody: string;
    policy: string;
    policyHint: string;
    feeBps: string;
    feeBpsHint: string;
    termDays: string;
    termDaysHint: string;
    savePolicy: string;
    policySaved: string;
  };
  users: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    cols: { user: string; country: string; kyc: string; merchant: string; joined: string; status: string; actions: string };
    approveTier2: string;
    freeze: string;
    unfreeze: string;
    freezeConfirm: string;
    emptyTitle: string;
    emptyBody: string;
    noMatch: string;
    merchant: string;
  };
  developers: {
    title: string;
    subtitle: string;
    docs: string;
    apiKeys: string;
    apiKeysHint: string;
    keyName: string;
    keyNamePlaceholder: string;
    createKey: string;
    keyCreated: string;
    keyCols: { name: string; prefix: string; created: string; lastUsed: string; status: string };
    revoke: string;
    revokeConfirm: string;
    revokedOn: string;
    noKeys: string;
    issuerKeys: string;
    issuerKeysHint: string;
    issuerCols: { kid: string; status: string; created: string; retired: string };
    rotate: string;
    rotateConfirm: string;
    noIssuer: string;
    webhook: string;
    webhookHint: string;
    webhookUrl: string;
    webhookSecret: string;
    secretSet: string;
    secretNotSet: string;
    saveWebhook: string;
    generateSecret: string;
    generateSecretConfirm: string;
    secretCreated: string;
    deliveries: string;
    deliveriesCols: { time: string; type: string; delivered: string; attempts: string; error: string };
    noDeliveries: string;
    signingHint: string;
  };
  settings: {
    title: string;
    subtitle: string;
    organisation: string;
    name: string;
    kind: string;
    countries: string;
    ledgerMode: string;
    ledgerLocked: string;
    slug: string;
    saveOrg: string;
    members: string;
    membersHint: string;
    memberCols: { member: string; role: string; added: string; actions: string };
    addMember: string;
    memberEmail: string;
    memberRole: string;
    add: string;
    remove: string;
    removeConfirm: string;
    unknownUser: string;
    ownerHint: string;
  };
};

const en: ConsoleMessages = {
  nav: {
    overview: "Overview",
    metrics: "Pilot metrics",
    allowances: "Allowances",
    payments: "Payments",
    risk: "Risk & fraud",
    credit: "Credit & loans",
    users: "Users & KYC",
    developers: "Developers",
    settings: "Settings",
    docs: "Documentation",
    signOut: "Sign out",
    menu: "Open menu",
    close: "Close menu",
    partner: "Partner",
    language: "Language",
    console: "Partner Console",
    signedInAs: "Signed in as",
  },
  common: {
    measured: "Measured from your data",
    search: "Search",
    apply: "Apply",
    reset: "Reset",
    all: "All",
    previous: "Previous",
    next: "Next",
    pageOf: "Page {page} of {pages}",
    results: "{n} results",
    none: "None",
    never: "Never",
    yes: "Yes",
    you: "You",
    no: "No",
    save: "Save",
    saving: "Working…",
    cancel: "Cancel",
    back: "Back",
    id: "ID",
    status: "Status",
    country: "Country",
    currency: "Currency",
    created: "Created",
    amount: "Amount",
    role: "Role",
    actions: "Actions",
    readOnly: "You have read-only access. Owners and admins can make changes.",
    ownerOnly: "Only the owner can do this.",
    copy: "Copy",
    copied: "Copied",
    showOnce: "Copy it now. For your security it is shown only once.",
    open: "Open",
    definition: "How it is measured",
    noData: "No data yet",
    window: "Window",
    days: "{n} days",
    total: "Total",
    error: "Something went wrong",
    confirm: "Are you sure?",
  },
  labels: {
    allowanceStatus: { active: "Active", closing: "Closing", closed: "Closed", revoked: "Revoked" },
    paymentStatus: { settled: "Settled", flagged: "Flagged" },
    via: { merchant: "Merchant", payer: "Payer", api: "API", courier: "Courier" },
    fraudStatus: { open: "Open", recovered: "Recovered", written_off: "Written off" },
    fraudKind: {
      fork: "Double-spend (fork)",
      chain_break: "Broken chain",
      overspend: "Overspend",
      after_close: "Spend after close",
    },
    loanStatus: { open: "Open", overdue: "Overdue", repaid: "Repaid", written_off: "Written off" },
    kyc: { tier0: "Tier 0", tier1: "Tier 1", tier2: "Tier 2" },
    userStatus: { active: "Active", frozen: "Frozen" },
    role: { owner: "Owner", admin: "Admin", analyst: "Analyst" },
    kind: {
      bank: "Bank",
      mmo: "Mobile money operator",
      fintech: "Fintech",
      psp: "Payment service provider",
      ngo: "NGO",
      sandbox: "Sandbox",
    },
    ledger: { hosted: "Hosted by PayVault", external: "External (your ledger)" },
    issuerStatus: { active: "Active", retired: "Retired", revoked: "Revoked" },
  },
  overview: {
    title: "Overview",
    subtitle: "Live position of your offline payment programme.",
    activeVaults: "Active vaults",
    activeVaultsHint: "Allowances currently usable offline",
    exposure: "Offline exposure",
    exposureHint: "Funded plus credit not yet settled, on active vaults",
    settled24: "Settled, last 24 hours",
    settled7: "Settled, last 7 days",
    settledHint: "{n} payments",
    overdraft: "Overdraft outstanding",
    overdraftHint: "Principal and fees not yet repaid on open and overdue loans",
    openCases: "Open fraud cases",
    openCasesHint: "Awaiting recovery or write-off",
    riskLoss: "Risk-pool loss",
    riskLossHint: "Value settled from the risk pool, all time",
    recentEvents: "Recent events",
    noEvents: "No events yet",
    noEventsHint: "Events appear here as vaults are issued and payments settle.",
    payments: "payments",
    emptyTitle: "Your programme is ready",
    emptyBody: "Nothing has happened yet. Create an API key, register a webhook and issue your first vault to see live numbers here.",
    viewDocs: "Read the integration guide",
    eventCols: { time: "Time", type: "Event", detail: "Detail", delivery: "Webhook" },
    delivered: "Delivered",
    pending: "Pending",
  },
  onboarding: {
    title: "Set up your organisation",
    subtitle: "Create a partner organisation to start issuing offline vaults. You will be its owner.",
    name: "Organisation name",
    namePlaceholder: "e.g. Acme Bank",
    kind: "Organisation type",
    countries: "Countries of operation",
    countriesHint: "Select every country where you will offer offline payments.",
    ledgerMode: "Ledger mode",
    ledgerHosted: "Hosted",
    ledgerHostedHint: "PayVault keeps the double-entry ledger for wallets and vaults.",
    ledgerExternal: "External",
    ledgerExternalHint: "You keep the ledger. PayVault issues vaults through your API calls and reports settlements.",
    create: "Create organisation",
    sandboxTitle: "PayVault team",
    sandboxBody: "Your email is on the administrator list. You can join the shared sandbox organisation as its owner.",
    sandboxButton: "Join PayVault Sandbox as owner",
    alreadyMember: "You already belong to an organisation.",
    goToConsole: "Go to the console",
    kinds: { bank: "Bank", mmo: "Mobile money operator", fintech: "Fintech", psp: "Payment service provider", ngo: "NGO" },
  },
  metrics: {
    title: "Pilot metrics",
    subtitle: "The numbers that show whether offline payments work for your customers.",
    window: "Window",
    lastDays: "Last {n} days",
    payments: "Payments received",
    paymentsDef: "Payments recorded by PayVault in the window (by received-at time), settled and flagged.",
    channels: "How payments reached PayVault",
    channelsDef: "Share of payments by the channel that delivered them: courier (a third party carrying them), merchant, payer, or API.",
    courier: "Courier",
    merchant: "Merchant",
    payer: "Payer",
    api: "API",
    settleTime: "Time to settle",
    settleTimeDef: "Received-at minus the time on the payer's device when the payment was made. Negative values (device clock ahead) are excluded.",
    median: "Median",
    p90: "90th percentile",
    duplicates: "Duplicate submissions",
    duplicatesDef: "Duplicates are accepted idempotently and are not stored, so this cannot be measured from your data today.",
    notTracked: "Not tracked",
    forkRate: "Fraud rate",
    forkRateDef: "Fraud cases opened in the window per 10,000 payments received. Forks (double-spends) are shown separately.",
    per10k: "per 10,000 payments",
    lossRate: "Risk-pool loss",
    lossRateDef: "Value settled from the risk pool divided by total payment volume in the window, per currency.",
    overdraftDrawn: "Overdraft drawn",
    overdraftDrawnDef: "Principal of loans created in the window, per currency.",
    repayRate: "Repayment rate",
    repayRateDef: "Of loans falling due in the window, the share fully repaid on or before the due date. Written-off and still-unpaid loans count as not repaid.",
    dueLoans: "{repaid} of {due} loans due",
    reconciliation: "Reconciliation",
    reconciliationDef: "Vaults with payments in the window where the number of payments received is lower than the highest sequence number seen. This means at least one payment has not arrived yet.",
    gapAllowances: "Vaults with a chain gap",
    gapPayments: "Payments in those vaults",
    noPaymentsWindow: "No payments in this window.",
    noLoansDue: "No loans fell due in this window.",
    noLoansDrawn: "No overdraft drawn in this window.",
    seconds: "s",
    fraudCases: "{n} fraud cases, {forks} forks",
  },
  allowances: {
    title: "Allowances",
    subtitle: "Offline vaults issued for your users and devices.",
    searchPlaceholder: "Search by ID or external reference",
    cols: { id: "Vault", ref: "External ref", holder: "Holder", funded: "Funded", credit: "Credit", settled: "Settled", payments: "Payments", expires: "Expires", status: "Status" },
    emptyTitle: "No allowances yet",
    emptyBody: "Vaults appear here once you issue them from the app or through the API.",
    noMatch: "No allowance matches these filters.",
    detail: {
      certificate: "Certificate",
      settlement: "Settlement",
      chain: "Payment chain",
      fraud: "Fraud cases",
      revoke: "Revoke vault",
      revokeConfirm: "Revoke this vault? Devices will stop accepting it once they sync the revocation list.",
      revokeReason: "Reason",
      revokeReasonDefault: "partner_revoked",
      revoked: "This vault is revoked.",
      notFound: "Allowance not found",
      fields: {
        id: "Vault ID",
        externalRef: "External reference",
        holder: "Holder",
        device: "Device key",
        issuerKid: "Issuer key (kid)",
        country: "Country",
        currency: "Currency",
        funded: "Funded",
        credit: "Credit line",
        perTx: "Per-payment limit",
        maxPayments: "Maximum payments",
        issuedAt: "Issued",
        expiresAt: "Expires",
        closedAt: "Closed",
        declared: "Declared at close",
      },
      split: {
        settledFunded: "Settled from funded",
        settledCredit: "Settled from credit",
        loss: "Settled from risk pool",
        refunded: "Refunded",
        paymentsCount: "Payments settled",
        remaining: "Remaining offline",
      },
      chainCols: { seq: "Seq", id: "Payment", amount: "Amount", cumulative: "Cumulative", split: "Funded / credit / pool", via: "Via", deviceTime: "Device time", receivedAt: "Received", status: "Status" },
      noPayments: "No payments have been received for this vault.",
      noFraud: "No fraud cases for this vault.",
      gap: "Chain gap: {count} payments received but the highest sequence is {max}. Some payments have not arrived yet.",
    },
  },
  payments: {
    title: "Payments",
    subtitle: "Every payment received, newest first.",
    cols: { id: "Payment", allowance: "Vault", seq: "Seq", amount: "Amount", split: "Split", via: "Via", deviceTime: "Made on device", receivedAt: "Received", status: "Status" },
    splitFunded: "funded",
    splitCredit: "credit",
    splitRisk: "pool",
    emptyTitle: "No payments yet",
    emptyBody: "Payments appear once merchants or couriers sync them to PayVault.",
    noMatch: "No payment matches these filters.",
  },
  risk: {
    title: "Risk & fraud",
    subtitle: "Double-spends, broken chains and overspends detected on your vaults.",
    cols: { kind: "Type", allowance: "Vault", seq: "Seq", payments: "Evidence", loss: "Loss", status: "Status", opened: "Opened", actions: "Resolution" },
    emptyTitle: "No fraud detected",
    emptyBody: "When PayVault detects a conflict it opens a case here with the evidence.",
    open: "{n} open",
    lossTotal: "Recorded loss",
    evidenceFork: "Two conflicting payments both claim sequence {seq}:",
    evidenceOne: "Payment involved:",
    noEvidence: "Detected from the vault totals, no single payment.",
    setStatus: "Set status",
  },
  credit: {
    title: "Credit & loans",
    subtitle: "Offline overdraft drawn by your users and how it is repaid.",
    outstanding: "Outstanding",
    drawn: "Principal drawn",
    repaid: "Repaid",
    fees: "Fees charged",
    cols: { user: "User", allowance: "Vault", principal: "Principal", fee: "Fee", repaid: "Repaid", due: "Due", status: "Status" },
    emptyTitle: "No loans yet",
    emptyBody: "A loan is created when a payment spends the overdraft part of a vault.",
    policy: "Credit policy",
    policyHint: "Applies to overdraft drawn from now on. Existing loans keep their terms.",
    feeBps: "Fee (basis points)",
    feeBpsHint: "200 basis points is 2% of the amount drawn. From 0 to 5000.",
    termDays: "Term (days)",
    termDaysHint: "Days between the draw and the due date. From 1 to 90.",
    savePolicy: "Save policy",
    policySaved: "Policy saved",
  },
  users: {
    title: "Users & KYC",
    subtitle: "People registered under your organisation.",
    searchPlaceholder: "Search by name or email",
    cols: { user: "User", country: "Country", kyc: "KYC tier", merchant: "Merchant", joined: "Joined", status: "Status", actions: "Actions" },
    approveTier2: "Approve Tier 2",
    freeze: "Freeze",
    unfreeze: "Unfreeze",
    freezeConfirm: "Freeze this user? They will not be able to open new vaults.",
    emptyTitle: "No users yet",
    emptyBody: "Users appear here after they sign up through your app or programme.",
    noMatch: "No user matches these filters.",
    merchant: "Merchant",
  },
  developers: {
    title: "Developers",
    subtitle: "Keys, signing and webhooks for your integration.",
    docs: "Open the documentation",
    apiKeys: "API keys",
    apiKeysHint: "Authenticate server-to-server calls with a Bearer token.",
    keyName: "Key name",
    keyNamePlaceholder: "e.g. Production backend",
    createKey: "Create key",
    keyCreated: "New API key",
    keyCols: { name: "Name", prefix: "Prefix", created: "Created", lastUsed: "Last used", status: "Status" },
    revoke: "Revoke",
    revokeConfirm: "Revoke this key? Requests using it will fail immediately.",
    revokedOn: "Revoked",
    noKeys: "No API keys yet.",
    issuerKeys: "Issuer keys",
    issuerKeysHint: "Sign the certificates of your vaults. Rotating retires the active key; existing vaults stay valid until they expire.",
    issuerCols: { kid: "Key ID", status: "Status", created: "Created", retired: "Retired" },
    rotate: "Rotate issuer key",
    rotateConfirm: "Rotate the issuer key? New vaults will be signed with a new key.",
    noIssuer: "No issuer key yet. One is created automatically when you issue the first vault.",
    webhook: "Webhook",
    webhookHint: "PayVault posts signed JSON events to this URL.",
    webhookUrl: "Endpoint URL",
    webhookSecret: "Signing secret",
    secretSet: "A secret is set. It cannot be shown again.",
    secretNotSet: "No secret set. Events are sent unsigned.",
    saveWebhook: "Save URL",
    generateSecret: "Generate new secret",
    generateSecretConfirm: "Generate a new secret? The old one stops working immediately.",
    secretCreated: "New signing secret",
    deliveries: "Recent deliveries",
    deliveriesCols: { time: "Created", type: "Event", delivered: "Delivered", attempts: "Attempts", error: "Last error" },
    noDeliveries: "No events yet.",
    signingHint: "Verify the x-payvault-signature header: HMAC-SHA256 of timestamp.body.",
  },
  settings: {
    title: "Settings",
    subtitle: "Your organisation and who can access it.",
    organisation: "Organisation",
    name: "Name",
    kind: "Type",
    countries: "Countries",
    ledgerMode: "Ledger mode",
    ledgerLocked: "Locked because payments already exist.",
    slug: "Identifier",
    saveOrg: "Save changes",
    members: "Members",
    membersHint: "Owners manage everything, admins operate the programme, analysts have read-only access.",
    memberCols: { member: "Member", role: "Role", added: "Added", actions: "Actions" },
    addMember: "Add a member",
    memberEmail: "Email of an existing PayVault user",
    memberRole: "Role",
    add: "Add member",
    remove: "Remove",
    removeConfirm: "Remove this member?",
    unknownUser: "Unknown user",
    ownerHint: "Only the owner can manage members.",
  },
};

export default en;
