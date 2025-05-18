"use client"

import type * as React from "react"
import { useState } from "react"
import { ChevronRight, Dumbbell, Clock, Route, Plus, Filter, Search, LogOut, User, BarChart } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Badge } from "@/app/components/ui/badge"
import { useRouter } from "next/navigation"
import type { SessionWithActivities } from "../actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { LoadingState } from "@/app/dashboard/registrar-actividades/Components/loading-state"
import { signOut, useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { ActivityChart } from "./activity-chart"

type Activity = {
  id: string
  tipo: "Fuerza" | "Duración" | "Distancia + Tiempo"
  nombre: string
  fecha: Date
  detalles: string
  icono: React.ReactElement
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

function mapSessionToActivities(sessions: SessionWithActivities[]): Activity[] {
  return sessions.flatMap((session) =>
    session.activities.map((activity) => {
      let tipo: "Fuerza" | "Duración" | "Distancia + Tiempo"
      let detalles: string
      let icono: React.ReactElement

      switch (activity.mode) {
        case "Fuerza":
          tipo = "Fuerza"
          detalles = `${activity.data.series} series - ${activity.data.repetitions} repeticiones - ${activity.data.weight} kg`
          icono = <Dumbbell className="h-4 w-4" />
          break
        case "Duración":
          tipo = "Duración"
          detalles = formatTime(activity.data.duration!)
          icono = <Clock className="h-4 w-4" />
          break
        case "Distancia + Tiempo":
          tipo = "Distancia + Tiempo"
          const timeFormatted = formatTime(activity.data.time!)
          detalles = `${activity.data.distance} km - ${timeFormatted} - ${activity.data.ritmo} km/min`
          icono = <Route className="h-4 w-4" />
          break
        default:
          tipo = "Duración"
          detalles = "Sin detalles"
          icono = <Clock className="h-4 w-4" />
      }

      return {
        id: activity.id,
        tipo,
        nombre: activity.name,
        fecha: session.date,
        detalles,
        icono,
      }
    }),
  )
}

export function DashboardContent({ initialSessions }: { initialSessions: SessionWithActivities[] }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [filtro, setFiltro] = useState<string>("todos")
  const [busqueda, setBusqueda] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("actividades")

  const actividades = mapSessionToActivities(initialSessions)

  const handleNuevaActividad = () => {
    setIsLoading(true)
    router.push("/dashboard/registrar-actividades")
  }

  const handleLogout = async () => {
    setIsLoading(true)
    await signOut({ redirect: false })
    router.push("/login")
  }

  // Filtrar actividades según el tipo seleccionado y la búsqueda
  const actividadesFiltradas = actividades.filter((actividad) => {
    const coincideTipo = filtro === "todos" || actividad.tipo === filtro
    const coincideBusqueda =
      actividad.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      actividad.detalles.toLowerCase().includes(busqueda.toLowerCase())

    return coincideTipo && coincideBusqueda
  })

  // Obtener conteo de actividades por tipo
  const conteoActividades = {
    total: actividades.length,
    fuerza: actividades.filter((a) => a.tipo === "Fuerza").length,
    duracion: actividades.filter((a) => a.tipo === "Duración").length,
    distancia: actividades.filter((a) => a.tipo === "Distancia + Tiempo").length,
  }

  // Agrupar actividades por fecha para el monitoreo
  const actividadesPorFecha = actividades.reduce(
    (acc, actividad) => {
      const fecha = format(actividad.fecha, "yyyy-MM-dd")
      if (!acc[fecha]) {
        acc[fecha] = []
      }
      acc[fecha].push(actividad)
      return acc
    },
    {} as Record<string, Activity[]>,
  )

  // Preparar datos para el gráfico
  const chartData = Object.entries(actividadesPorFecha)
    .map(([fecha, acts]) => {
      return {
        fecha,
        total: acts.length,
        fuerza: acts.filter((a) => a.tipo === "Fuerza").length,
        duracion: acts.filter((a) => a.tipo === "Duración").length,
        distancia: acts.filter((a) => a.tipo === "Distancia + Tiempo").length,
      }
    })
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  return (
    <div className="fixed inset-0 min-h-screen bg-[#050505] text-white overflow-auto">
      {isLoading && (
        <div className="fixed inset-0 bg-[#050505]/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingState />
            <p className="mt-4 text-gray-400">Cargando...</p>
          </div>
        </div>
      )}
      {/* Gradient background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#0A0A0A] to-transparent opacity-50 pointer-events-none z-0"></div>
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Mis Actividades
              </span>
            </h1>
            <div className="flex items-center text-gray-400 mt-2">
              <span>Inicio</span>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="text-white">Actividades</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center mr-4 bg-gray-800/50 rounded-full px-3 py-1">
              <User className="h-4 w-4 mr-2 text-gray-400" />
              <span className="text-sm text-gray-300">{session?.user?.name || session?.user?.email}</span>
            </div>
            <Button
              className="bg-gradient-to-r from-[#4D9FFF] to-[#4DFF9F] text-black hover:opacity-90"
              onClick={handleNuevaActividad}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Actividad
            </Button>
            <Button
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>

        {/* Tabs para alternar entre actividades y monitoreo */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-gray-800/50 border border-gray-700">
            <TabsTrigger
              value="actividades"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4D9FFF]/20 data-[state=active]:to-[#4DFF9F]/20 data-[state=active]:text-white"
            >
              Actividades
            </TabsTrigger>
            <TabsTrigger
              value="monitoreo"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4D9FFF]/20 data-[state=active]:to-[#4DFF9F]/20 data-[state=active]:text-white"
            >
              Monitoreo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="actividades">
            {/* Resumen simple */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <Card className="bg-gradient-to-b from-gray-900 to-[#050505] border-gray-800">
                <CardContent className="p-4">
                  <p className="text-gray-400 text-xs">Total</p>
                  <p className="text-2xl font-bold">{conteoActividades.total}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-b from-gray-900 to-[#050505] border-gray-800">
                <CardContent className="p-4">
                  <p className="text-gray-400 text-xs">Fuerza</p>
                  <p className="text-2xl font-bold">{conteoActividades.fuerza}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-b from-gray-900 to-[#050505] border-gray-800">
                <CardContent className="p-4">
                  <p className="text-gray-400 text-xs">Duración</p>
                  <p className="text-2xl font-bold">{conteoActividades.duracion}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-b from-gray-900 to-[#050505] border-gray-800">
                <CardContent className="p-4">
                  <p className="text-gray-400 text-xs">Distancia</p>
                  <p className="text-2xl font-bold">{conteoActividades.distancia}</p>
                </CardContent>
              </Card>
            </div>

            {/* Filtros y búsqueda */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar actividades..."
                  className="pl-9 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={filtro === "todos" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltro("todos")}
                  className={
                    filtro === "todos"
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-800/50 border-gray-700 hover:bg-gray-700"
                  }
                >
                  Todos
                </Button>
                <Button
                  variant={filtro === "Fuerza" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltro("Fuerza")}
                  className={
                    filtro === "Fuerza"
                      ? "bg-[#4D9FFF] hover:bg-[#4D9FFF]/90 text-black"
                      : "bg-gray-800/50 border-gray-700 hover:bg-gray-700"
                  }
                >
                  Fuerza
                </Button>
                <Button
                  variant={filtro === "Duración" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltro("Duración")}
                  className={
                    filtro === "Duración"
                      ? "bg-[#4DFF9F] hover:bg-[#4DFF9F]/90 text-black"
                      : "bg-gray-800/50 border-gray-700 hover:bg-gray-700"
                  }
                >
                  Duración
                </Button>
                <Button
                  variant={filtro === "Distancia + Tiempo" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltro("Distancia + Tiempo")}
                  className={
                    filtro === "Distancia + Tiempo"
                      ? "bg-purple-500 hover:bg-purple-500/90 text-white"
                      : "bg-gray-800/50 border-gray-700 hover:bg-gray-700"
                  }
                >
                  Distancia
                </Button>
              </div>
            </div>

            {/* Lista de actividades */}
            <Card className="bg-gradient-to-b from-gray-900 to-[#050505] border-gray-800">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-gray-400" />
                  Actividades Registradas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {actividadesFiltradas.length > 0 ? (
                  <div className="divide-y divide-gray-800">
                    {actividadesFiltradas.map((actividad) => (
                      <div
                        key={actividad.id}
                        className="flex items-center justify-between p-4 hover:bg-gray-800/30 transition-colors"
                      >
                        <div className="flex items-center">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                              actividad.tipo === "Fuerza"
                                ? "bg-[#4D9FFF]/20 text-[#4D9FFF]"
                                : actividad.tipo === "Duración"
                                  ? "bg-[#4DFF9F]/20 text-[#4DFF9F]"
                                  : "bg-purple-500/20 text-purple-400"
                            }`}
                          >
                            {actividad.icono}
                          </div>
                          <div>
                            <div className="flex items-center">
                              <p className="font-medium">{actividad.nombre}</p>
                              <Badge
                                className={`ml-2 ${
                                  actividad.tipo === "Fuerza"
                                    ? "bg-[#4D9FFF]/20 text-[#4D9FFF] hover:bg-[#4D9FFF]/30"
                                    : actividad.tipo === "Duración"
                                      ? "bg-[#4DFF9F]/20 text-[#4DFF9F] hover:bg-[#4DFF9F]/30"
                                      : "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                                }`}
                              >
                                {actividad.tipo === "Fuerza"
                                  ? "Fuerza"
                                  : actividad.tipo === "Duración"
                                    ? "Duración"
                                    : "Distancia"}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-400">{actividad.detalles}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">
                            {format(actividad.fecha, "d MMM, yyyy", { locale: es })}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-gray-400 hover:text-white hover:bg-transparent"
                          >
                            Ver detalles
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    <p>No se encontraron actividades que coincidan con los filtros.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoreo">
            {/* Sección de monitoreo */}
            <div className="space-y-6">
              {/* Gráfico de actividades */}
              <Card className="bg-gradient-to-b from-gray-900 to-[#050505] border-gray-800">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <BarChart className="h-5 w-5 mr-2 text-gray-400" />
                    Monitoreo de Actividades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ActivityChart data={chartData} />
                  </div>
                </CardContent>
              </Card>

              {/* Resumen de actividades por fecha */}
              <Card className="bg-gradient-to-b from-gray-900 to-[#050505] border-gray-800">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg font-medium">Historial de Actividades</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.entries(actividadesPorFecha).length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries(actividadesPorFecha)
                        .sort(([fechaA], [fechaB]) => new Date(fechaB).getTime() - new Date(fechaA).getTime())
                        .map(([fecha, actividades]) => (
                          <div key={fecha} className="border-b border-gray-800 pb-4 last:border-0 last:pb-0">
                            <h3 className="text-md font-medium mb-2 flex items-center">
                              <span className="text-gray-300">
                                {format(new Date(fecha), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                              </span>
                              <Badge className="ml-2 bg-gray-700 text-gray-300">{actividades.length} actividades</Badge>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {actividades.map((actividad) => (
                                <div
                                  key={actividad.id}
                                  className={`p-3 rounded-lg border ${
                                    actividad.tipo === "Fuerza"
                                      ? "border-[#4D9FFF]/30 bg-[#4D9FFF]/5"
                                      : actividad.tipo === "Duración"
                                        ? "border-[#4DFF9F]/30 bg-[#4DFF9F]/5"
                                        : "border-purple-500/30 bg-purple-500/5"
                                  }`}
                                >
                                  <div className="flex items-center">
                                    <div
                                      className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
                                        actividad.tipo === "Fuerza"
                                          ? "bg-[#4D9FFF]/20 text-[#4D9FFF]"
                                          : actividad.tipo === "Duración"
                                            ? "bg-[#4DFF9F]/20 text-[#4DFF9F]"
                                            : "bg-purple-500/20 text-purple-400"
                                      }`}
                                    >
                                      {actividad.icono}
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">{actividad.nombre}</p>
                                      <p className="text-xs text-gray-400">{actividad.detalles}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      <p>No hay actividades registradas aún.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
