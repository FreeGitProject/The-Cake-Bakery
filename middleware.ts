import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Secret used for NextAuth JWT signing
const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const publicPaths = ["/login", "/register"];

  // Check if the current path is public
  const isPublicPath = publicPaths.some((publicPath) => path.startsWith(publicPath));

  // Fetch JWT token from cookies using NextAuth's utility
  const token = await getToken({ req: request, secret });

  //console.log("Middleware:", { token, isPublicPath, path });

  // Redirect unauthenticated users from protected paths
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  // Role-based authorization for protected paths (e.g., admin routes)
  if (path.startsWith("/admin") && token?.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  // Allow request to proceed
  return NextResponse.next();
}

// Middleware configuration
export const config = {
  matcher: [
    "/admin/:path*",  // Apply middleware to all admin-related paths
   // "/protected/:path*", // Example for other protected paths
  ],
};
