"use client"

import { useRef } from "react"
import { BarChart as Chart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

type ChartData = {
  fecha: string
  total: number
  fuerza: number
  duracion: number
  distancia: number
}

export function ActivityChart({ data }: { data: ChartData[] }) {
  const chartRef = useRef<HTMLDivElement>(null)

  // Format date for display
  const formattedData = data.map((item) => {
    const date = new Date(item.fecha)
    return {
      ...item,
      fecha: `${date.getDate()}/${date.getMonth() + 1}`,
    }
  })

  return (
    <div ref={chartRef} className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <Chart
          data={formattedData}
          margin={{
            top: 20,
            right: 30,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="fecha" stroke="#999" />
          <YAxis stroke="#999" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#222",
              border: "1px solid #444",
              borderRadius: "4px",
              color: "#fff",
            }}
          />
          <Legend />
          <Bar dataKey="fuerza" name="Fuerza" fill="#4D9FFF" radius={[4, 4, 0, 0]} />
          <Bar dataKey="duracion" name="Duración" fill="#4DFF9F" radius={[4, 4, 0, 0]} />
          <Bar dataKey="distancia" name="Distancia" fill="#9F4DFF" radius={[4, 4, 0, 0]} />
        </Chart>
      </ResponsiveContainer>
    </div>
  )
}
