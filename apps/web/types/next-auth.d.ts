import NextAuth from 'next-auth';
import type { UserRole } from '@sylvara/shared';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & Session['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
    role?: UserRole;
  }
}
