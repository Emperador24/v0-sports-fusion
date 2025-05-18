import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    name?: string | null
    email: string
    image?: string | null
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email: string
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
  }
}
