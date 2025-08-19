"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Play,
  Pause,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  Users,
  MousePointer,
  Target,
} from "lucide-react"

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
  platform: "google" | "facebook" | "instagram" | "linkedin" | "twitter"
}

interface CampaignCardProps {
  campaign: Campaign
  onStatusChange?: (id: string, status: Campaign["status"]) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function CampaignCard({ campaign, onStatusChange, onEdit, onDelete }: CampaignCardProps) {
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

  const budgetProgress = (campaign.spent / campaign.budget) * 100

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-heading">{campaign.name}</CardTitle>
            <div className="flex items-center gap-2">
              {getStatusBadge(campaign.status)}
              {getPlatformBadge(campaign.platform)}
            </div>
          </div>
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
              <DropdownMenuItem onClick={() => onEdit?.(campaign.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Campaign
              </DropdownMenuItem>
              {campaign.status === "active" ? (
                <DropdownMenuItem onClick={() => onStatusChange?.(campaign.id, "paused")}>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause Campaign
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onStatusChange?.(campaign.id, "active")}>
                  <Play className="mr-2 h-4 w-4" />
                  Start Campaign
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete?.(campaign.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Campaign
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Budget Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Budget Usage</span>
            <span className="font-medium">
              {formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}
            </span>
          </div>
          <Progress value={budgetProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">{budgetProgress.toFixed(1)}% used</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Impressions</span>
            </div>
            <p className="text-sm font-medium">{formatNumber(campaign.impressions)}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <MousePointer className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Clicks</span>
            </div>
            <p className="text-sm font-medium">{formatNumber(campaign.clicks)}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">CTR</span>
            </div>
            <p className="text-sm font-medium">{campaign.ctr.toFixed(2)}%</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Conversions</span>
            </div>
            <p className="text-sm font-medium">{campaign.conversions}</p>
          </div>
        </div>

        {/* Performance Indicator */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">CPC</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">${campaign.cpc.toFixed(2)}</span>
            {campaign.cpc < 1.5 ? (
              <TrendingDown className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingUp className="h-3 w-3 text-red-600" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
