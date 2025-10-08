// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { pool } from "@/lib/db";

// Ensure this route runs on the Node.js runtime (not edge) for pg/bcrypt.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  // "/" is your landing/login page (keep as you had)
  pages: { signIn: "/" },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (creds) => {
        if (!creds?.email || !creds?.password) return null;

        // 1) Find user by email
        const { rows } = await pool.query(
          `select id, email, password_hash
             from users
            where email = $1
            limit 1`,
          [creds.email]
        );
        const user = rows[0];
        if (!user) return null;

        // 2) Verify password
        const ok = await bcrypt.compare(String(creds.password), user.password_hash);
        if (!ok) return null;

        // 3) Attach the first mapped tenant slug (if any)
        const t = await pool.query(
          `select t.slug
             from user_tenants ut
             join tenants t on t.id = ut.tenant_id
            where ut.user_id = $1
            order by ut.role desc
            limit 1`,
          [user.id]
        );

        return {
          id: user.id,
          email: user.email,
          tenant_slug: t.rows[0]?.slug ?? null,
        } as any;
      },
    }),
  ],

  callbacks: {
    // Prevent redirect loops + off-origin redirects
    async redirect({ url, baseUrl }) {
      const resolved = new URL(url, baseUrl);
      const base = new URL(baseUrl);

      // only same-origin
      if (resolved.origin !== base.origin) return baseUrl;

      // never redirect back into NextAuth endpoints
      if (resolved.pathname.startsWith("/api/auth")) return baseUrl;

      return resolved.toString();
    },

    async jwt({ token, user }) {
      if (user) token.tenant_slug = (user as any).tenant_slug ?? null;
      return token;
    },

    async session({ session, token }) {
      (session as any).tenant_slug = (token as any).tenant_slug ?? null;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

