import Image from "next/image";
import type { Photo } from "@/lib/photos";
import { Vignette, type VignetteKind } from "./Vignettes";

/** A real photo when one is licensed for this slot, otherwise a product visual on brand navy. */
export function PhotoOrVisual({ photo, visual, className = "" }: { photo: Photo | null; visual: VignetteKind; className?: string }) {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-[1.75rem] rounded-br-[5rem] bg-[#14365a] ${className}`}>
      {photo ? (
        <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
      ) : (
        <div aria-hidden className="scale-90 p-6">
          <Vignette kind={visual} />
        </div>
      )}
    </div>
  );
}
