import { drizzle } from "drizzle-orm/singlestore"
import mysql from "mysql2/promise"

// Update the createConnection function to include default values for all database configuration parameters

export async function createConnection() {
  try {
    // Default values for database configuration
    const DB_DEFAULTS = {
      HOST: "localhost",
      USER: "admin",
      PASSWORD: "password",
      DATABASE: "sportsfusion",
      PORT: 3306,
    }

    // Use environment variables with fallbacks to defaults
    const dbConfig = {
      host: process.env.SINGLESTORE_HOST || DB_DEFAULTS.HOST,
      user: process.env.SINGLESTORE_USER || DB_DEFAULTS.USER,
      database: process.env.SINGLESTORE_DATABASE || DB_DEFAULTS.DATABASE,
      port: Number.parseInt(process.env.SINGLESTORE_PORT || DB_DEFAULTS.PORT.toString()),
      password: process.env.SINGLESTORE_PASSWORD || DB_DEFAULTS.PASSWORD,
      ssl: {},
      maxIdle: 0,
    }

    // Log which configuration is being used (without exposing sensitive data)
    console.info(
      `Database connection: Using ${process.env.SINGLESTORE_HOST ? "environment variables" : "default values"} for connection`,
    )

    // Check if we're in development/preview and using default values
    if (process.env.NODE_ENV !== "production" && !process.env.SINGLESTORE_HOST) {
      console.info("Using mock database connection for development/preview")
      return null
    }

    return await mysql.createConnection(dbConfig)
  } catch (error) {
    console.error("Database connection error:", error)
    // Return null in non-production environments to allow the app to continue
    if (process.env.NODE_ENV !== "production") {
      console.info("Using mock database connection for development/preview")
      return null
    }
    throw error
  }
}

// Singleton to prevent multiple connections
let db: ReturnType<typeof drizzle> | null = null

export async function getDb() {
  if (!db) {
    const connection = await createConnection()

    // If connection is null (in development/preview), return a mock DB
    if (!connection) {
      if (process.env.NODE_ENV !== "production") {
        console.info("Using mock database for development/preview")
        // Return a mock DB object that won't throw errors
        return createMockDb()
      }
      throw new Error("Failed to establish database connection")
    }

    db = drizzle({ client: connection })
  }
  return db
}

// Create a mock DB for development/preview environments
function createMockDb() {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => [],
          orderBy: () => [],
        }),
        orderBy: () => [],
      }),
    }),
    insert: () => ({
      values: () => ({ returning: () => [] }),
    }),
    delete: () => ({
      where: () => ({ returning: () => [] }),
    }),
    update: () => ({
      set: () => ({ where: () => ({ returning: () => [] }) }),
    }),
  }
}

// For compatibility with existing code
// eslint-disable-next-line import/no-anonymous-default-export
export default { getDb }
