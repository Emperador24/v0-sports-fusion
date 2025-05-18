"use server"

import { getDb } from "@/server/db"
import { users } from "@/server/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { createId } from "@paralleldrive/cuid2"

type RegisterUserInput = {
  name: string
  email: string
  password: string
}

export async function registerUser(input: RegisterUserInput) {
  try {
    // In development/preview without DB, simulate success
    if (process.env.NODE_ENV !== "production" && !process.env.SINGLESTORE_HOST) {
      console.info("Mock registration successful for:", input.email)
      return { success: true }
    }

    const db = await getDb()

    // Check if user already exists
    const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.email, input.email)).limit(1)

    if (existingUser.length > 0) {
      return { success: false, error: "El email ya está registrado" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 10)

    // Create user
    await db.insert(users).values({
      id: createId(),
      name: input.name,
      email: input.email,
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error registering user:", error)

    // In development/preview without DB, simulate success
    if (process.env.NODE_ENV !== "production" && !process.env.SINGLESTORE_HOST) {
      console.info("Mock registration successful for:", input.email)
      return { success: true }
    }

    return { success: false, error: "Error al registrar usuario" }
  }
}
