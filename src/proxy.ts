import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ADMIN_ROLES, REVIEW_ROLES } from "@/lib/rbac";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  if (
    req.auth?.user?.mustChangePassword &&
    pathname !== "/account/change-password"
  ) {
    return NextResponse.redirect(new URL("/account/change-password", req.url));
  }

  if (
    req.auth?.user &&
    req.auth.user.profileComplete === false &&
    pathname !== "/onboarding"
  ) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  if (pathname.startsWith("/admin") && !(role && ADMIN_ROLES.includes(role))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname.startsWith("/reviews") && !(role && REVIEW_ROLES.includes(role))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname.startsWith("/submissions") && !req.auth?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
