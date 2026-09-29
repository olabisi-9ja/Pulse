import { CloudUpload, QrCode, ScanLine, ShieldCheck, Signature } from "lucide-react";
import type { SiteMessages } from "@/messages/site";
import { QrPattern } from "./QrPattern";
import { Eyebrow } from "./ui";

const ICONS = [QrCode, ScanLine, Signature, ShieldCheck, CloudUpload];

/** Five-step payment flow, tagged by who acts. Horizontal on desktop, vertical on mobile. */
export function FlowDiagram({ t, eyebrow }: { t: SiteMessages["flow"]; eyebrow?: string }) {
  const actorLabel = (a: string) => (a === "merchant" ? t.merchant : a === "payer" ? t.payer : t.anyone);
  const actorStyle = (a: string) =>
    a === "merchant" ? "bg-navy-soft text-navy" : a === "payer" ? "bg-green-soft text-green" : "bg-card-2 text-muted border border-line";
  return (
    <div>
      <div className="max-w-3xl">
        {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
        <h2 className="font-display text-3xl font-extrabold leading-[1.1] text-navy text-balance sm:text-4xl lg:text-[2.75rem]">
          {t.title}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{t.lead}</p>
      </div>

      <ol className="mt-10 grid gap-4 lg:grid-cols-5">
        {t.steps.map((s, i) => {
          const Icon = ICONS[i] ?? QrCode;
          return (
            <li key={s.title} className="relative flex gap-4 rounded-3xl border border-line bg-card p-5 lg:flex-col lg:gap-3">
              <div className="flex shrink-0 items-center gap-3 lg:justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green text-on-accent" aria-hidden>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="tabular font-display text-2xl font-black text-line lg:text-3xl" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="min-w-0">
                <span className={`mb-2 inline-flex rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold ${actorStyle(s.actor)}`}>
                  {actorLabel(s.actor)}
                </span>
                <h3 className="font-display text-base font-bold text-navy">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.body}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex items-center justify-center gap-6 rounded-3xl border border-dashed border-line bg-card-2 p-6 text-navy sm:gap-12" aria-hidden>
        <QrPattern seed={11} className="h-20 w-20 sm:h-24 sm:w-24" />
        <div className="h-px w-16 bg-green sm:w-32" />
        <QrPattern seed={42} className="h-20 w-20 text-green sm:h-24 sm:w-24" />
      </div>
    </div>
  );
}
