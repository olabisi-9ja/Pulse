const N = 25;

function build(seed: number): boolean[][] {
  let s = seed;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
  const grid = Array.from({ length: N }, () => Array.from({ length: N }, () => rnd() > 0.52));
  const finder = (r0: number, c0: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = r0 + r;
        const cc = c0 + c;
        if (rr < 0 || cc < 0 || rr >= N || cc >= N) continue;
        const edge = r === 0 || r === 6 || c === 0 || c === 6;
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[rr][cc] = r >= 0 && r <= 6 && c >= 0 && c <= 6 && (edge || core);
      }
    }
  };
  finder(0, 0);
  finder(0, N - 7);
  finder(N - 7, 0);
  return grid;
}

/** Decorative QR-like pattern. Not a real code. */
export function QrPattern({ seed = 7, className = "" }: { seed?: number; className?: string }) {
  const grid = build(seed);
  const cells: string[] = [];
  grid.forEach((row, r) =>
    row.forEach((on, c) => {
      if (on) cells.push(`M${c} ${r}h1v1h-1z`);
    }),
  );
  return (
    <svg
      viewBox={`-1 -1 ${N + 2} ${N + 2}`}
      className={className}
      aria-hidden
      shapeRendering="crispEdges"
      focusable="false"
    >
      <path d={cells.join("")} fill="currentColor" />
    </svg>
  );
}
