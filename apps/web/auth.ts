import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import type { UserRole } from '@sylvara/shared';
import { upsertUserOnSignIn } from './lib/auth-helpers';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    signIn({ profile }) {
      return profile?.email?.endsWith('@irontreeservice.com') ?? false;
    },
    async jwt({ token, profile }) {
      if (profile?.email) {
        const user = await upsertUserOnSignIn(profile.email, profile.name ?? '');
        token.userId = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.userId as string;
      session.user.role = token.role as UserRole;
      return session;
    },
  },
});
