import NextAuth from "next-auth";
import TwitchProvider from "next-auth/providers/twitch";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    TwitchProvider({
      clientId: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
      clientSecret: process.env.TWITCH_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    // Enhanced jwt callback to ensure user data is properly passed
    jwt: ({ token, account, user }) => {
      if (account) {
        token.accessToken = account.access_token;
        // Make sure to include the user ID
        if (user) {
          token.id = user.id;
          // If there's a username on the user object, include it too
          if (user.name) {
            token.username = user.name;
          }
        }
      }
      return token;
    },
    // Enhanced session callback to ensure all user data is available
    session: ({ session, token }) => {
      if (token?.accessToken) session.accessToken = token.accessToken as string;
      if (token?.id) session.user.id = token.id as string;
      if (token?.sub) session.user.id = token.sub;
      // Include username if available
      if (token?.username) session.user.username = token.username as string;
      
      // Debug logging (remove in production)
      console.log("Session created:", {
        userId: session.user.id,
        username: session.user.username,
        hasAccessToken: !!session.accessToken
      });
      
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login?error=auth",
    newUser: "/setup/start",
  },
  // Enhanced cookie configuration for better cross-domain compatibility
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.COOKIE_DOMAIN || undefined, // Use COOKIE_DOMAIN env var if set
      },
    },
  },
  debug: process.env.NODE_ENV === "development",
  trustHost: true,
});

export const GET = handlers.GET;
export const POST = handlers.POST;