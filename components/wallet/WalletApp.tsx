"use client";
import { useCallback, useEffect, useState } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { api, ApiError, NetworkError } from "@/lib/client/api";
import { kv } from "@/lib/client/kv";
import { getDeviceKey, hasPin, saveDeviceId, setPin } from "@/lib/client/security";
import { startConnectivityWatch, useApp } from "@/lib/client/store";
import type { AppSnapshot } from "@/lib/server/snapshot";
import { HomeScreen } from "./HomeScreen";
import { useI18n } from "./I18n";
import { Onboarding } from "./Onboarding";
import { ActivityScreen, AddSheet, ProfileScreen } from "./OtherScreens";
import { BottomNav, type Tab } from "./parts";
import { PaySheet } from "./PaySheet";
import { PinPad } from "./PinPad";
import { RequestSheet } from "./RequestSheet";
import { SignIn } from "./SignIn";
import { Spinner, Toast } from "./ui";
import { VaultScreen } from "./VaultScreen";

type Phase = "boot" | "signin" | "onboarding" | "pin" | "ready" | "error";

/**
 * Offline-first boot: try the server; if the network is down, start from the
 * last cached session so a signed-in user can still pay and get paid.
 */
export function WalletApp() {
  const { m, locale } = useI18n();
  const [phase, setPhase] = useState<Phase>("boot");
  const [userId, setUserId] = useState<string | null>(null);

  const boot = useCallback(async () => {
    try {
      const snap = await api<AppSnapshot>("/api/app/me");
      const uid = snap.user.id;
      await kv.set("lastUser", uid);
      await kv.set(`snapshot:${uid}`, { data: snap, at: Date.now() });
      // Register this device's signing key once.
      const device = await getDeviceKey(uid);
      if (!device.deviceId) {
        const r = await api<{ deviceId: string }>("/api/app/devices", {
          publicKey: device.publicKeyHex,
          label: navigator.userAgent.slice(0, 60),
        });
        await saveDeviceId(uid, r.deviceId);
      }
      setUserId(uid);
      setPhase((await hasPin(uid)) ? "ready" : "pin");
    } catch (err) {
      if (err instanceof ApiError && err.code === "not_onboarded") return setPhase("onboarding");
      if (err instanceof ApiError && err.status === 401) return setPhase("signin");
      if (err instanceof NetworkError || (err instanceof ApiError && err.status >= 500)) {
        const last = await kv.get<string>("lastUser");
        if (last && (await kv.get(`snapshot:${last}`)) && (await hasPin(last))) {
          setUserId(last);
          return setPhase("ready");
        }
        return setPhase(err instanceof NetworkError ? "signin" : "error");
      }
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    // boot() only sets state after awaiting the network, so this cannot cascade renders.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void boot();
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, [boot]);

  const reboot = () => {
    setPhase("boot");
    void boot();
  };

  if (phase === "boot")
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="flex flex-col items-center gap-4">
          <LogoMark className="h-16 w-16" />
          <Spinner />
        </div>
      </div>
    );
  if (phase === "signin") return <SignIn next={`/${locale}/app`} onSignedIn={reboot} />;
  if (phase === "onboarding") return <Onboarding onDone={reboot} />;
  if (phase === "pin") return <CreatePin userId={userId!} onDone={() => setPhase("ready")} />;
  if (phase === "error")
    return (
      <div className="grid min-h-dvh place-items-center px-4 text-center">
        <div className="space-y-4">
          <p className="text-muted">{m.common.genericError}</p>
          <button className="h-12 rounded-full bg-ink px-6 font-medium text-paper" onClick={reboot}>
            {m.common.retry}
          </button>
        </div>
      </div>
    );
  return <Main userId={userId!} onSignedOut={() => setPhase("signin")} />;
}

function CreatePin({ userId, onDone }: { userId: string; onDone: () => void }) {
  const { m } = useI18n();
  const [first, setFirst] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex min-h-dvh flex-col justify-center px-4 py-10">
      {first === null ? (
        <PinPad
          title={m.pin.createTitle}
          hint={m.pin.createHint}
          error={error}
          onSubmit={(p) => {
            setError(null);
            setFirst(p);
          }}
        />
      ) : (
        <PinPad
          key="confirm"
          title={m.pin.confirmTitle}
          hint={m.pin.createHint}
          onSubmit={async (p) => {
            if (p !== first) {
              setFirst(null);
              setError(m.pin.mismatch);
              return;
            }
            await setPin(userId, p);
            onDone();
          }}
        />
      )}
    </div>
  );
}

function Main({ userId, onSignedOut }: { userId: string; onSignedOut: () => void }) {
  const { locale } = useI18n();
  const [tab, setTab] = useState<Tab>("home");
  const [sheet, setSheet] = useState<null | "pay" | "request" | "add">(null);
  const [toast, setToast] = useState<string | null>(null);
  const snapshot = useApp((s) => s.snapshot);

  useEffect(() => {
    void useApp.getState().init(userId);
    return startConnectivityWatch();
  }, [userId]);

  const signOut = async () => {
    await api("/api/auth/signout", {}).catch(() => {});
    await kv.del("lastUser");
    onSignedOut();
  };

  if (!snapshot)
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner />
      </div>
    );

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-32">
      <main>
        {tab === "home" && (
          <HomeScreen onPay={() => setSheet("pay")} onRequest={() => setSheet("request")} onAdd={() => setSheet("add")} setTab={setTab} />
        )}
        {tab === "activity" && <ActivityScreen />}
        {tab === "vault" && <VaultScreen toast={setToast} />}
        {tab === "profile" && <ProfileScreen locale={locale} onSignOut={() => void signOut()} />}
      </main>
      <BottomNav tab={tab} setTab={setTab} />
      <PaySheet
        open={sheet === "pay"}
        onClose={() => setSheet(null)}
        onNeedVault={() => {
          setSheet(null);
          setTab("vault");
        }}
      />
      <RequestSheet open={sheet === "request"} onClose={() => setSheet(null)} />
      <AddSheet open={sheet === "add"} onClose={() => setSheet(null)} toast={setToast} onLoadVault={() => setTab("vault")} />
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
