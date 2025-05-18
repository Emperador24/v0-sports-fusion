import { timestamp, text, int, float, singlestoreTable, varchar } from "drizzle-orm/singlestore-core"
import { createId } from "@paralleldrive/cuid2"

// User table
export const users = singlestoreTable("users", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  image: text("image"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
})

// Tabla de sesiones
export const sesiones = singlestoreTable("sesiones", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => createId()),
  user_id: varchar("user_id", { length: 36 }).notNull(), // Add user_id to associate sessions with users
  fecha: timestamp("fecha").notNull(),
  nota: text("nota"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
})

// Tabla de actividades de entrenamiento
export const actividades = singlestoreTable("actividades", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => createId()),
  sesion_id: varchar("sesion_id", { length: 36 }).notNull(),
  modo: text("modo").notNull().$type<"Fuerza" | "Duración" | "Distancia + Tiempo">(),
  deporte: text("deporte").notNull(),
})

// Tabla de actividades de fuerza
export const actividades_fuerza = singlestoreTable("actividades_fuerza", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => createId()),
  actividad_id: varchar("actividad_id", { length: 36 }).notNull(),
  series: int("series").$type<number>(),
  repeticiones: int("repeticiones").$type<number>(),
  peso: float("peso").$type<number>(),
})

// Tabla de actividades de duración
export const actividades_duracion = singlestoreTable("actividades_duracion", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => createId()),
  actividad_id: varchar("actividad_id", { length: 36 }).notNull(),
  duracion: int("duracion").notNull(), // Almacenando duración en segundos
})

// Tabla de actividades de distancia
export const actividades_distancia = singlestoreTable("actividades_distancia", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => createId()),
  actividad_id: varchar("actividad_id", { length: 36 }).notNull(),
  distancia: float("distancia").$type<number>(),
  tiempo: int("tiempo").notNull(), // Almacenando tiempo en segundos
  ritmo: int("ritmo").$type<number>(), // Campo calculado: tiempo / distancia ritmo en segundos por kilometro
})
