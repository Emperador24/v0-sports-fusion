import { defineConfig } from "drizzle-kit"

// Default values for database configuration
const DB_DEFAULTS = {
  HOST: "localhost",
  USER: "admin",
  PASSWORD: "password",
  DATABASE: "sportsfusion",
  PORT: 3306,
}

export default defineConfig({
  dialect: "singlestore",
  schema: "./server/db/schema.ts",
  dbCredentials: {
    host: process.env.SINGLESTORE_HOST || DB_DEFAULTS.HOST,
    user: process.env.SINGLESTORE_USER || DB_DEFAULTS.USER,
    password: process.env.SINGLESTORE_PASSWORD || DB_DEFAULTS.PASSWORD,
    database: process.env.SINGLESTORE_DATABASE || DB_DEFAULTS.DATABASE,
    port: Number.parseInt(process.env.SINGLESTORE_PORT || DB_DEFAULTS.PORT.toString()),
    ssl: {},
  },
})
