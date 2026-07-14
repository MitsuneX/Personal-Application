import { type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

async function proxy(request: NextRequest) {
  return createClient(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - all images/assets/icons in public/
     */
    "/((?!_next/static|_next/image|favicon.ico|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|css|json)$).*)",
  ],
};

// Keeping all default exports strictly at the end of the file
export default proxy;