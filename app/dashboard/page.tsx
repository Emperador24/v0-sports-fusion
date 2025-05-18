import { getAllSessions } from "./actions"
import { DashboardContent } from "./components/dashboard-content"
import { Suspense } from "react"
import DashboardSkeleton from "./components/dashboard-skeleton"

export default async function DashboardPage() {
  let sessions = []

  try {
    sessions = await getAllSessions()
  } catch (error) {
    console.error("Error fetching sessions:", error)
    // Return empty sessions array instead of throwing
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent initialSessions={sessions} />
    </Suspense>
  )
}
