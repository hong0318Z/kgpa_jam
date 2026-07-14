import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { sendWelcomeEmailTo } from "@/lib/notifications";
import type { Role } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      name: string;
      email: string;
      mustChangePassword: boolean;
      profileComplete: boolean;
      impersonatedByAdminId?: string;
      impersonatedByAdminName?: string;
    };
  }
}

export const STOP_IMPERSONATION_MARKER = "__STOP_IMPERSONATION__";

export const { handlers, signIn, signOut, auth, unstable_update: updateSession } = NextAuth({
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        await logAudit({
          actorId: user.id,
          action: "LOGIN",
          targetType: "User",
          targetId: user.id,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
          profileComplete: user.profileComplete,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    signIn: async ({ user, account }) => {
      if (account?.provider !== "google") return true;

      const email = user.email?.toLowerCase();
      if (!email) return false;

      let dbUser = await prisma.user.findUnique({ where: { email } });
      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email,
            name: user.name ?? email,
            role: "AUTHOR",
            profileComplete: false,
          },
        });
        await logAudit({
          actorId: dbUser.id,
          action: "USER_REGISTERED",
          targetType: "User",
          targetId: dbUser.id,
          metadata: { email, name: dbUser.name, provider: "google" },
        });
        await sendWelcomeEmailTo({ email: dbUser.email, name: dbUser.name });
      }
      if (!dbUser.isActive) return false;

      user.id = dbUser.id;
      (user as { role?: Role }).role = dbUser.role;
      (user as { mustChangePassword?: boolean }).mustChangePassword = dbUser.mustChangePassword;
      (user as { profileComplete?: boolean }).profileComplete = dbUser.profileComplete;

      await logAudit({
        actorId: dbUser.id,
        action: "LOGIN",
        targetType: "User",
        targetId: dbUser.id,
      });
      return true;
    },
    jwt: async ({ token, user, trigger, session }) => {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: Role }).role;
        token.mustChangePassword = (user as { mustChangePassword: boolean }).mustChangePassword;
        token.profileComplete = (user as { profileComplete: boolean }).profileComplete;
      }

      if (trigger === "update" && session?.user?.id) {
        const requestedId = session.user.id as string;

        if (requestedId === STOP_IMPERSONATION_MARKER) {
          if (token.impersonatedByAdminId) {
            const admin = await prisma.user.findUnique({
              where: { id: token.impersonatedByAdminId as string },
            });
            if (admin) {
              token.id = admin.id;
              token.role = admin.role;
              token.name = admin.name;
              token.email = admin.email;
              token.mustChangePassword = admin.mustChangePassword;
              token.profileComplete = admin.profileComplete;
            }
            token.impersonatedByAdminId = undefined;
            token.impersonatedByAdminName = undefined;
          }
        } else {
          const isCurrentlyAdmin = token.role === "ADMIN";
          const isCurrentlyImpersonating = !!token.impersonatedByAdminId;
          const target = await prisma.user.findUnique({ where: { id: requestedId } });

          if (target?.isTestAccount && (isCurrentlyAdmin || isCurrentlyImpersonating)) {
            if (!token.impersonatedByAdminId) {
              token.impersonatedByAdminId = token.id as string;
              token.impersonatedByAdminName = token.name as string;
            }
            token.id = target.id;
            token.role = target.role;
            token.name = target.name;
            token.email = target.email;
            token.mustChangePassword = target.mustChangePassword;
            token.profileComplete = target.profileComplete;
          }
        }
      }

      return token;
    },
    session: async ({ session, token }) => {
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      session.user.mustChangePassword = token.mustChangePassword as boolean;
      session.user.profileComplete = token.profileComplete as boolean;
      session.user.impersonatedByAdminId = token.impersonatedByAdminId as string | undefined;
      session.user.impersonatedByAdminName = token.impersonatedByAdminName as string | undefined;
      return session;
    },
  },
});
