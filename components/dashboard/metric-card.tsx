"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: "increase" | "decrease"
    period: string
  }
  icon: React.ReactNode
  iconBgColor?: string
}

export function MetricCard({ title, value, change, icon, iconBgColor = "bg-primary/10" }: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === "number") {
      return new Intl.NumberFormat("en-US").format(val)
    }
    return val
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-heading font-bold">{formatValue(value)}</p>
            {change && (
              <p
                className={`text-xs flex items-center gap-1 mt-1 ${
                  change.type === "increase" ? "text-green-600" : "text-red-600"
                }`}
              >
                {change.type === "increase" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {change.type === "increase" ? "+" : "-"}
                {Math.abs(change.value)}% vs {change.period}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${iconBgColor}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}
