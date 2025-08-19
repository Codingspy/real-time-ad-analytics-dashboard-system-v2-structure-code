"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Plus, Search, MoreHorizontal, Play, Pause, Edit, Trash2, TrendingUp, TrendingDown, Eye } from "lucide-react"

interface Campaign {
  id: string
  name: string
  status: "active" | "paused" | "draft" | "completed"
  budget: number
  spent: number
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  cpc: number
  startDate: string
  endDate: string
  platform: "google" | "facebook" | "instagram" | "linkedin" | "twitter"
}

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Summer Sale 2024",
    status: "active",
    budget: 5000,
    spent: 3250,
    impressions: 125000,
    clicks: 2500,
    conversions: 125,
    ctr: 2.0,
    cpc: 1.3,
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    platform: "google",
  },
  {
    id: "2",
    name: "Brand Awareness Q3",
    status: "active",
    budget: 8000,
    spent: 4200,
    impressions: 200000,
    clicks: 3200,
    conversions: 96,
    ctr: 1.6,
    cpc: 1.31,
    startDate: "2024-07-01",
    endDate: "2024-09-30",
    platform: "facebook",
  },
  {
    id: "3",
    name: "Product Launch Campaign",
    status: "paused",
    budget: 3000,
    spent: 1800,
    impressions: 75000,
    clicks: 1200,
    conversions: 48,
    ctr: 1.6,
    cpc: 1.5,
    startDate: "2024-05-15",
    endDate: "2024-07-15",
    platform: "instagram",
  },
  {
    id: "4",
    name: "Holiday Promotion",
    status: "draft",
    budget: 10000,
    spent: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    ctr: 0,
    cpc: 0,
    startDate: "2024-11-01",
    endDate: "2024-12-31",
    platform: "google",
  },
]

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [platformFilter, setPlatformFilter] = useState<string>("all")

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
    const matchesPlatform = platformFilter === "all" || campaign.platform === platformFilter
    return matchesSearch && matchesStatus && matchesPlatform
  })

  const getStatusBadge = (status: Campaign["status"]) => {
    const variants = {
      active: "default",
      paused: "secondary",
      draft: "outline",
      completed: "secondary",
    } as const

    const colors = {
      active: "bg-green-100 text-green-800 hover:bg-green-100",
      paused: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      draft: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      completed: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    }

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPlatformBadge = (platform: Campaign["platform"]) => {
    const colors = {
      google: "bg-blue-100 text-blue-800",
      facebook: "bg-blue-600 text-white",
      instagram: "bg-pink-100 text-pink-800",
      linkedin: "bg-blue-700 text-white",
      twitter: "bg-sky-100 text-sky-800",
    }

    return (
      <Badge variant="outline" className={colors[platform]}>
        {platform.charAt(0).toUpperCase() + platform.slice(1)}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-heading font-bold text-foreground">Campaigns</h1>
                <p className="text-muted-foreground mt-1">Manage and monitor your advertising campaigns</p>
              </div>
              <Link href="/campaigns/create">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Campaign
                </Button>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Campaigns</p>
                      <p className="text-2xl font-heading font-bold">{campaigns.length}</p>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                      <p className="text-2xl font-heading font-bold">
                        {campaigns.filter((c) => c.status === "active").length}
                      </p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Play className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                      <p className="text-2xl font-heading font-bold">
                        {formatCurrency(campaigns.reduce((sum, c) => sum + c.budget, 0))}
                      </p>
                    </div>
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                      <p className="text-2xl font-heading font-bold">
                        {formatCurrency(campaigns.reduce((sum, c) => sum + c.spent, 0))}
                      </p>
                    </div>
                    <div className="p-2 bg-red-100 rounded-lg">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Campaigns Table */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Campaign Performance</CardTitle>
              <CardDescription>Overview of all your advertising campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Spent</TableHead>
                      <TableHead>Impressions</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>CTR</TableHead>
                      <TableHead>CPC</TableHead>
                      <TableHead>Conversions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCampaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{campaign.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {campaign.startDate} - {campaign.endDate}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                        <TableCell>{getPlatformBadge(campaign.platform)}</TableCell>
                        <TableCell>{formatCurrency(campaign.budget)}</TableCell>
                        <TableCell>
                          <div>
                            <p>{formatCurrency(campaign.spent)}</p>
                            <p className="text-xs text-muted-foreground">
                              {((campaign.spent / campaign.budget) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{formatNumber(campaign.impressions)}</TableCell>
                        <TableCell>{formatNumber(campaign.clicks)}</TableCell>
                        <TableCell>{campaign.ctr.toFixed(2)}%</TableCell>
                        <TableCell>${campaign.cpc.toFixed(2)}</TableCell>
                        <TableCell>{campaign.conversions}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Campaign
                              </DropdownMenuItem>
                              {campaign.status === "active" ? (
                                <DropdownMenuItem>
                                  <Pause className="mr-2 h-4 w-4" />
                                  Pause Campaign
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem>
                                  <Play className="mr-2 h-4 w-4" />
                                  Start Campaign
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Campaign
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
