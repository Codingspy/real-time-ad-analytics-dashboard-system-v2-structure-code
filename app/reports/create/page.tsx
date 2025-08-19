"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthGuard } from "@/components/auth/auth-guard"
import { ArrowLeft, Save, Play, Calendar, FileText, Settings, BarChart3, Users, Target, TrendingUp } from "lucide-react"

interface ReportConfig {
  name: string
  description: string
  type: string
  template: string
  dateRange: string
  customStartDate: string
  customEndDate: string
  metrics: string[]
  dimensions: string[]
  filters: {
    campaigns: string[]
    platforms: string[]
    countries: string[]
  }
  format: string
  schedule: {
    enabled: boolean
    frequency: string
    time: string
    recipients: string[]
  }
}

const reportTypes = [
  {
    id: "performance",
    name: "Performance Report",
    description: "Comprehensive overview of campaign performance metrics",
    icon: <BarChart3 className="h-5 w-5" />,
    metrics: ["impressions", "clicks", "conversions", "spend", "ctr", "cpc", "cpa", "roas"],
  },
  {
    id: "campaign",
    name: "Campaign Analysis",
    description: "Detailed analysis of individual campaign performance",
    icon: <Target className="h-5 w-5" />,
    metrics: ["impressions", "clicks", "conversions", "spend", "ctr", "cpc", "quality_score"],
  },
  {
    id: "audience",
    name: "Audience Insights",
    description: "Demographics and behavior analysis of your audience",
    icon: <Users className="h-5 w-5" />,
    metrics: ["impressions", "clicks", "age_groups", "gender", "interests", "devices"],
  },
  {
    id: "conversion",
    name: "Conversion Report",
    description: "Track conversion paths and optimization opportunities",
    icon: <TrendingUp className="h-5 w-5" />,
    metrics: ["conversions", "conversion_rate", "conversion_value", "attribution", "funnel_steps"],
  },
]

const availableMetrics = [
  { id: "impressions", name: "Impressions", category: "reach" },
  { id: "clicks", name: "Clicks", category: "engagement" },
  { id: "conversions", name: "Conversions", category: "conversion" },
  { id: "spend", name: "Spend", category: "cost" },
  { id: "ctr", name: "Click-Through Rate", category: "performance" },
  { id: "cpc", name: "Cost Per Click", category: "cost" },
  { id: "cpa", name: "Cost Per Acquisition", category: "cost" },
  { id: "roas", name: "Return on Ad Spend", category: "performance" },
  { id: "quality_score", name: "Quality Score", category: "performance" },
  { id: "age_groups", name: "Age Groups", category: "demographics" },
  { id: "gender", name: "Gender", category: "demographics" },
  { id: "interests", name: "Interests", category: "demographics" },
  { id: "devices", name: "Devices", category: "technical" },
  { id: "conversion_rate", name: "Conversion Rate", category: "conversion" },
  { id: "conversion_value", name: "Conversion Value", category: "conversion" },
  { id: "attribution", name: "Attribution", category: "conversion" },
  { id: "funnel_steps", name: "Funnel Steps", category: "conversion" },
]

const availableDimensions = [
  { id: "date", name: "Date" },
  { id: "campaign", name: "Campaign" },
  { id: "platform", name: "Platform" },
  { id: "device", name: "Device" },
  { id: "country", name: "Country" },
  { id: "age_group", name: "Age Group" },
  { id: "gender", name: "Gender" },
]

export default function CreateReportPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateParam = searchParams.get("template")

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [config, setConfig] = useState<ReportConfig>({
    name: "",
    description: "",
    type: templateParam || "",
    template: templateParam || "",
    dateRange: "last_30_days",
    customStartDate: "",
    customEndDate: "",
    metrics: templateParam ? reportTypes.find((t) => t.id === templateParam)?.metrics || [] : [],
    dimensions: ["date", "campaign"],
    filters: {
      campaigns: [],
      platforms: [],
      countries: [],
    },
    format: "pdf",
    schedule: {
      enabled: false,
      frequency: "weekly",
      time: "09:00",
      recipients: [],
    },
  })

  const handleConfigChange = (field: string, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
  }

  const handleMetricToggle = (metricId: string) => {
    setConfig((prev) => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter((m) => m !== metricId)
        : [...prev.metrics, metricId],
    }))
  }

  const handleDimensionToggle = (dimensionId: string) => {
    setConfig((prev) => ({
      ...prev,
      dimensions: prev.dimensions.includes(dimensionId)
        ? prev.dimensions.filter((d) => d !== dimensionId)
        : [...prev.dimensions, dimensionId],
    }))
  }

  const handleScheduleChange = (field: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      schedule: { ...prev.schedule, [field]: value },
    }))
  }

  const handleSubmit = async (action: "save" | "generate") => {
    setIsLoading(true)
    setError("")

    // Basic validation
    if (!config.name || !config.type || config.metrics.length === 0) {
      setError("Please fill in all required fields and select at least one metric")
      setIsLoading(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      if (action === "generate") {
        router.push("/reports?generated=true")
      } else {
        router.push("/reports?saved=true")
      }
      setIsLoading(false)
    }, 2000)
  }

  const selectedReportType = reportTypes.find((t) => t.id === config.type)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/reports">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Reports
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Create New Report</h1>
              <p className="text-muted-foreground mt-1">Configure your analytics report</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Configuration */}
            <div className="lg:col-span-2 space-y-8">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-heading">
                    <FileText className="h-5 w-5" />
                    Report Details
                  </CardTitle>
                  <CardDescription>Basic information about your report</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Report Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter report name"
                      value={config.name}
                      onChange={(e) => handleConfigChange("name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this report will analyze"
                      value={config.description}
                      onChange={(e) => handleConfigChange("description", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Report Type *</Label>
                    <RadioGroup value={config.type} onValueChange={(value) => handleConfigChange("type", value)}>
                      {reportTypes.map((type) => (
                        <div key={type.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={type.id} id={type.id} />
                          <Label htmlFor={type.id} className="flex items-center gap-3 cursor-pointer">
                            <div className="p-2 bg-muted rounded-lg">{type.icon}</div>
                            <div>
                              <p className="font-medium">{type.name}</p>
                              <p className="text-sm text-muted-foreground">{type.description}</p>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              {/* Date Range */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-heading">
                    <Calendar className="h-5 w-5" />
                    Date Range
                  </CardTitle>
                  <CardDescription>Select the time period for your report</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Time Period</Label>
                    <Select value={config.dateRange} onValueChange={(value) => handleConfigChange("dateRange", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last_7_days">Last 7 days</SelectItem>
                        <SelectItem value="last_30_days">Last 30 days</SelectItem>
                        <SelectItem value="last_90_days">Last 90 days</SelectItem>
                        <SelectItem value="last_year">Last year</SelectItem>
                        <SelectItem value="custom">Custom range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {config.dateRange === "custom" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={config.customStartDate}
                          onChange={(e) => handleConfigChange("customStartDate", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={config.customEndDate}
                          onChange={(e) => handleConfigChange("customEndDate", e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Metrics Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Metrics & Dimensions</CardTitle>
                  <CardDescription>Choose what data to include in your report</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Metrics *</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {availableMetrics
                        .filter((metric) => !selectedReportType || selectedReportType.metrics.includes(metric.id))
                        .map((metric) => (
                          <div key={metric.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={metric.id}
                              checked={config.metrics.includes(metric.id)}
                              onCheckedChange={() => handleMetricToggle(metric.id)}
                            />
                            <Label htmlFor={metric.id} className="text-sm cursor-pointer">
                              {metric.name}
                            </Label>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Dimensions</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {availableDimensions.map((dimension) => (
                        <div key={dimension.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={dimension.id}
                            checked={config.dimensions.includes(dimension.id)}
                            onCheckedChange={() => handleDimensionToggle(dimension.id)}
                          />
                          <Label htmlFor={dimension.id} className="text-sm cursor-pointer">
                            {dimension.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Output Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-heading">
                    <Settings className="h-5 w-5" />
                    Output Settings
                  </CardTitle>
                  <CardDescription>Configure report format and delivery</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Export Format</Label>
                    <Select value={config.format} onValueChange={(value) => handleConfigChange("format", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Report</SelectItem>
                        <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                        <SelectItem value="csv">CSV Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="schedule"
                        checked={config.schedule.enabled}
                        onCheckedChange={(checked) => handleScheduleChange("enabled", checked)}
                      />
                      <Label htmlFor="schedule">Schedule automatic generation</Label>
                    </div>

                    {config.schedule.enabled && (
                      <div className="grid grid-cols-2 gap-4 pl-6">
                        <div className="space-y-2">
                          <Label>Frequency</Label>
                          <Select
                            value={config.schedule.frequency}
                            onValueChange={(value) => handleScheduleChange("frequency", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Time</Label>
                          <Input
                            type="time"
                            value={config.schedule.time}
                            onChange={(e) => handleScheduleChange("time", e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview & Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Report Preview</CardTitle>
                  <CardDescription>Summary of your report configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Report Name</p>
                    <p className="text-sm">{config.name || "Untitled Report"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                    <p className="text-sm">{selectedReportType?.name || "Not selected"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date Range</p>
                    <p className="text-sm">{config.dateRange.replace(/_/g, " ")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Metrics</p>
                    <p className="text-sm">{config.metrics.length} selected</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Format</p>
                    <p className="text-sm uppercase">{config.format}</p>
                  </div>
                  {config.schedule.enabled && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Schedule</p>
                      <p className="text-sm">
                        {config.schedule.frequency} at {config.schedule.time}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button onClick={() => handleSubmit("generate")} disabled={isLoading} className="w-full gap-2">
                  <Play className="h-4 w-4" />
                  {isLoading ? "Generating..." : "Generate Report"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSubmit("save")}
                  disabled={isLoading}
                  className="w-full gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save as Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
