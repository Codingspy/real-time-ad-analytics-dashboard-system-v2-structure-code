"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { User, Building, Key, Bell, Shield, CreditCard, Database, Palette } from "lucide-react"

interface SettingsNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navItems = [
  { id: "profile", label: "Profile", icon: User },
  { id: "organization", label: "Organization", icon: Building },
  { id: "api", label: "API Keys", icon: Key },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "data", label: "Data", icon: Database },
  { id: "appearance", label: "Appearance", icon: Palette },
]

export function SettingsNav({ activeTab, onTabChange }: SettingsNavProps) {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "secondary" : "ghost"}
            className={cn("w-full justify-start gap-2", activeTab === item.id && "bg-muted")}
            onClick={() => onTabChange(item.id)}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Button>
        )
      })}
    </nav>
  )
}
