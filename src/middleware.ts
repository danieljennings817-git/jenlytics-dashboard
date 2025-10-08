// middleware.ts
export { auth as middleware } from "next-auth/middleware";

// Only protect LNT and site pages. Do NOT touch /, /api/auth, or static assets.
export const config = {
  matcher: [
    "/lnt",        // /lnt
    "/lnt/:path*", // /lnt/*
    "/site/:path*" // /site/*
  ],
};

