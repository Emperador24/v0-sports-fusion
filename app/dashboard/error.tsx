"use client"

import { useEffect } from "react"
import { Button } from "@/app/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard error:", error)
  }, [error])

  return (
    <div className="fixed inset-0 min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-lg border border-gray-800 p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Algo salió mal</h2>
        <p className="text-gray-400 mb-6">
          Lo sentimos, ha ocurrido un error al cargar el dashboard. Esto puede deberse a un problema de conexión con la
          base de datos.
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={reset} className="bg-gradient-to-r from-[#4D9FFF] to-[#4DFF9F] text-black hover:opacity-90">
            Intentar de nuevo
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  )
}
