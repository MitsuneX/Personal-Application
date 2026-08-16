import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// ─── Public Routes (Accessible without authentication) ────────────────────────
const PUBLIC_ROUTES = [
  "/",
  "/welcome",
  "/login",
  "/signup",
  "/auth",
  "/api/auth",
  "/api/",
  "/manifest.webmanifest",
  "/manifest.json",
  "/favicon.ico",
  "/robots.txt",
  "/sw.js",
];

function isPublicRoute(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_ROUTES.some((route) => route !== "/" && (pathname === route || pathname.startsWith(route)));
}

// ─── Next.js 16 Proxy (Replaces middleware) ───────────────────────────────────
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const { pathname } = request.nextUrl;
  const isGuest = request.cookies.get("is_guest")?.value === "true";

  // Guest Mode sessions pass through all application routes without blocking /login
  if (isGuest) {
    return supabaseResponse;
  }

  // Strict routing check: if no auth-token cookie exists for a protected route, abort immediately
  if (!isPublicRoute(pathname)) {
    const allCookies = request.cookies.getAll();
    const hasAuthCookie = allCookies.some(c => c.name.includes("auth-token"));
    if (!hasAuthCookie) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // IMPORTANT: Do not add logic between createServerClient and getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users trying to access protected routes
  if (!user && !isPublicRoute(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect logged-in users away from /login to dashboard
  if (user && isPublicRoute(pathname) && pathname.startsWith("/login")) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

// ─── Matcher ──────────────────────────────────────────────────────────────────
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static  (Next.js static assets)
     * - _next/image   (image optimization)
     * - favicon.ico
     * - Public image / icon / asset files / PWA manifest / sw.js
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest\\.webmanifest|manifest\\.json|robots\\.txt|sw\\.js|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|json|webmanifest|woff|woff2|ttf|otf)$).*)",
  ],
};
