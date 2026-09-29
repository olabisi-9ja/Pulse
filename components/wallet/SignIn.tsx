"use client";
import { createBrowserClient } from "@supabase/ssr";
import { Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { api, ApiError } from "@/lib/client/api";
import { useI18n } from "./I18n";
import { Button, Field, Notice } from "./ui";

type Mode = "supabase" | "dev" | "unavailable" | null;

function supabase() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
}

/** Email one-time-code sign-in. `next` is where to go afterwards. */
export function SignIn({ next, onSignedIn }: { next: string; onSignedIn?: () => void }) {
  const { m, t } = useI18n();
  const [mode, setMode] = useState<Mode>(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ mode: Mode }>("/api/auth/config")
      .then((r) => setMode(r.mode))
      .catch(() => setMode("unavailable"));
  }, []);

  const finish = () => {
    if (onSignedIn) onSignedIn();
    else window.location.assign(next);
  };

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "dev") {
        await api("/api/auth/dev", { email });
        finish();
        return;
      }
      const { error } = await supabase().auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
      setStep("code");
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : m.common.genericError);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await supabase().auth.verifyOtp({ email, token: code.trim(), type: "email" });
    setBusy(false);
    if (error) setError(m.auth.invalidCode);
    else finish();
  };

  const offline = typeof navigator !== "undefined" && !navigator.onLine;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-4 py-10">
      <LogoMark className="mb-6 h-14 w-14" />
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy">{m.auth.title}</h1>
      <p className="mt-2 text-muted">{m.auth.subtitle}</p>
      <div className="mt-8 space-y-4">
        {offline && <Notice tone="warn">{m.auth.offline}</Notice>}
        {mode === "unavailable" && <Notice tone="danger">{m.auth.unavailable}</Notice>}
        {mode === "dev" && <Notice>{m.auth.devMode}</Notice>}
        {step === "email" ? (
          <form onSubmit={sendCode} className="space-y-4">
            <Field
              label={m.auth.email}
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
            />
            <Button type="submit" className="w-full" loading={busy} disabled={!mode || mode === "unavailable"}>
              <Mail className="h-4 w-4" /> {m.auth.sendCode}
            </Button>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-4">
            <Notice tone="success">{t(m.auth.codeSent, { email })}</Notice>
            <Field
              label={m.auth.code}
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              error={error}
            />
            <Button type="submit" className="w-full" loading={busy}>
              {m.auth.verify}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => setStep("email")}>
              {m.auth.useOtherEmail}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
