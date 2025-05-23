import { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
    } & DefaultSession["user"]
    accessToken: string
  }

  interface User extends DefaultUser {
    username: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    profile?: {
      id: string
      login: string
      display_name?: string
      profile_image_url?: string
      email?: string
    }
  }
}