import { type NextRequest, NextResponse } from "next/server";
import { isLocale, negotiateLocale } from "@/lib/i18n";

/** Sends locale-less page requests to /en or /fr. */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1] ?? "";
  if (isLocale(first)) return NextResponse.next();
  const cookie = req.cookies.get("pv_locale")?.value;
  const locale = cookie && isLocale(cookie) ? cookie : negotiateLocale(req.headers.get("accept-language"));
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|brand|icon|apple-touch-icon|manifest|sw\\.js|robots\\.txt|sitemap\\.xml|.*\\.[a-z0-9]+$).*)"],
};
