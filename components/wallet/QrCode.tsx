"use client";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

/** Renders QR text as an SVG. Alphanumeric mode keeps PayVault codes compact. */
export function QrCode({ text, label }: { text: string; label: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    QRCode.toString([{ data: text, mode: "alphanumeric" }], {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 2,
      color: { dark: "#0b1411", light: "#ffffff" },
    })
      .then((s) => alive && setSvg(s))
      .catch(() => alive && setSvg(null));
    return () => {
      alive = false;
    };
  }, [text]);
  return (
    <div
      role="img"
      aria-label={label}
      className="mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-3xl bg-white p-2 [&>svg]:h-full [&>svg]:w-full"
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  );
}
