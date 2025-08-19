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
import {
  Plus,
  Search,
  FileText,
  Download,
  Calendar,
  Clock,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Share,
  RefreshCw,
} from "lucide-react"

interface Report {
  id: string
  name: string
  type: "performance" | "campaign" | "audience" | "conversion" | "custom"
  status: "completed" | "generating" | "scheduled" | "failed"
  createdAt: string
  lastGenerated: string
  schedule: string | null
  format: "pdf" | "csv" | "xlsx"
  size: string
  downloads: number
}

const mockReports: Report[] = [
  {
    id: "1",
    name: "Weekly Performance Summary",
    type: "performance",
    status: "completed",
    createdAt: "2024-01-15",
    lastGenerated: "2024-01-22",
    schedule: "Weekly",
    format: "pdf",
    size: "2.4 MB",
    downloads: 12,
  },
  {
    id: "2",
    name: "Campaign ROI Analysis",
    type: "campaign",
    status: "completed",
    createdAt: "2024-01-10",
    lastGenerated: "2024-01-21",
    schedule: null,
    format: "xlsx",
    size: "1.8 MB",
    downloads: 8,
  },
  {
    id: "3",
    name: "Audience Demographics Report",
    type: "audience",
    status: "generating",
    createdAt: "2024-01-20",
    lastGenerated: "2024-01-20",
    schedule: "Monthly",
    format: "pdf",
    size: "3.1 MB",
    downloads: 5,
  },
  {
    id: "4",
    name: "Conversion Funnel Analysis",
    type: "conversion",
    status: "scheduled",
    createdAt: "2024-01-18",
    lastGenerated: "2024-01-18",
    schedule: "Daily",
    format: "csv",
    size: "856 KB",
    downloads: 15,
  },
  {
    id: "5",
    name: "Custom Marketing Dashboard",
    type: "custom",
    status: "failed",
    createdAt: "2024-01-19",
    lastGenerated: "2024-01-19",
    schedule: null,
    format: "pdf",
    size: "0 KB",
    downloads: 0,
  },
]

const reportTemplates = [
  {
    id: "performance",
    name: "Performance Report",
    description: "Comprehensive overview of campaign performance metrics",
    icon: <FileText className="h-6 w-6" />,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "campaign",
    name: "Campaign Analysis",
    description: "Detailed analysis of individual campaign performance",
    icon: <FileText className="h-6 w-6" />,
    color: "bg-accent/10 text-accent",
  },
  {
    id: "audience",
    name: "Audience Insights",
    description: "Demographics and behavior analysis of your audience",
    icon: <FileText className="h-6 w-6" />,
    color: "bg-green-100 text-green-600",
  },
  {
    id: "conversion",
    name: "Conversion Report",
    description: "Track conversion paths and optimization opportunities",
    icon: <FileText className="h-6 w-6" />,
    color: "bg-purple-100 text-purple-600",
  },
]

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(mockReports)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || report.status === statusFilter
    const matchesType = typeFilter === "all" || report.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status: Report["status"]) => {
    const variants = {
      completed: "bg-green-100 text-green-800",
      generating: "bg-blue-100 text-blue-800",
      scheduled: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
    }

    return (
      <Badge variant="outline" className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getTypeBadge = (type: Report["type"]) => {
    const colors = {
      performance: "bg-primary/10 text-primary",
      campaign: "bg-accent/10 text-accent",
      audience: "bg-green-100 text-green-600",
      conversion: "bg-purple-100 text-purple-600",
      custom: "bg-gray-100 text-gray-600",
    }

    return (
      <Badge variant="outline" className={colors[type]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  const handleDownload = (reportId: string) => {
    // Simulate download
    const report = reports.find((r) => r.id === reportId)
    if (report) {
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, downloads: r.downloads + 1 } : r)))
    }
  }

  const handleRegenerate = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? { ...r, status: "generating" as const, lastGenerated: new Date().toISOString().split("T")[0] }
          : r,
      ),
    )

    // Simulate generation completion
    setTimeout(() => {
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: "completed" as const } : r)))
    }, 3000)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-heading font-bold text-foreground">Reports</h1>
                <p className="text-muted-foreground mt-1">Generate and manage your analytics reports</p>
              </div>
              <Link href="/reports/create">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Report
                </Button>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                      <p className="text-2xl font-heading font-bold">{reports.length}</p>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Scheduled Reports</p>
                      <p className="text-2xl font-heading font-bold">{reports.filter((r) => r.schedule).length}</p>
                    </div>
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Downloads</p>
                      <p className="text-2xl font-heading font-bold">
                        {reports.reduce((sum, r) => sum + r.downloads, 0)}
                      </p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Download className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Generating</p>
                      <p className="text-2xl font-heading font-bold">
                        {reports.filter((r) => r.status === "generating").length}
                      </p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Report Templates */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-heading">Quick Start Templates</CardTitle>
              <CardDescription>Choose from pre-built report templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {reportTemplates.map((template) => (
                  <Link key={template.id} href={`/reports/create?template=${template.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${template.color}`}>{template.icon}</div>
                          <h3 className="font-medium">{template.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
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
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="generating">Generating</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="campaign">Campaign</SelectItem>
                    <SelectItem value="audience">Audience</SelectItem>
                    <SelectItem value="conversion">Conversion</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Generated Reports</CardTitle>
              <CardDescription>Manage your analytics reports and downloads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Downloads</TableHead>
                      <TableHead>Last Generated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{report.name}</p>
                            <p className="text-sm text-muted-foreground">Created {report.createdAt}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(report.type)}</TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell>
                          {report.schedule ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {report.schedule}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">One-time</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="uppercase">
                            {report.format}
                          </Badge>
                        </TableCell>
                        <TableCell>{report.size}</TableCell>
                        <TableCell>{report.downloads}</TableCell>
                        <TableCell>{report.lastGenerated}</TableCell>
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
                                View Report
                              </DropdownMenuItem>
                              {report.status === "completed" && (
                                <DropdownMenuItem onClick={() => handleDownload(report.id)}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleRegenerate(report.id)}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Regenerate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share className="mr-2 h-4 w-4" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Settings
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Report
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
