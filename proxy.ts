import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { isLocale, negotiateLocale } from "@/lib/i18n";

/** Sends locale-less page requests to /en or /fr and keeps the Supabase session fresh. */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1] ?? "";
  if (!isLocale(first)) {
    const cookie = req.cookies.get("pv_locale")?.value;
    const locale = cookie && isLocale(cookie) ? cookie : negotiateLocale(req.headers.get("accept-language"));
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  let res = NextResponse.next({ request: req });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (url && key && (pathname.includes("/app") || pathname.includes("/console"))) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list) => {
          for (const c of list) req.cookies.set(c.name, c.value);
          res = NextResponse.next({ request: req });
          for (const c of list) res.cookies.set(c.name, c.value, c.options);
        },
      },
    });
    await supabase.auth.getUser();
  }
  return res;
}

export const config = {
  matcher: ["/((?!api|_next|brand|icon|apple-touch-icon|manifest|sw\\.js|robots\\.txt|sitemap\\.xml|.*\\.[a-z0-9]+$).*)"],
};
