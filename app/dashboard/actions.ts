"use server"

import { getDb } from "@/server/db"
import {
  sesiones,
  actividades,
  actividades_fuerza,
  actividades_duracion,
  actividades_distancia,
} from "@/server/db/schema"
import { desc, eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export type ActivityData = {
  id: string
  name: string
  mode: "Fuerza" | "Duración" | "Distancia + Tiempo"
  data: {
    series?: number
    repetitions?: number
    weight?: number
    duration?: number
    distance?: number
    time?: number
    ritmo?: number
  }
}

export type SessionWithActivities = {
  id: string
  date: Date
  note: string | null
  activities: ActivityData[]
}

export async function getAllSessions(): Promise<SessionWithActivities[]> {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      // In development/preview without DB, return mock data
      if (process.env.NODE_ENV !== "production" && !process.env.SINGLESTORE_HOST) {
        return getMockSessions()
      }
      redirect("/login")
    }

    const db = await getDb()

    // If we're in development/preview without DB, return mock data
    if (process.env.NODE_ENV !== "production" && !process.env.SINGLESTORE_HOST) {
      return getMockSessions()
    }

    // Get all sessions for the current user sorted by created_at desc
    const sessions = await db
      .select()
      .from(sesiones)
      .where(eq(sesiones.user_id, session.user.id))
      .orderBy(desc(sesiones.created_at))

    // For each session, get its activities and their specific data
    const sessionsWithActivities = await Promise.all(
      sessions.map(async (session) => {
        // Get all activities for this session
        const sessionActivities = await db.select().from(actividades).where(eq(actividades.sesion_id, session.id))

        // For each activity, get its specific data based on mode
        const activitiesWithData = await Promise.all(
          sessionActivities.map(async (activity): Promise<ActivityData> => {
            let specificData = {}

            switch (activity.modo) {
              case "Fuerza": {
                const strengthData = await db
                  .select({
                    series: actividades_fuerza.series,
                    repeticiones: actividades_fuerza.repeticiones,
                    peso: actividades_fuerza.peso,
                  })
                  .from(actividades_fuerza)
                  .where(eq(actividades_fuerza.actividad_id, activity.id))
                  .limit(1)

                if (strengthData.length > 0) {
                  specificData = {
                    series: strengthData[0].series,
                    repetitions: strengthData[0].repeticiones,
                    weight: strengthData[0].peso,
                  }
                }
                break
              }
              case "Duración": {
                const durationData = await db
                  .select({
                    duracion: actividades_duracion.duracion,
                  })
                  .from(actividades_duracion)
                  .where(eq(actividades_duracion.actividad_id, activity.id))
                  .limit(1)

                if (durationData.length > 0) {
                  specificData = {
                    duration: durationData[0].duracion,
                  }
                }
                break
              }
              case "Distancia + Tiempo": {
                const distanceData = await db
                  .select({
                    distancia: actividades_distancia.distancia,
                    tiempo: actividades_distancia.tiempo,
                    ritmo: actividades_distancia.ritmo,
                  })
                  .from(actividades_distancia)
                  .where(eq(actividades_distancia.actividad_id, activity.id))
                  .limit(1)

                if (distanceData.length > 0) {
                  specificData = {
                    distance: distanceData[0].distancia,
                    time: distanceData[0].tiempo,
                    ritmo: distanceData[0].ritmo,
                  }
                }
                break
              }
            }

            return {
              id: activity.id,
              name: activity.deporte,
              mode: activity.modo,
              data: specificData,
            }
          }),
        )

        return {
          id: session.id,
          date: session.fecha,
          note: session.nota,
          activities: activitiesWithData,
        }
      }),
    )

    return sessionsWithActivities
  } catch (error) {
    console.error("Error fetching sessions:", error)

    // In development/preview, return mock data
    if (process.env.NODE_ENV !== "production") {
      return getMockSessions()
    }

    // In production, rethrow the error to be handled by error boundary
    throw error
  }
}

// Mock data for development/preview environments
function getMockSessions(): SessionWithActivities[] {
  return [
    {
      id: "mock-session-1",
      date: new Date(),
      note: "Sesión de ejemplo",
      activities: [
        {
          id: "mock-activity-1",
          name: "Musculación",
          mode: "Fuerza",
          data: {
            series: 3,
            repetitions: 12,
            weight: 50,
          },
        },
        {
          id: "mock-activity-2",
          name: "Yoga",
          mode: "Duración",
          data: {
            duration: 1800, // 30 minutes in seconds
          },
        },
      ],
    },
    {
      id: "mock-session-2",
      date: new Date(Date.now() - 86400000), // Yesterday
      note: "Sesión anterior",
      activities: [
        {
          id: "mock-activity-3",
          name: "Running",
          mode: "Distancia + Tiempo",
          data: {
            distance: 5,
            time: 1500, // 25 minutes in seconds
            ritmo: 300, // 5 minutes per km
          },
        },
      ],
    },
  ]
}
