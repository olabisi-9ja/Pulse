import "server-only";
/** Route helpers: JSON errors, validation, auth and transactions in one place. */
import { NextResponse } from "next/server";
import { z } from "zod";
import { ServiceError } from "./allowances";
import { AuthError } from "./auth";

export function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, { ...init, headers: { "cache-control": "no-store", ...init?.headers } });
}

export function errorResponse(code: string, message: string, status: number) {
  return json({ error: { code, message } }, { status });
}

export async function parseBody<T extends z.ZodType>(req: Request, schema: T): Promise<z.infer<T>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ServiceError("bad_json", "Request body must be JSON");
  }
  const r = schema.safeParse(body);
  if (!r.success) {
    const issue = r.error.issues[0];
    throw new ServiceError("invalid_request", `${issue.path.join(".") || "body"}: ${issue.message}`);
  }
  return r.data;
}

/** Wraps a handler so domain/auth errors become clean JSON responses. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof ServiceError) return errorResponse(err.code, err.message, err.status);
      if (err instanceof AuthError) {
        const status = err.code === "forbidden" ? 403 : 401;
        return errorResponse(err.code, err.code === "not_onboarded" ? "Finish setting up your account" : "Sign in required", status);
      }
      console.error(err);
      return errorResponse("internal", "Something went wrong", 500);
    }
  };
}

export const zAmount = z.number().int().positive().max(1_000_000_000);
export const zHex = (bytes: number) => z.string().regex(new RegExp(`^[0-9a-f]{${bytes * 2}}$`), "invalid hex");
export const zB64u = z.string().regex(/^[A-Za-z0-9_-]+$/, "invalid base64url").max(4096);
