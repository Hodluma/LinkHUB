import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions, Session } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import { createHash } from "crypto";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database"
  },
  pages: {
    signIn: "/auth/signin"
  },
  providers: [
    EmailProvider({
      async sendVerificationRequest({ identifier, url }) {
        console.info(`Magic link for ${identifier}: ${url}`);
      },
      generateVerificationToken: () => createHash("sha256").update(randomBytes(32)).digest("hex"),
      maxAge: 60 * 60 * 24
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
    })
  ],
  callbacks: {
    async session({ session, user }): Promise<Session> {
      if (session.user) {
        session.user.id = user.id;
        session.user.plan = user.plan;
      }
      return session;
    }
  }
};

export type AppSession = Session & {
  user?: Session["user"] & { id: string; plan: string };
};
