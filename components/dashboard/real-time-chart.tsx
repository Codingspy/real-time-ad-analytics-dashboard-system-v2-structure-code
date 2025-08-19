"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface DataPoint {
  time: string
  value: number
}

interface RealTimeChartProps {
  title: string
  description?: string
  dataKey: string
  color?: string
  maxDataPoints?: number
}

export function RealTimeChart({
  title,
  description,
  dataKey,
  color = "#0891b2",
  maxDataPoints = 20,
}: RealTimeChartProps) {
  const [data, setData] = useState<DataPoint[]>([])

  useEffect(() => {
    // Initialize with some data
    const initialData = Array.from({ length: 10 }, (_, i) => ({
      time: new Date(Date.now() - (9 - i) * 60000).toLocaleTimeString(),
      value: Math.floor(Math.random() * 100) + 50,
    }))
    setData(initialData)

    // Update data every 3 seconds
    const interval = setInterval(() => {
      setData((prevData) => {
        const newPoint = {
          time: new Date().toLocaleTimeString(),
          value: Math.floor(Math.random() * 100) + 50,
        }

        const updatedData = [...prevData, newPoint]

        // Keep only the last maxDataPoints
        if (updatedData.length > maxDataPoints) {
          updatedData.shift()
        }

        return updatedData
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [maxDataPoints])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
