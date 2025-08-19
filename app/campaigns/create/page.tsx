"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthGuard } from "@/components/auth/auth-guard"
import { ArrowLeft, Save, Play, Target, DollarSign, Globe } from "lucide-react"
import Link from "next/link"

interface CampaignFormData {
  name: string
  description: string
  objective: string
  platform: string
  budget: string
  budgetType: "daily" | "total"
  startDate: string
  endDate: string
  targetAudience: {
    ageMin: string
    ageMax: string
    gender: string
    location: string
    interests: string[]
  }
  adFormat: string
  bidStrategy: string
}

export default function CreateCampaignPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    description: "",
    objective: "",
    platform: "",
    budget: "",
    budgetType: "daily",
    startDate: "",
    endDate: "",
    targetAudience: {
      ageMin: "18",
      ageMax: "65",
      gender: "all",
      location: "",
      interests: [],
    },
    adFormat: "",
    bidStrategy: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAudienceChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      targetAudience: { ...prev.targetAudience, [field]: value },
    }))
  }

  const handleSubmit = async (e: React.FormEvent, action: "save" | "launch") => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Basic validation
    if (!formData.name || !formData.platform || !formData.budget) {
      setError("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      if (action === "launch") {
        router.push("/campaigns?launched=true")
      } else {
        router.push("/campaigns?saved=true")
      }
      setIsLoading(false)
    }, 1500)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/campaigns">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Campaigns
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Create New Campaign</h1>
              <p className="text-muted-foreground mt-1">Set up your advertising campaign</p>
            </div>
          </div>

          <form className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <Target className="h-5 w-5" />
                  Campaign Details
                </CardTitle>
                <CardDescription>Basic information about your campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Campaign Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter campaign name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platform">Platform *</Label>
                    <Select value={formData.platform} onValueChange={(value) => handleInputChange("platform", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google">Google Ads</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your campaign objectives and strategy"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objective">Campaign Objective</Label>
                  <Select value={formData.objective} onValueChange={(value) => handleInputChange("objective", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select campaign objective" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="awareness">Brand Awareness</SelectItem>
                      <SelectItem value="traffic">Website Traffic</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="leads">Lead Generation</SelectItem>
                      <SelectItem value="conversions">Conversions</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Budget & Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <DollarSign className="h-5 w-5" />
                  Budget & Schedule
                </CardTitle>
                <CardDescription>Set your campaign budget and timeline</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget Amount *</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="0.00"
                      value={formData.budget}
                      onChange={(e) => handleInputChange("budget", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budgetType">Budget Type</Label>
                    <Select
                      value={formData.budgetType}
                      onValueChange={(value) => handleInputChange("budgetType", value as "daily" | "total")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily Budget</SelectItem>
                        <SelectItem value="total">Total Budget</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bidStrategy">Bid Strategy</Label>
                    <Select
                      value={formData.bidStrategy}
                      onValueChange={(value) => handleInputChange("bidStrategy", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select bid strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cpc">Cost Per Click (CPC)</SelectItem>
                        <SelectItem value="cpm">Cost Per Mille (CPM)</SelectItem>
                        <SelectItem value="cpa">Cost Per Acquisition (CPA)</SelectItem>
                        <SelectItem value="auto">Automatic Bidding</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange("endDate", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Target Audience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <Globe className="h-5 w-5" />
                  Target Audience
                </CardTitle>
                <CardDescription>Define who you want to reach with your campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ageMin">Min Age</Label>
                    <Input
                      id="ageMin"
                      type="number"
                      min="13"
                      max="65"
                      value={formData.targetAudience.ageMin}
                      onChange={(e) => handleAudienceChange("ageMin", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ageMax">Max Age</Label>
                    <Input
                      id="ageMax"
                      type="number"
                      min="13"
                      max="65"
                      value={formData.targetAudience.ageMax}
                      onChange={(e) => handleAudienceChange("ageMax", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.targetAudience.gender}
                      onValueChange={(value) => handleAudienceChange("gender", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Enter location"
                      value={formData.targetAudience.location}
                      onChange={(e) => handleAudienceChange("location", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adFormat">Ad Format</Label>
                  <Select value={formData.adFormat} onValueChange={(value) => handleInputChange("adFormat", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ad format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Single Image</SelectItem>
                      <SelectItem value="carousel">Carousel</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="collection">Collection</SelectItem>
                      <SelectItem value="text">Text Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => handleSubmit(e, "save")}
                disabled={isLoading}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save as Draft
              </Button>
              <Button type="button" onClick={(e) => handleSubmit(e, "launch")} disabled={isLoading} className="gap-2">
                <Play className="h-4 w-4" />
                {isLoading ? "Creating..." : "Launch Campaign"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  )
}
