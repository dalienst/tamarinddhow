import { NextAuthOptions, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Sign In with your credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "jsmith@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string };
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/auth/token/`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            }
          );
          if (!response.ok) {
            return null;
          }
          const user = await response.json();
          if (user) {
            return user;
          }
          return null;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: User }) {
      return { ...token, ...user };
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.user = token;
      return session;
    },
  },
  pages: { signIn: "/login" },
};

