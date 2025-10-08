import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { pool } from "@/lib/db";
import bcrypt from "bcrypt";

const handler = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      authorize: async (creds) => {
        if (!creds?.email || !creds?.password) return null;
        const { rows } = await pool.query(
          "select id, email, password_hash from users where email=$1",
          [creds.email]
        );
        const user = rows[0];
        if (!user) return null;

        const ok = await bcrypt.compare(creds.password as string, user.password_hash);
        if (!ok) return null;

        // attach a tenant slug (first mapped tenant)
        const t = await pool.query(
          `select t.slug from user_tenants ut
             join tenants t on t.id = ut.tenant_id
           where ut.user_id = $1
           limit 1`,
          [user.id]
        );
        return { id: user.id, email: user.email, tenant_slug: t.rows[0]?.slug || null } as any;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.tenant_slug = (user as any).tenant_slug ?? null;
      return token;
    },
    async session({ session, token }) {
      (session as any).tenant_slug = (token as any).tenant_slug ?? null;
      return session;
    }
  }
});

export { handler as GET, handler as POST };
