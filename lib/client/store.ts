"use client";
/**
 * App state + the reliability engine.
 *
 * Connectivity is a small state machine:
 *   online → degraded (slow/failed calls) → offline (no network)
 *   offline → reconnecting (network back, probing) → reconciling (uploading
 *   queued payments) → settled (server confirmed) → online
 * Queued payments are retried with backoff until the server acknowledges them.
 */
import type { WalletState } from "@payvault/protocol";
import { create } from "zustand";
import { api, ApiError, NetworkError } from "./api";
import { kv } from "./kv";
import { getOutbox, loadVault, markOutbox, type OutboxItem, pendingOutbox, saveNetwork } from "./offline";
import type { AppSnapshot } from "@/lib/server/snapshot";

export type Connectivity = "online" | "degraded" | "offline" | "reconnecting" | "reconciling" | "settled";

type State = {
  userId: string | null;
  snapshot: AppSnapshot | null;
  snapshotAt: number | null;
  vault: WalletState | null;
  outbox: OutboxItem[];
  connectivity: Connectivity;
  lastSyncAt: number | null;
  lastError: string | null;
  retryIn: number | null;
};

type Actions = {
  init(userId: string): Promise<void>;
  refresh(): Promise<void>;
  reloadLocal(): Promise<void>;
  sync(reason?: string): Promise<void>;
  setConnectivity(c: Connectivity): void;
};

const snapKey = (u: string) => `snapshot:${u}`;
let retryTimer: ReturnType<typeof setTimeout> | undefined;
let retryAttempt = 0;
let syncing: Promise<void> | null = null;

export const useApp = create<State & Actions>((set, get) => ({
  userId: null,
  snapshot: null,
  snapshotAt: null,
  vault: null,
  outbox: [],
  connectivity: typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "online",
  lastSyncAt: null,
  lastError: null,
  retryIn: null,

  setConnectivity: (c) => set({ connectivity: c }),

  async init(userId) {
    const cached = await kv.get<{ data: AppSnapshot; at: number }>(snapKey(userId));
    set({ userId, snapshot: cached?.data ?? null, snapshotAt: cached?.at ?? null });
    await get().reloadLocal();
    void get().sync("init");
  },

  async reloadLocal() {
    const u = get().userId;
    if (!u) return;
    set({ vault: await loadVault(u), outbox: await getOutbox(u) });
  },

  async refresh() {
    const u = get().userId;
    if (!u) return;
    const started = Date.now();
    const data = await api<AppSnapshot>("/api/app/me");
    await kv.set(snapKey(u), { data, at: Date.now() });
    await saveNetwork(data.network);
    set({ snapshot: data, snapshotAt: Date.now() });
    if (Date.now() - started > 4000 && get().connectivity === "online") set({ connectivity: "degraded" });
  },

  sync(reason) {
    syncing ??= (async () => {
      const u = get().userId;
      if (!u) return;
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        set({ connectivity: "offline" });
        return;
      }
      const wasOffline = ["offline", "degraded", "reconnecting"].includes(get().connectivity);
      if (wasOffline) set({ connectivity: "reconnecting" });
      try {
        const pending = await pendingOutbox(u);
        if (pending.length) {
          set({ connectivity: "reconciling" });
          for (let i = 0; i < pending.length; i += 100) {
            const batch = pending.slice(i, i + 100);
            const res = await api<{
              results: { id?: string; status: OutboxItem["status"]; code?: string }[];
              network: AppSnapshot["network"];
            }>("/api/app/sync", { bundles: batch.map((b) => b.bundle) }, 20_000);
            await markOutbox(u, res.results, batch);
            await saveNetwork(res.network);
          }
        }
        await get().refresh();
        await get().reloadLocal();
        retryAttempt = 0;
        set({
          connectivity: pending.length || wasOffline ? "settled" : get().connectivity === "degraded" ? "degraded" : "online",
          lastSyncAt: Date.now(),
          lastError: null,
          retryIn: null,
        });
        if (pending.length || wasOffline) {
          setTimeout(() => {
            if (useApp.getState().connectivity === "settled") set({ connectivity: "online" });
          }, 2500);
        }
      } catch (err) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          set({ lastError: err.code, connectivity: "online" });
          return;
        }
        const offline = err instanceof NetworkError && typeof navigator !== "undefined" && !navigator.onLine;
        set({ connectivity: offline ? "offline" : "degraded", lastError: err instanceof Error ? err.message : String(err) });
        scheduleRetry(reason);
      }
    })().finally(() => {
      syncing = null;
    });
    return syncing;
  },
}));

function scheduleRetry(reason?: string) {
  clearTimeout(retryTimer);
  const delays = [3, 8, 15, 30, 60];
  const s = delays[Math.min(retryAttempt, delays.length - 1)];
  retryAttempt++;
  useApp.setState({ retryIn: s });
  retryTimer = setTimeout(() => void useApp.getState().sync(`retry:${reason ?? ""}`), s * 1000);
}

/** Wires browser connectivity signals into the engine. Call once. */
export function startConnectivityWatch(): () => void {
  const onOnline = () => void useApp.getState().sync("online");
  const onOffline = () => useApp.setState({ connectivity: "offline" });
  const onVisible = () => document.visibilityState === "visible" && void useApp.getState().sync("visible");
  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);
  document.addEventListener("visibilitychange", onVisible);
  const interval = setInterval(async () => {
    const u = useApp.getState().userId;
    if (u && (await pendingOutbox(u)).length) void useApp.getState().sync("interval");
  }, 30_000);
  return () => {
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);
    document.removeEventListener("visibilitychange", onVisible);
    clearInterval(interval);
    clearTimeout(retryTimer);
  };
}
