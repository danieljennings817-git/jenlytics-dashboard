// Use the default export with your matcher (works on NextAuth v4)
export { default } from "next-auth/middleware";

export const config = {
  // Only protect these paths; '/' stays public so no loops
  matcher: ["/lnt", "/lnt/:path*", "/site/:path*"],
};



