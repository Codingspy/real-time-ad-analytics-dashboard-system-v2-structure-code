"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthGuard } from "@/components/auth/auth-guard"
import { ArrowLeft, Send, Plus, X, Mail, Users, Shield, User, Crown } from "lucide-react"

interface InviteData {
  emails: string[]
  role: string
  department: string
  message: string
  permissions: {
    campaigns: boolean
    reports: boolean
    users: boolean
    settings: boolean
  }
}

const roleOptions = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full access to all features and user management",
    icon: <Crown className="h-4 w-4" />,
    color: "text-red-600",
  },
  {
    id: "manager",
    name: "Manager",
    description: "Manage campaigns and view all reports",
    icon: <Shield className="h-4 w-4" />,
    color: "text-blue-600",
  },
  {
    id: "analyst",
    name: "Analyst",
    description: "Create reports and analyze campaign data",
    icon: <User className="h-4 w-4" />,
    color: "text-green-600",
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "View reports and campaign data only",
    icon: <User className="h-4 w-4" />,
    color: "text-gray-600",
  },
]

const defaultPermissions = {
  admin: { campaigns: true, reports: true, users: true, settings: true },
  manager: { campaigns: true, reports: true, users: false, settings: false },
  analyst: { campaigns: false, reports: true, users: false, settings: false },
  viewer: { campaigns: false, reports: false, users: false, settings: false },
}

export default function InviteUserPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailInput, setEmailInput] = useState("")
  const [inviteData, setInviteData] = useState<InviteData>({
    emails: [],
    role: "",
    department: "",
    message:
      "You've been invited to join our AdAnalytics Pro team. Click the link below to set up your account and start collaborating with us.",
    permissions: {
      campaigns: false,
      reports: false,
      users: false,
      settings: false,
    },
  })

  const handleRoleChange = (role: string) => {
    setInviteData((prev) => ({
      ...prev,
      role,
      permissions: defaultPermissions[role as keyof typeof defaultPermissions] || prev.permissions,
    }))
  }

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setInviteData((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [permission]: checked },
    }))
  }

  const addEmail = () => {
    if (emailInput && !inviteData.emails.includes(emailInput)) {
      setInviteData((prev) => ({
        ...prev,
        emails: [...prev.emails, emailInput],
      }))
      setEmailInput("")
    }
  }

  const removeEmail = (email: string) => {
    setInviteData((prev) => ({
      ...prev,
      emails: prev.emails.filter((e) => e !== email),
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addEmail()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Basic validation
    if (inviteData.emails.length === 0 || !inviteData.role) {
      setError("Please add at least one email and select a role")
      setIsLoading(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      router.push("/users?invited=true")
      setIsLoading(false)
    }, 2000)
  }

  const selectedRole = roleOptions.find((r) => r.id === inviteData.role)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/users">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Users
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Invite Team Members</h1>
              <p className="text-muted-foreground mt-1">Send invitations to new team members</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Email Addresses */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-heading">
                      <Mail className="h-5 w-5" />
                      Email Addresses
                    </CardTitle>
                    <CardDescription>Add email addresses of people you want to invite</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                      />
                      <Button type="button" onClick={addEmail} disabled={!emailInput}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {inviteData.emails.length > 0 && (
                      <div className="space-y-2">
                        <Label>Invited Users ({inviteData.emails.length})</Label>
                        <div className="flex flex-wrap gap-2">
                          {inviteData.emails.map((email, index) => (
                            <div key={index} className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full">
                              <span className="text-sm">{email}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => removeEmail(email)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Role Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-heading">
                      <Users className="h-5 w-5" />
                      Role & Permissions
                    </CardTitle>
                    <CardDescription>Select the role and permissions for invited users</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label>User Role *</Label>
                      <div className="grid grid-cols-1 gap-3">
                        {roleOptions.map((role) => (
                          <div
                            key={role.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              inviteData.role === role.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => handleRoleChange(role.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-muted ${role.color}`}>{role.icon}</div>
                              <div className="flex-1">
                                <h3 className="font-medium">{role.name}</h3>
                                <p className="text-sm text-muted-foreground">{role.description}</p>
                              </div>
                              <div
                                className={`w-4 h-4 rounded-full border-2 ${
                                  inviteData.role === role.id ? "border-primary bg-primary" : "border-muted-foreground"
                                }`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {inviteData.role && (
                      <div className="space-y-3">
                        <Label>Specific Permissions</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="campaigns"
                              checked={inviteData.permissions.campaigns}
                              onCheckedChange={(checked) => handlePermissionChange("campaigns", checked as boolean)}
                            />
                            <Label htmlFor="campaigns" className="text-sm">
                              Manage Campaigns
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="reports"
                              checked={inviteData.permissions.reports}
                              onCheckedChange={(checked) => handlePermissionChange("reports", checked as boolean)}
                            />
                            <Label htmlFor="reports" className="text-sm">
                              Create Reports
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="users"
                              checked={inviteData.permissions.users}
                              onCheckedChange={(checked) => handlePermissionChange("users", checked as boolean)}
                            />
                            <Label htmlFor="users" className="text-sm">
                              Manage Users
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="settings"
                              checked={inviteData.permissions.settings}
                              onCheckedChange={(checked) => handlePermissionChange("settings", checked as boolean)}
                            />
                            <Label htmlFor="settings" className="text-sm">
                              Access Settings
                            </Label>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Additional Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading">Additional Information</CardTitle>
                    <CardDescription>Optional details for the invitation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select
                        value={inviteData.department}
                        onValueChange={(value) => setInviteData((prev) => ({ ...prev, department: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="digital-marketing">Digital Marketing</SelectItem>
                          <SelectItem value="analytics">Analytics</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="operations">Operations</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Invitation Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Add a personal message to the invitation"
                        value={inviteData.message}
                        onChange={(e) => setInviteData((prev) => ({ ...prev, message: e.target.value }))}
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" disabled={isLoading} className="w-full gap-2">
                  <Send className="h-4 w-4" />
                  {isLoading
                    ? "Sending Invitations..."
                    : `Send ${inviteData.emails.length} Invitation${inviteData.emails.length !== 1 ? "s" : ""}`}
                </Button>
              </form>
            </div>

            {/* Preview */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Invitation Preview</CardTitle>
                  <CardDescription>Preview of the invitation email</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-medium mb-2">You're invited to join AdAnalytics Pro</h3>
                    <p className="text-sm text-muted-foreground mb-4">{inviteData.message}</p>
                    {selectedRole && (
                      <div className="space-y-2">
                        <p className="text-sm">
                          <strong>Role:</strong> {selectedRole.name}
                        </p>
                        {inviteData.department && (
                          <p className="text-sm">
                            <strong>Department:</strong> {inviteData.department}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {inviteData.emails.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Recipients:</p>
                      <div className="space-y-1">
                        {inviteData.emails.map((email, index) => (
                          <p key={index} className="text-sm">
                            {email}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedRole && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Permissions:</p>
                      <div className="space-y-1">
                        {Object.entries(inviteData.permissions).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between text-sm">
                            <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                            <span className={value ? "text-green-600" : "text-gray-400"}>{value ? "✓" : "✗"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
