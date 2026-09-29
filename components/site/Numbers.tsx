import Image from "next/image";
import type { ReactNode } from "react";
import type { Photo } from "@/lib/photos";
import { QrPattern } from "./QrPattern";
import { Reveal } from "./Reveal";
import { Pilled } from "./ui";
import { Vignette, type VignetteKind } from "./Vignettes";

export type NumberRow = { value: string; label: string; visual?: VignetteKind | "qr" | "codes"; codes?: string[]; photo?: Photo | null };

/** Big figures, each with a short label and a product tile. Every figure is a fact about the product. */
export function Numbers({ title, note, rows, id }: { title: string; note?: string; rows: NumberRow[]; id: string }) {
  return (
    <div>
      <h2 id={id} className="font-display text-[clamp(2.4rem,6vw,4.5rem)] font-medium leading-[0.98] text-navy text-balance">
        <Pilled text={title} />
      </h2>
      <ul className="mt-14 divide-y divide-line border-y border-line">
        {rows.map((r, i) => (
          <li key={r.label}>
            <Reveal delay={i * 0.05} className="grid items-center gap-6 py-8 sm:grid-cols-[14rem_1fr_auto] sm:gap-10 sm:py-10">
              <p className="max-w-[14rem] text-sm font-medium text-ink">{r.label}</p>
              <p className="tabular font-display text-[clamp(4rem,12vw,9rem)] font-medium leading-[0.85] text-green">{r.value}</p>
              <Tile row={r} />
            </Reveal>
          </li>
        ))}
      </ul>
      {note && <p className="mt-6 max-w-2xl text-sm text-muted">{note}</p>}
    </div>
  );
}

function Tile({ row }: { row: NumberRow }) {
  let inner: ReactNode = null;
  if (row.photo) {
    inner = <Image src={row.photo.src} alt={row.photo.alt} fill sizes="240px" className="object-cover" />;
  } else if (row.visual === "qr") {
    inner = (
      <div className="w-32 rounded-2xl bg-white p-2.5 text-[#0b1411]">
        <QrPattern seed={42} className="h-full w-full" />
      </div>
    );
  } else if (row.visual === "codes") {
    inner = (
      <div className="grid grid-cols-5 gap-1.5 font-display text-[0.8rem] font-medium text-white">
        {(row.codes ?? []).map((c) => (
          <span key={c} className="grid h-8 w-8 place-items-center rounded-full bg-white/12">
            {c}
          </span>
        ))}
      </div>
    );
  } else if (row.visual) {
    inner = (
      <div className="origin-center scale-[0.78]">
        <Vignette kind={row.visual} />
      </div>
    );
  }
  return (
    <div aria-hidden={!row.photo} className="relative hidden h-44 w-60 items-center justify-center overflow-hidden rounded-[1.5rem] rounded-br-[4rem] bg-[#14365a] sm:flex">
      {inner}
    </div>
  );
}
