"use client"

import { Badge } from "@/components/ui/badge"
import { Crown, Shield, User } from "lucide-react"

interface UserRoleBadgeProps {
  role: "admin" | "manager" | "analyst" | "viewer"
  showIcon?: boolean
}

const roleConfig = {
  admin: {
    name: "Administrator",
    color: "bg-red-100 text-red-800 hover:bg-red-100",
    icon: <Crown className="h-3 w-3" />,
  },
  manager: {
    name: "Manager",
    color: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    icon: <Shield className="h-3 w-3" />,
  },
  analyst: {
    name: "Analyst",
    color: "bg-green-100 text-green-800 hover:bg-green-100",
    icon: <User className="h-3 w-3" />,
  },
  viewer: {
    name: "Viewer",
    color: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    icon: <User className="h-3 w-3" />,
  },
}

export function UserRoleBadge({ role, showIcon = true }: UserRoleBadgeProps) {
  const config = roleConfig[role]

  return (
    <Badge variant="outline" className={config.color}>
      <span className="flex items-center gap-1">
        {showIcon && config.icon}
        {config.name}
      </span>
    </Badge>
  )
}
