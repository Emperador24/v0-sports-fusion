"use server"

import { getDb } from "@/server/db"
import {
  sesiones,
  actividades,
  actividades_fuerza,
  actividades_duracion,
  actividades_distancia,
} from "@/server/db/schema"
import { createId } from "@paralleldrive/cuid2"
import { eq } from "drizzle-orm"
import { getServerSession } from "next-auth"

type SelectedSport = {
  id: string
  name: string
  category: {
    title: string
  }
}

type StrenghActivity = {
  id: string
  activityId: string
  series: number
  repetitions: number
  weight: number
}

type DurationActivity = {
  id: string
  activityId: string
  duration: number
}

type DistanceActivity = {
  id: string
  activityId: string
  distance: number
  time: number
  ritmo: number
}

export async function persistSelectedActivities(selectedSports: SelectedSport[]) {
  try {
    const session = await getServerSession()

    // In development/preview without DB, simulate success with mock data
    if (process.env.NODE_ENV !== "production" && !process.env.SINGLESTORE_HOST) {
      console.info("Mock persistSelectedActivities for development/preview")
      const sessionId = "mock-session-id"

      // Create mock activities with IDs
      const activities = selectedSports.map((sport) => ({
        id: `mock-activity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        sportId: sport.id,
        name: sport.name,
        category: sport.category,
      }))

      return {
        success: true,
        sessionId,
        activities,
      }
    }

    if (!session?.user) {
      return { success: false, error: "No estás autenticado" }
    }

    const db = await getDb()

    // Create a new session
    const sessionId = createId()
    await db.insert(sesiones).values({
      id: sessionId,
      user_id: session.user.id, // Associate session with current user
      fecha: new Date(),
      nota: "registro",
      created_at: new Date(),
      updated_at: new Date(),
    })

    // Create activity entries based on unique sports
    // First, deduplicate sports by ID
    const uniqueSports = selectedSports.reduce((acc: Record<string, SelectedSport>, sport) => {
      if (!acc[sport.id]) {
        acc[sport.id] = sport
      }
      return acc
    }, {})

    // Convert back to array
    const uniqueSportsArray = Object.values(uniqueSports)

    // Insert unique activities
    const activitiesToInsert = uniqueSportsArray.map((sport) => ({
      id: createId(),
      sesion_id: sessionId,
      modo: sport.category.title as "Fuerza" | "Duración" | "Distancia + Tiempo",
      deporte: sport.name,
    }))

    await db.insert(actividades).values(activitiesToInsert)

    // Return the created activities with their IDs for the next steps
    return {
      success: true,
      sessionId,
      activities: activitiesToInsert.map((activity, index) => ({
        id: activity.id,
        sportId: uniqueSportsArray[index].id,
        name: uniqueSportsArray[index].name,
        category: uniqueSportsArray[index].category,
      })),
    }
  } catch (error) {
    console.error("Error persisting activities:", error)

    // In development/preview without DB, simulate success with mock data
    if (process.env.NODE_ENV !== "production" && !process.env.SINGLESTORE_HOST) {
      console.info("Mock persistSelectedActivities for development/preview")
      const sessionId = "mock-session-id"

      // Create mock activities with IDs
      const activities = selectedSports.map((sport) => ({
        id: `mock-activity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        sportId: sport.id,
        name: sport.name,
        category: sport.category,
      }))

      return {
        success: true,
        sessionId,
        activities,
      }
    }

    return { success: false, error: "Failed to persist activities" }
  }
}

export async function persistStrenghActivity(activity: StrenghActivity) {
  try {
    const session = await getServerSession()

    // In development/preview without DB, simulate success
    if (process.env.NODE_ENV !== "production" && !process.env.SINGLESTORE_HOST) {
      console.info("Mock persistStrenghActivity for development/preview")
      return { success: true }
    }

    if (!session?.user) {
      return { success: false, error: "No estás autenticado" }
    }

    const db = await getDb()

    // Insert the strength activity
    await db.insert(actividades_fuerza).values({
      id: createId(),
      actividad_id: activity.activityId,
      series: activity.series,
      repeticiones: activity.repetitions,
      peso: activity.weight,
    })

    return { success: true }
  } catch (error) {
    console.error("Error persisting strength activity:", error)

    // In development/preview without DB, simulate success
    if (process.env.NODE_ENV !== "production" && !process.env.SINGLESTORE_HOST) {
      console.info("Mock persistStrenghActivity for development/preview")
      return { success: true }
    }

    return { success: false, error: "Failed to persist strength activity" }
  }
}

export async function persistDurationActivity(activity: DurationActivity) {
  try {
    const session = await getServerSession()

    // In development/preview without DB, simulate success
    if (process.env.NODE_ENV !== "production" && !process.env.SINGLESTORE_HOST) {
      console.info("Mock persistDurationActivity for development/preview")
      return { success: true }
    }

    if (!session?.user) {
      return { success: false, error: "No estás autenticado" }
    }

    const db = await getDb()

    // Insert the duration activity
    await db.insert(actividades_duracion).values({
      id: createId(),
      actividad_id: activity.activityId,
      duracion: activity.duration,
    })

    return { success: true }
  } catch (error) {
    console.error("Error persisting duration activity:", error)

    // In development/preview without DB, simulate success
    if (process.env.NODE_ENV !== "production" && !process.env.SINGLESTORE_HOST) {
      console.info("Mock persistDurationActivity for development/preview")
      return { success: true }
    }

    return { success: false, error: "Failed to persist duration activity" }
  }
}

export async function persistDistanceActivity(activity: DistanceActivity) {
  try {
    const session = await getServerSession()

    // In development/preview without DB, simulate success
    if (process.env.NODE_ENV !== "production" && !process.env.SINGLESTORE_HOST) {
      console.info("Mock persistDistanceActivity for development/preview")
      return { success: true }
    }

    if (!session?.user) {
      return { success: false, error: "No estás autenticado" }
    }

    const db = await getDb()

    // Insert the distance activity
    await db.insert(actividades_distancia).values({
      id: createId(),
      actividad_id: activity.activityId,
      distancia: activity.distance,
      tiempo: activity.time,
      ritmo: activity.ritmo,
    })

    return { success: true }
  } catch (error) {
    console.error("Error persisting distance activity:", error)

    // In development/preview without DB, simulate success
    if (process.env.NODE_ENV !== "production" && !process.env.SINGLESTORE_HOST) {
      console.info("Mock persistDistanceActivity for development/preview")
      return { success: true }
    }

    return { success: false, error: "Failed to persist distance activity" }
  }
}

export async function deleteSession(sessionId: string) {
  try {
    const session = await getServerSession()

    // In development/preview without DB, simulate success
    if (process.env.NODE_ENV !== "production" && !process.env.SINGLESTORE_HOST) {
      console.info("Mock deleteSession for development/preview")
      return { success: true }
    }

    if (!session?.user) {
      return { success: false, error: "No estás autenticado" }
    }

    const db = await getDb()

    // Get activity id from session id
    const actividad_id = await db
      .select({ id: actividades.id })
      .from(actividades)
      .where(eq(actividades.sesion_id, sessionId))

    // Delete all related activity data
    await db.delete(actividades_fuerza).where(eq(actividades_fuerza.actividad_id, actividad_id[0].id))

    await db.delete(actividades_duracion).where(eq(actividades_duracion.actividad_id, actividad_id[0].id))

    await db.delete(actividades_distancia).where(eq(actividades_distancia.actividad_id, actividad_id[0].id))

    // Delete all activities for this session
    await db.delete(actividades).where(eq(actividades.sesion_id, sessionId))

    // Delete the session itself
    await db.delete(sesiones).where(eq(sesiones.id, sessionId))

    return { success: true }
  } catch (error) {
    console.error("Error deleting session:", error)

    // In development/preview without DB, simulate success
    if (process.env.NODE_ENV !== "production" && !process.env.SINGLESTORE_HOST) {
      console.info("Mock deleteSession for development/preview")
      return { success: true }
    }

    return { success: false, error: "Failed to delete session" }
  }
}
