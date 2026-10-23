"use client";
import { createBrowserClient } from "@supabase/ssr";
import { Mail, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { api, ApiError, NetworkError } from "@/lib/client/api";
import { useI18n } from "./I18n";
import { Button, Field, Notice } from "./ui";

type Mode = "supabase" | "phone" | "unavailable" | "offline" | null;

type SupabasePublic = { url: string; key: string };
let supabaseConfig: SupabasePublic | null = null;

function supabase() {
  if (!supabaseConfig) throw new Error("Supabase is not configured");
  return createBrowserClient(supabaseConfig.url, supabaseConfig.key);
}

/** One-time-code sign-in: by SMS (phone), or by email when Supabase is configured. `next` is where to go afterwards. */
export function SignIn({ next, onSignedIn }: { next: string; onSignedIn?: () => void }) {
  const { m, t, locale } = useI18n();
  const [mode, setMode] = useState<Mode>(null);
  const [handle, setHandle] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"handle" | "code">("handle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const phone = mode === "phone";

  useEffect(() => {
    api<{ mode: Mode; supabase?: SupabasePublic }>("/api/auth/config")
      .then((r) => {
        supabaseConfig = r.supabase ?? null;
        setMode(r.mode);
      })
      .catch((err) => setMode(err instanceof NetworkError ? "offline" : "unavailable"));
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
      if (phone) {
        const r = await api<{ phone: string }>("/api/auth/phone/start", { phone: handle, locale });
        setHandle(r.phone);
      } else {
        const { error } = await supabase().auth.signInWithOtp({
          email: handle,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (error) throw error;
      }
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
    let ok: boolean;
    if (phone) ok = await api("/api/auth/phone/verify", { phone: handle, code: code.trim() }).then(() => true, () => false);
    else ok = !(await supabase().auth.verifyOtp({ email: handle, token: code.trim(), type: "email" })).error;
    setBusy(false);
    if (ok) finish();
    else setError(m.auth.invalidCode);
  };

  const offline = typeof navigator !== "undefined" && !navigator.onLine;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-4 py-10">
      <LogoMark className="mb-6 h-14 w-14" />
      <h1 className="text-[26px] font-medium tracking-tight text-ink">{m.auth.title}</h1>
      <p className="mt-2 text-muted">{phone ? m.auth.phoneSubtitle : m.auth.subtitle}</p>
      <div className="mt-8 space-y-4">
        {(offline || mode === "offline") && <Notice tone="warn">{m.auth.offline}</Notice>}
        {mode === "unavailable" && <Notice tone="danger">{m.auth.unavailable}</Notice>}
        {step === "handle" ? (
          <form onSubmit={sendCode} className="space-y-4">
            {phone ? (
              <Field
                label={m.auth.phone}
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="+234…"
                hint={m.auth.phoneHint}
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                error={error}
              />
            ) : (
              <Field
                label={m.auth.email}
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                error={error}
              />
            )}
            <Button type="submit" className="w-full" loading={busy} disabled={!mode || mode === "unavailable" || mode === "offline"}>
              {phone ? <MessageSquare className="h-4 w-4" /> : <Mail className="h-4 w-4" />} {m.auth.sendCode}
            </Button>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-4">
            <Notice tone="success">{t(m.auth.codeSent, { email: handle })}</Notice>
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
            <Button type="button" variant="ghost" className="w-full" onClick={() => setStep("handle")}>
              {phone ? m.auth.useOtherPhone : m.auth.useOtherEmail}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
