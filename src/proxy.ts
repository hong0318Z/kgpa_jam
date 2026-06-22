import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  if (pathname.startsWith("/admin") && role !== "EDITOR") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname.startsWith("/reviews") && role !== "REVIEWER") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname.startsWith("/submissions") && !req.auth?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/reviews/:path*", "/submissions/:path*"],
};
