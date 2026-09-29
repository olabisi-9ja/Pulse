import Image from "next/image";
import type { Photo } from "@/lib/photos";

/** Rounded six-arm asterisk, the soft-green accent in the hero shape row. */
function Asterisk({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden className={className}>
      {[0, 60, 120].map((r) => (
        <rect key={r} x="78" y="4" width="44" height="192" rx="22" transform={`rotate(${r} 100 100)`} />
      ))}
    </svg>
  );
}

/**
 * The hero's shape row: people in stadium frames, a brand asterisk, and a
 * half-disc that runs off the right edge. Purely decorative apart from photo alt text.
 */
export function HeroShapes({ left, right }: { left: Photo | null; right: Photo | null }) {
  return (
    <div className="relative mt-14 grid grid-cols-[1fr_auto] items-center gap-4 sm:mt-16 sm:grid-cols-[1.25fr_0.7fr_1.25fr_0.45fr] sm:gap-6">
      <Stadium photo={left} />
      <Asterisk className="hidden aspect-square w-full fill-[#bfe6d6] sm:block" />
      <Stadium photo={right} className="hidden sm:block" />
      <div aria-hidden className="relative hidden h-full min-h-40 sm:block">
        <span className="absolute inset-y-0 left-0 w-[200%] rounded-l-full bg-[#14365a]" />
        <span className="absolute -top-10 left-1/3 h-16 w-[200%] rounded-l-full bg-[#2fb386]" />
      </div>
      <Asterisk className="w-20 fill-[#bfe6d6] sm:hidden" />
    </div>
  );
}

function Stadium({ photo, className = "" }: { photo: Photo | null; className?: string }) {
  return (
    <div className={`relative aspect-[16/10] overflow-hidden rounded-full bg-[#14365a] ${className}`}>
      {photo && <Image src={photo.src} alt={photo.alt} fill priority sizes="(min-width: 640px) 30vw, 70vw" className="object-cover" />}
    </div>
  );
}
