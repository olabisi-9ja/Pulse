"use client";
import jsQR from "jsqr";
import { ClipboardPaste } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "./I18n";
import { Button, Notice } from "./ui";

/**
 * Camera QR scanner. Uses the native BarcodeDetector when available and
 * falls back to jsQR. Always offers a paste fallback.
 */
export function Scanner({ onResult, hint }: { onResult: (text: string) => void; hint: string }) {
  const { m } = useI18n();
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pasting, setPasting] = useState(false);
  const [pasted, setPasted] = useState("");
  const done = useRef(false);

  useEffect(() => {
    let stream: MediaStream | undefined;
    let raf = 0;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    type Detector = { detect(src: CanvasImageSource): Promise<{ rawValue: string }[]> };
    const BD = (globalThis as { BarcodeDetector?: new (o: { formats: string[] }) => Detector }).BarcodeDetector;
    const detector = BD ? new BD({ formats: ["qr_code"] }) : null;

    const found = (text: string) => {
      if (done.current || !text) return;
      done.current = true;
      navigator.vibrate?.(40);
      onResult(text);
    };

    const tick = async () => {
      const v = video.current;
      if (!v || done.current) return;
      if (v.readyState >= 2 && v.videoWidth) {
        try {
          if (detector) {
            const codes = await detector.detect(v);
            if (codes[0]) found(codes[0].rawValue);
          } else if (ctx) {
            const w = Math.min(640, v.videoWidth);
            const h = Math.round((v.videoHeight / v.videoWidth) * w);
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(v, 0, 0, w, h);
            const img = ctx.getImageData(0, 0, w, h);
            const code = jsQR(img.data, w, h, { inversionAttempts: "dontInvert" });
            if (code) found(code.data);
          }
        } catch {
          // Transient decode errors are expected between frames.
        }
      }
      raf = requestAnimationFrame(() => void tick());
    };

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 } },
          audio: false,
        });
        if (video.current) {
          video.current.srcObject = stream;
          await video.current.play();
          raf = requestAnimationFrame(() => void tick());
        }
      } catch {
        setError(m.pay.cameraDenied);
        setPasting(true);
      }
    })();

    return () => {
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onResult, m.pay.cameraDenied]);

  return (
    <div className="space-y-4">
      {!error && (
        <div className="relative mx-auto aspect-square w-full max-w-[340px] overflow-hidden rounded-[28px] bg-black">
          <video ref={video} className="h-full w-full object-cover" playsInline muted aria-label={hint} />
          <div className="pointer-events-none absolute inset-8 rounded-3xl border-2 border-white/80" aria-hidden />
        </div>
      )}
      <p className="text-center text-sm text-muted">{hint}</p>
      {error && <Notice tone="warn">{error}</Notice>}
      {pasting ? (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (pasted.trim()) onResult(pasted.trim());
          }}
        >
          <textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            placeholder={m.pay.pastePlaceholder}
            rows={3}
            aria-label={m.pay.paste}
            className="w-full rounded-2xl border border-line bg-card p-3 font-mono text-xs text-ink outline-none focus:border-green"
          />
          <Button type="submit" className="w-full">
            {m.common.continue}
          </Button>
        </form>
      ) : (
        <Button variant="ghost" className="w-full" onClick={() => setPasting(true)}>
          <ClipboardPaste className="h-4 w-4" /> {m.pay.paste}
        </Button>
      )}
    </div>
  );
}
