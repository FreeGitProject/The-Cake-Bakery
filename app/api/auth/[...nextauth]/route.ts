import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/mongodb';
import { User } from '@/models/user';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await clientPromise;
        const user = await User.findOne({ email: credentials.email });

        if (!user || !user.isVerified) {
          return null;
        }

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordCorrect) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.username,
          email: user.email,
          role: user.role, // Ensure role is included here
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add role and id to the token if user exists
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      //console.log('JWT Callback:', token, user);
      return token;
    },
    async session({ session, token }) {
      // Log the session and token for debugging
     // console.log('Session:', session, 'Token:', token);
    // console.log('Session Callback:', session, token);
      // Add role and id to the session user object
      if (session?.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
     // console.log('Session:', session, 'Token:', token); // Log for debugging
      return session;
    },
  },
  pages: {
    signIn: '/login', // Redirect here on unauthenticated access
  },
});

export { handler as GET, handler as POST };
