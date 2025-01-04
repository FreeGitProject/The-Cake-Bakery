// next-auth.d.ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth, { DefaultSession, DefaultUser, JWT } from 'next-auth';

declare module 'next-auth' {
  interface User extends DefaultUser {
    id: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
    } & DefaultSession['user'];
  }

  // Extend the JWT type to include `id` and `role`
  interface JWT {
    id: string;
    role: string;
  }
}
