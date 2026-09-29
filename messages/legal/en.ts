/** Privacy policy and terms. DRAFT: to be reviewed by counsel before any live pilot. */
export type LegalSection = { title: string; paras?: string[]; bullets?: string[] };
export type LegalDoc = { title: string; description: string; updated: string; sections: LegalSection[] };

const en = {
  draft: "Draft pending legal review. These pages describe how the PayVault reference service works today and will change before commercial launch.",
  updatedLabel: "Last updated",
  privacy: {
    title: "Privacy policy",
    description: "What PayVault collects, why, where it is stored and the choices you have.",
    updated: "29 September 2026",
    sections: [
      {
        title: "Who we are",
        paras: [
          "PayVault provides offline payment technology to licensed partners such as banks, mobile money operators and fintechs. When you use a wallet provided through a partner, that partner is responsible for your account and decides how your data is used. PayVault processes data on its behalf.",
          "For the pilot request form and this website, PayVault decides how data is used. You can reach us through the contact page.",
        ],
      },
      {
        title: "What we collect",
        bullets: [
          "Account: your email address, the name you enter, your country, currency and language.",
          "Identity checks: the type of ID you verify with and your resulting verification level. The ID number is checked and not stored.",
          "Device: the public half of the signing key created on your phone, and a short device label. The private key never leaves your phone.",
          "Payments: amounts, dates, the merchant or payer, offline payment records and loan records needed to settle and account for them.",
          "Pilot requests: the name, work email, organisation and details you send through the contact form.",
        ],
      },
      {
        title: "What we do not collect",
        bullets: [
          "No advertising or third-party analytics trackers.",
          "No location tracking.",
          "No payment card numbers.",
        ],
      },
      {
        title: "Why we use it",
        bullets: [
          "To run your wallet: sign-in, offline vaults, settlement and overdraft.",
          "To prevent and detect fraud, including double-spending checks.",
          "To meet the legal duties of the partner that provides your wallet.",
          "To reply to pilot requests.",
        ],
      },
      {
        title: "Where it is stored",
        paras: [
          "Data is stored with Supabase in London (United Kingdom) and the service is hosted by Vercel. Partners may require data to be kept in their own country; that is agreed per partner.",
        ],
      },
      {
        title: "Cookies and local storage",
        bullets: [
          "A sign-in session cookie, needed to keep you signed in.",
          "A language cookie (pv_locale) that remembers English or French.",
          "Your theme choice in local storage.",
          "On your phone, the wallet stores your signing key, offline vault and unsent payments so it works without a network.",
        ],
        paras: ["All of these are strictly necessary. We do not set marketing cookies, so there is no consent banner."],
      },
      {
        title: "How long we keep it",
        paras: [
          "Payment and ledger records are kept as long as the partner's financial record-keeping rules require. Pilot requests are deleted after 24 months without contact.",
        ],
      },
      {
        title: "Your rights",
        paras: [
          "You can ask for access to, correction of or deletion of your data, subject to the record-keeping duties above. For a wallet, contact the partner that provides it; for anything else, use the contact page.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms of use",
    description: "The terms that apply to the PayVault website, sandbox and reference wallet.",
    updated: "29 September 2026",
    sections: [
      {
        title: "About these terms",
        paras: [
          "These terms cover this website, the PayVault sandbox and the reference wallet. Commercial use by a partner is governed by a separate agreement signed with that partner.",
        ],
      },
      {
        title: "The sandbox",
        paras: [
          "The sandbox uses test money only. Balances have no value and can be reset at any time. Do not enter real identity numbers or real financial details.",
        ],
      },
      {
        title: "Offline payments",
        paras: [
          "Offline payments are signed on your phone and settle when a device reconnects. Offline spending is limited by your vault and its expiry. Double-spending is bounded by those limits, detected at settlement and recovered from the account holder.",
        ],
      },
      {
        title: "Overdraft",
        paras: [
          "Where offered, the overdraft is extended by the partner that provides your wallet, not by PayVault. It becomes a short loan with a fee and a due date once the payment settles, as shown before you approve it.",
        ],
      },
      {
        title: "Your responsibilities",
        bullets: [
          "Keep your phone and PIN secure.",
          "Do not attempt to copy signing keys, replay payments or spend beyond your vault.",
          "Do not use the service for anything unlawful.",
        ],
      },
      {
        title: "Availability and liability",
        paras: [
          "PayVault is early-stage software provided as is. We work to keep it available and correct but do not guarantee uninterrupted service. To the extent the law allows, PayVault is not liable for indirect losses.",
        ],
      },
      {
        title: "Changes",
        paras: ["We may update these terms. The date at the top shows the latest version."],
      },
    ],
  },
};

export type LegalMessages = typeof en;
export default en;
