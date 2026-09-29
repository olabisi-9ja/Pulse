/** PayVault shield mark. Colours follow the theme tokens, so it works in dark mode. */
export function LogoMark({ className = "h-8 w-8", title = "PayVault" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 240 250" className={className} role="img" aria-label={title}>
      <defs>
        <mask id="pv-mark-a" maskUnits="userSpaceOnUse" x="0" y="0" width="240" height="250">
          <rect width="240" height="250" fill="#fff" />
          <path d="M72 172.4 L167.5 79.6" stroke="#000" strokeWidth="30" fill="none" />
          <path d="M192 56 L181.4 94 L153.6 65.2 Z" stroke="#000" strokeWidth="14" strokeLinejoin="round" />
        </mask>
        <mask id="pv-mark-b" maskUnits="userSpaceOnUse" x="0" y="0" width="240" height="250">
          <rect width="240" height="250" fill="#fff" />
          <circle cx="120" cy="106" r="19" />
          <path d="M114 112 H126 L130 138 H110 Z" stroke="#000" strokeWidth="14" strokeLinejoin="round" />
        </mask>
      </defs>
      <g mask="url(#pv-mark-a)" fill="none">
        <path
          d="M120 30 L200 52 V116 C200 168 168 198 120 220 C72 198 40 168 40 116 V52 Z"
          stroke="var(--pv-green)"
          strokeWidth="16"
        />
        <path
          d="M120 64 L168 77 V118 C168 151 149 173 120 188 C91 173 72 151 72 118 V77 Z"
          stroke="var(--pv-navy)"
          strokeWidth="16"
        />
      </g>
      <g fill="var(--pv-navy)">
        <circle cx="120" cy="106" r="12" />
        <path d="M114 112 H126 L130 138 H110 Z" />
      </g>
      <g mask="url(#pv-mark-b)" fill="var(--pv-green)">
        <path d="M72 172.4 L167.5 79.6" stroke="var(--pv-green)" strokeWidth="16" />
        <path d="M192 56 L181.4 94 L153.6 65.2 Z" />
      </g>
    </svg>
  );
}

/** Mark + wordmark lockup: bold PAY, lighter VAULT, optional tagline. */
export function Logo({ className = "", tagline = false }: { className?: string; tagline?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className={tagline ? "h-10 w-10" : "h-8 w-8"} title="" />
      <span className="flex flex-col leading-none">
        <span className="font-brand text-[1.15rem] tracking-tight text-navy">
          <span className="font-extrabold">PAY</span>
          <span className="font-medium">VAULT</span>
        </span>
        {tagline && (
          <span className="mt-1 font-brand text-[0.55rem] font-semibold tracking-[0.2em] text-navy">
            SECURE FINTECH
          </span>
        )}
      </span>
      <span className="sr-only">PayVault</span>
    </span>
  );
}
