import type { SiteMessages } from "@/messages/site";
import { StackCards } from "./StackCards";
import type { VignetteKind } from "./Vignettes";
import { Eyebrow } from "./ui";

const VISUALS: VignetteKind[] = ["request", "scan", "sign", "verify", "sync"];

/** The payment flow as scroll-stacked cards, each tagged by who acts. */
export function FlowDiagram({ t, eyebrow }: { t: SiteMessages["flow"]; eyebrow?: string }) {
  const actorLabel = (a: string) => (a === "merchant" ? t.merchant : a === "payer" ? t.payer : t.anyone);
  return (
    <div>
      <div className="max-w-3xl">
        {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
        <h2 className="font-display text-3xl font-medium leading-[1.1] text-navy text-balance sm:text-4xl lg:text-[2.75rem]">
          {t.title}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{t.lead}</p>
      </div>
      <StackCards
        items={t.steps.map((s, i) => ({ title: s.title, body: s.body, tag: actorLabel(s.actor), visual: VISUALS[i] ?? "request" }))}
      />
    </div>
  );
}
