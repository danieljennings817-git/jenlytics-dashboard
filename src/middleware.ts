export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/lnt/:path*", "/site/:path*"], // these require auth
};
