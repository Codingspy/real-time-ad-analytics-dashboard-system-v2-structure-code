"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AuthGuard } from "@/components/auth/auth-guard"
import { TrendingUp, MousePointer, Target, DollarSign, Eye, Clock, Globe, RefreshCw } from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// Mock real-time data
const generateMockData = () => ({
  overview: {
    totalImpressions: Math.floor(Math.random() * 100000) + 500000,
    totalClicks: Math.floor(Math.random() * 10000) + 25000,
    totalConversions: Math.floor(Math.random() * 1000) + 2500,
    totalSpend: Math.floor(Math.random() * 5000) + 15000,
    ctr: (Math.random() * 2 + 1.5).toFixed(2),
    cpc: (Math.random() * 0.5 + 1.0).toFixed(2),
    cpa: (Math.random() * 10 + 15).toFixed(2),
    roas: (Math.random() * 2 + 3).toFixed(2),
  },
  hourlyData: Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    impressions: Math.floor(Math.random() * 5000) + 1000,
    clicks: Math.floor(Math.random() * 500) + 100,
    conversions: Math.floor(Math.random() * 50) + 10,
    spend: Math.floor(Math.random() * 200) + 50,
  })),
  campaignPerformance: [
    { name: "Summer Sale 2024", impressions: 125000, clicks: 2500, conversions: 125, spend: 3250 },
    { name: "Brand Awareness Q3", impressions: 200000, clicks: 3200, conversions: 96, spend: 4200 },
    { name: "Product Launch", impressions: 75000, clicks: 1200, conversions: 48, spend: 1800 },
    { name: "Holiday Promotion", impressions: 50000, clicks: 800, conversions: 32, spend: 1200 },
  ],
  deviceBreakdown: [
    { name: "Desktop", value: 45, color: "#0891b2" },
    { name: "Mobile", value: 40, color: "#f59e0b" },
    { name: "Tablet", value: 15, color: "#dc2626" },
  ],
  geoData: [
    { country: "United States", impressions: 150000, clicks: 3000, conversions: 150 },
    { country: "Canada", impressions: 80000, clicks: 1600, conversions: 80 },
    { country: "United Kingdom", impressions: 70000, clicks: 1400, conversions: 70 },
    { country: "Germany", impressions: 60000, clicks: 1200, conversions: 60 },
    { country: "France", impressions: 40000, clicks: 800, conversions: 40 },
  ],
  recentEvents: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    type: ["click", "conversion", "impression"][Math.floor(Math.random() * 3)],
    campaign: ["Summer Sale 2024", "Brand Awareness Q3", "Product Launch"][Math.floor(Math.random() * 3)],
    timestamp: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString(),
    value: Math.floor(Math.random() * 100) + 1,
  })),
})

export default function DashboardPage() {
  const [data, setData] = useState(generateMockData())
  const [timeRange, setTimeRange] = useState("24h")
  const [isLive, setIsLive] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      setData(generateMockData())
      setLastUpdate(new Date())
    }, 3000)

    return () => clearInterval(interval)
  }, [isLive])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "click":
        return <MousePointer className="h-4 w-4 text-primary" />
      case "conversion":
        return <Target className="h-4 w-4 text-green-600" />
      case "impression":
        return <Eye className="h-4 w-4 text-muted-foreground" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  const getEventBadge = (type: string) => {
    const colors = {
      click: "bg-primary/10 text-primary",
      conversion: "bg-green-100 text-green-800",
      impression: "bg-gray-100 text-gray-800",
    }
    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Analytics Dashboard</h1>
              <p className="text-muted-foreground mt-1">Real-time insights into your advertising performance</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                <span className="text-sm text-muted-foreground">
                  {isLive ? "Live" : "Paused"} • Last update: {lastUpdate.toLocaleTimeString()}
                </span>
              </div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => setIsLive(!isLive)} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${isLive ? "animate-spin" : ""}`} />
                {isLive ? "Pause" : "Resume"}
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Impressions</p>
                    <p className="text-2xl font-heading font-bold">{formatNumber(data.overview.totalImpressions)}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      +12.5% vs yesterday
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
                    <p className="text-2xl font-heading font-bold">{formatNumber(data.overview.totalClicks)}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      +8.2% vs yesterday
                    </p>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <MousePointer className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Conversions</p>
                    <p className="text-2xl font-heading font-bold">{formatNumber(data.overview.totalConversions)}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      +15.3% vs yesterday
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Spend</p>
                    <p className="text-2xl font-heading font-bold">{formatCurrency(data.overview.totalSpend)}</p>
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      +5.7% vs yesterday
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm font-medium text-muted-foreground">Click-Through Rate</p>
                <p className="text-3xl font-heading font-bold text-primary">{data.overview.ctr}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm font-medium text-muted-foreground">Cost Per Click</p>
                <p className="text-3xl font-heading font-bold text-accent">${data.overview.cpc}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm font-medium text-muted-foreground">Cost Per Acquisition</p>
                <p className="text-3xl font-heading font-bold text-foreground">${data.overview.cpa}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm font-medium text-muted-foreground">Return on Ad Spend</p>
                <p className="text-3xl font-heading font-bold text-green-600">{data.overview.roas}x</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Hourly Performance Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="font-heading">Hourly Performance</CardTitle>
                <CardDescription>Real-time performance metrics over the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="impressions"
                        stackId="1"
                        stroke="#0891b2"
                        fill="#0891b2"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="clicks"
                        stackId="2"
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="conversions"
                        stackId="3"
                        stroke="#dc2626"
                        fill="#dc2626"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Device Breakdown</CardTitle>
                <CardDescription>Traffic distribution by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.deviceBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.deviceBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {data.deviceBreakdown.map((device, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: device.color }} />
                        <span className="text-sm">{device.name}</span>
                      </div>
                      <span className="text-sm font-medium">{device.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Campaign Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Campaign Performance</CardTitle>
                <CardDescription>Top performing campaigns by impressions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.campaignPerformance} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip />
                      <Bar dataKey="impressions" fill="#0891b2" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Geographic Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Geographic Performance</CardTitle>
                <CardDescription>Performance by country</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.geoData.map((country, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{country.country}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatNumber(country.impressions)} impressions</p>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(country.clicks)} clicks • {country.conversions} conversions
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                <Clock className="h-5 w-5" />
                Real-time Events
              </CardTitle>
              <CardDescription>Live stream of advertising events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getEventIcon(event.type)}
                      <div>
                        <p className="text-sm font-medium">{event.campaign}</p>
                        <p className="text-xs text-muted-foreground">{event.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getEventBadge(event.type)}
                      <span className="text-sm font-medium">${event.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
