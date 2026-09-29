/** Fetch wrapper for the app API: JSON in/out, timeout, typed errors. */
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export class NetworkError extends Error {
  constructor() {
    super("Network unavailable");
  }
}

export async function api<T>(path: string, body?: unknown, timeoutMs = 12_000): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: body === undefined ? "GET" : "POST",
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    throw new NetworkError();
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = (data as { error?: { code?: string; message?: string } }).error;
    throw new ApiError(e?.code ?? "http_" + res.status, e?.message ?? `Request failed (${res.status})`, res.status);
  }
  return data as T;
}
