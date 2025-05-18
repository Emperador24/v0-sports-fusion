import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getDb } from "@/server/db"
import { users } from "@/server/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

// Generate a random string for development if NEXTAUTH_SECRET is not set
const generateRandomSecret = () => {
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 36).toString(36)).join("")
}

// Use environment variable or fallback for development
const authSecret =
  process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV !== "production" ? generateRandomSecret() : undefined)

if (!authSecret) {
  console.error("Warning: NEXTAUTH_SECRET is not defined. This is insecure in production.")
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const db = await getDb()

          // Handle mock DB in development/preview
          if (process.env.NODE_ENV !== "production" && !process.env.SINGLESTORE_HOST) {
            console.info("Using mock user for development/preview")
            // Return a mock user for development
            return {
              id: "mock-user-id",
              name: "Test User",
              email: credentials.email,
              image: null,
            }
          }

          const user = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1)

          if (user.length === 0) {
            return null
          }

          const passwordMatch = await bcrypt.compare(credentials.password, user[0].password)

          if (!passwordMatch) {
            return null
          }

          return {
            id: user[0].id,
            name: user[0].name,
            email: user[0].email,
            image: user[0].image,
          }
        } catch (error) {
          console.error("Auth error:", error)

          // In development/preview, allow login with any credentials
          if (process.env.NODE_ENV !== "production" && !process.env.SINGLESTORE_HOST) {
            console.info("Using mock user for development/preview")
            return {
              id: "mock-user-id",
              name: "Test User",
              email: credentials.email,
              image: null,
            }
          }

          return null
        }
      },
    }),
  ],
  secret: authSecret,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})

export { handler as GET, handler as POST }
