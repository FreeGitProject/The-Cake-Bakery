import NextAuth, { JWT } from 'next-auth';
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
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Explicitly type the token
      const typedToken = token as unknown as JWT; // Type token as JWT (with id and role)
      
      if (session?.user) {
        session.user.id = typedToken.id;
        session.user.role = typedToken.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // Redirect to custom login page on unauthenticated access
  },
});

export { handler as GET, handler as POST };
