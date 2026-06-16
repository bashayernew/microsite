import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isReservedSegment } from "@/lib/reserved-paths";

/**
 * Guards the root-level `/{slug}` storefront routing: a reserved first segment
 * (see `reserved-paths.ts`) is 404'd before it can be mistaken for a tenant slug.
 * The matcher already excludes Next internals (`/_next/*`) and any path containing
 * a file extension (static assets like `/favicon.ico`, `/file.svg`), so this only
 * runs on clean paths.
 *
 * Next.js 16 renamed the `middleware` file convention to `proxy`.
 */
export function proxy(req: NextRequest) {
  const firstSegment = req.nextUrl.pathname.split("/")[1] ?? "";
  if (isReservedSegment(firstSegment)) {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|.*\\..*).*)"],
};
