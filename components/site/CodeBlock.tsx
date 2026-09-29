/** Static code sample on an inverted surface (works in light and dark). */
export function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <figure className="overflow-hidden rounded-3xl border border-line bg-ink text-paper">
      <figcaption className="flex items-center gap-2 border-b border-paper/15 px-5 py-3 text-xs font-bold uppercase tracking-wider text-paper/70">
        <span aria-hidden className="h-2 w-2 rounded-full bg-green" />
        {label}
      </figcaption>
      <pre className="overflow-x-auto p-5 text-[0.8rem] leading-relaxed" tabIndex={0}>
        <code className="font-mono">{code}</code>
      </pre>
    </figure>
  );
}
