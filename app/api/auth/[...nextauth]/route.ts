import NextAuth from "next-auth";
import TwitchProvider from "next-auth/providers/twitch";
import { env } from "@/lib/env";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    TwitchProvider({
      clientId: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
      clientSecret: process.env.TWITCH_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    jwt: ({ token, account }) => {
      if (account) token.accessToken = account.access_token;
      return token;
    },
    session: ({ session, token }) => {
      if (token?.sub) session.user.id = token.sub;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login?error=auth",
    newUser: "/setup/start",
  },
  trustHost: true,
});

export const GET = handlers.GET;
export const POST = handlers.POST;