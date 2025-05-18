import { getServerSession } from "next-auth"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await getServerSession()

  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="grid grid-rows-[1fr] items-center justify-items-center min-h-screen p-8 bg-[#050505] text-white">
      <main className="flex flex-col gap-8 items-center text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4D9FFF] to-[#4DFF9F]">
            SportsFusion
          </span>
        </h1>
        <p className="text-gray-400 max-w-md">
          Registra y monitorea tus actividades deportivas con SportsFusion. Lleva un seguimiento de tus entrenamientos
          de fuerza, duración y distancia.
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-gradient-to-r from-[#4D9FFF] to-[#4DFF9F] text-black gap-2 hover:opacity-90 font-medium text-base h-12 px-8"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-gray-700 transition-colors flex items-center justify-center bg-transparent text-white gap-2 hover:bg-gray-800 font-medium text-base h-12 px-8"
          >
            Registrarse
          </Link>
        </div>
      </main>
    </div>
  )
}
