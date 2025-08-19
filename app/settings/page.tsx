"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthGuard } from "@/components/auth/auth-guard"
import {
  User,
  Building,
  Key,
  Bell,
  Shield,
  CreditCard,
  Database,
  Palette,
  Download,
  Upload,
  Save,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Trash2,
  Plus,
} from "lucide-react"

interface UserProfile {
  name: string
  email: string
  avatar: string
  title: string
  department: string
  phone: string
  timezone: string
  language: string
}

interface OrganizationSettings {
  name: string
  domain: string
  industry: string
  size: string
  address: string
  country: string
  currency: string
  dateFormat: string
}

interface NotificationSettings {
  email: {
    campaignAlerts: boolean
    reportReady: boolean
    weeklyDigest: boolean
    systemUpdates: boolean
  }
  push: {
    realTimeAlerts: boolean
    budgetWarnings: boolean
    performanceAlerts: boolean
  }
  frequency: string
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  sessionTimeout: string
  ipWhitelist: string[]
  apiAccess: boolean
}

interface APIKey {
  id: string
  name: string
  key: string
  permissions: string[]
  lastUsed: string
  created: string
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(false)
  const [showApiKey, setShowApiKey] = useState<string | null>(null)

  const [profile, setProfile] = useState<UserProfile>({
    name: "John Smith",
    email: "john.smith@company.com",
    avatar: "/generic-person.png",
    title: "Marketing Director",
    department: "Digital Marketing",
    phone: "+1 (555) 123-4567",
    timezone: "America/New_York",
    language: "en",
  })

  const [organization, setOrganization] = useState<OrganizationSettings>({
    name: "Acme Corporation",
    domain: "acme.com",
    industry: "Technology",
    size: "51-200",
    address: "123 Business St, Suite 100",
    country: "United States",
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: {
      campaignAlerts: true,
      reportReady: true,
      weeklyDigest: true,
      systemUpdates: false,
    },
    push: {
      realTimeAlerts: true,
      budgetWarnings: true,
      performanceAlerts: false,
    },
    frequency: "immediate",
  })

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: "8h",
    ipWhitelist: [],
    apiAccess: true,
  })

  const [apiKeys] = useState<APIKey[]>([
    {
      id: "1",
      name: "Production API",
      key: "ak_live_1234567890abcdef",
      permissions: ["read", "write"],
      lastUsed: "2024-01-22 14:30",
      created: "2023-12-01",
    },
    {
      id: "2",
      name: "Development API",
      key: "ak_test_abcdef1234567890",
      permissions: ["read"],
      lastUsed: "2024-01-20 09:15",
      created: "2024-01-15",
    },
  ])

  const handleSave = async (section: string) => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Show success message
    }, 1000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Show success toast
  }

  const generateNewApiKey = () => {
    // Generate new API key logic
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account and application preferences</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="organization" className="gap-2">
                <Building className="h-4 w-4" />
                Organization
              </TabsTrigger>
              <TabsTrigger value="api" className="gap-2">
                <Key className="h-4 w-4" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="billing" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="data" className="gap-2">
                <Database className="h-4 w-4" />
                Data
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-2">
                <Palette className="h-4 w-4" />
                Appearance
              </TabsTrigger>
            </TabsList>

            {/* Profile Settings */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Profile Information</CardTitle>
                  <CardDescription>Update your personal information and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                      <AvatarFallback>
                        {profile.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </Button>
                      <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={profile.title}
                        onChange={(e) => setProfile((prev) => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={profile.department}
                        onChange={(e) => setProfile((prev) => ({ ...prev, department: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={profile.timezone}
                        onValueChange={(value) => setProfile((prev) => ({ ...prev, timezone: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                          <SelectItem value="Europe/London">London (GMT)</SelectItem>
                          <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={() => handleSave("profile")} disabled={isLoading} className="gap-2">
                    <Save className="h-4 w-4" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Organization Settings */}
            <TabsContent value="organization" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Organization Details</CardTitle>
                  <CardDescription>Manage your organization's information and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="orgName">Organization Name</Label>
                      <Input
                        id="orgName"
                        value={organization.name}
                        onChange={(e) => setOrganization((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="domain">Domain</Label>
                      <Input
                        id="domain"
                        value={organization.domain}
                        onChange={(e) => setOrganization((prev) => ({ ...prev, domain: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Select
                        value={organization.industry}
                        onValueChange={(value) => setOrganization((prev) => ({ ...prev, industry: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Technology">Technology</SelectItem>
                          <SelectItem value="Healthcare">Healthcare</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Retail">Retail</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="size">Company Size</Label>
                      <Select
                        value={organization.size}
                        onValueChange={(value) => setOrganization((prev) => ({ ...prev, size: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="500+">500+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Default Currency</Label>
                      <Select
                        value={organization.currency}
                        onValueChange={(value) => setOrganization((prev) => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select
                        value={organization.dateFormat}
                        onValueChange={(value) => setOrganization((prev) => ({ ...prev, dateFormat: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={organization.address}
                      onChange={(e) => setOrganization((prev) => ({ ...prev, address: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <Button onClick={() => handleSave("organization")} disabled={isLoading} className="gap-2">
                    <Save className="h-4 w-4" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Keys */}
            <TabsContent value="api" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-heading">API Keys</CardTitle>
                      <CardDescription>Manage API keys for integrating with external systems</CardDescription>
                    </div>
                    <Button onClick={generateNewApiKey} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Generate New Key
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {apiKeys.map((apiKey) => (
                      <div key={apiKey.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium">{apiKey.name}</h3>
                            <p className="text-sm text-muted-foreground">Created {apiKey.created}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {apiKey.permissions.map((permission) => (
                              <Badge key={permission} variant="outline">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <Input
                            value={showApiKey === apiKey.id ? apiKey.key : "•".repeat(apiKey.key.length)}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                          >
                            {showApiKey === apiKey.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(apiKey.key)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Last used: {apiKey.lastUsed}</span>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Notification Preferences</CardTitle>
                  <CardDescription>Choose how and when you want to receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Email Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Campaign Alerts</p>
                          <p className="text-sm text-muted-foreground">Get notified when campaigns need attention</p>
                        </div>
                        <Switch
                          checked={notifications.email.campaignAlerts}
                          onCheckedChange={(checked) =>
                            setNotifications((prev) => ({
                              ...prev,
                              email: { ...prev.email, campaignAlerts: checked },
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Report Ready</p>
                          <p className="text-sm text-muted-foreground">When your reports are ready for download</p>
                        </div>
                        <Switch
                          checked={notifications.email.reportReady}
                          onCheckedChange={(checked) =>
                            setNotifications((prev) => ({
                              ...prev,
                              email: { ...prev.email, reportReady: checked },
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Weekly Digest</p>
                          <p className="text-sm text-muted-foreground">Weekly summary of your account activity</p>
                        </div>
                        <Switch
                          checked={notifications.email.weeklyDigest}
                          onCheckedChange={(checked) =>
                            setNotifications((prev) => ({
                              ...prev,
                              email: { ...prev.email, weeklyDigest: checked },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Push Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Real-time Alerts</p>
                          <p className="text-sm text-muted-foreground">Immediate notifications for critical events</p>
                        </div>
                        <Switch
                          checked={notifications.push.realTimeAlerts}
                          onCheckedChange={(checked) =>
                            setNotifications((prev) => ({
                              ...prev,
                              push: { ...prev.push, realTimeAlerts: checked },
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Budget Warnings</p>
                          <p className="text-sm text-muted-foreground">When campaigns approach budget limits</p>
                        </div>
                        <Switch
                          checked={notifications.push.budgetWarnings}
                          onCheckedChange={(checked) =>
                            setNotifications((prev) => ({
                              ...prev,
                              push: { ...prev.push, budgetWarnings: checked },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Button onClick={() => handleSave("notifications")} disabled={isLoading} className="gap-2">
                    <Save className="h-4 w-4" />
                    {isLoading ? "Saving..." : "Save Preferences"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Security Settings</CardTitle>
                  <CardDescription>Manage your account security and access controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <Switch
                        checked={security.twoFactorEnabled}
                        onCheckedChange={(checked) => setSecurity((prev) => ({ ...prev, twoFactorEnabled: checked }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout</Label>
                      <Select
                        value={security.sessionTimeout}
                        onValueChange={(value) => setSecurity((prev) => ({ ...prev, sessionTimeout: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1h">1 hour</SelectItem>
                          <SelectItem value="4h">4 hours</SelectItem>
                          <SelectItem value="8h">8 hours</SelectItem>
                          <SelectItem value="24h">24 hours</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">API Access</p>
                        <p className="text-sm text-muted-foreground">Allow API access to your account</p>
                      </div>
                      <Switch
                        checked={security.apiAccess}
                        onCheckedChange={(checked) => setSecurity((prev) => ({ ...prev, apiAccess: checked }))}
                      />
                    </div>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      We recommend enabling two-factor authentication and setting a reasonable session timeout for
                      better security.
                    </AlertDescription>
                  </Alert>

                  <Button onClick={() => handleSave("security")} disabled={isLoading} className="gap-2">
                    <Save className="h-4 w-4" />
                    {isLoading ? "Saving..." : "Save Security Settings"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing */}
            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Billing & Subscription</CardTitle>
                  <CardDescription>Manage your subscription and billing information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium">Professional Plan</h3>
                        <p className="text-sm text-muted-foreground">Billed monthly</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">$99</p>
                        <p className="text-sm text-muted-foreground">per month</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                      <Button variant="outline" size="sm">
                        Manage Subscription
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Payment Method</h3>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                            VISA
                          </div>
                          <div>
                            <p className="font-medium">•••• •••• •••• 4242</p>
                            <p className="text-sm text-muted-foreground">Expires 12/25</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Update
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Billing History</h3>
                    <div className="space-y-2">
                      {[
                        { date: "Jan 1, 2024", amount: "$99.00", status: "Paid" },
                        { date: "Dec 1, 2023", amount: "$99.00", status: "Paid" },
                        { date: "Nov 1, 2023", amount: "$99.00", status: "Paid" },
                      ].map((invoice, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{invoice.date}</p>
                            <p className="text-sm text-muted-foreground">Professional Plan</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{invoice.amount}</span>
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              {invoice.status}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data Settings */}
            <TabsContent value="data" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Data Management</CardTitle>
                  <CardDescription>Control your data retention and export preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Data Retention</h3>
                    <div className="space-y-2">
                      <Label htmlFor="retention">Data Retention Period</Label>
                      <Select defaultValue="2years">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6months">6 months</SelectItem>
                          <SelectItem value="1year">1 year</SelectItem>
                          <SelectItem value="2years">2 years</SelectItem>
                          <SelectItem value="5years">5 years</SelectItem>
                          <SelectItem value="forever">Forever</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        How long to keep your analytics data before automatic deletion
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Data Export</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="gap-2 bg-transparent">
                        <Download className="h-4 w-4" />
                        Export All Data
                      </Button>
                      <Button variant="outline" className="gap-2 bg-transparent">
                        <Download className="h-4 w-4" />
                        Export Campaign Data
                      </Button>
                    </div>
                  </div>

                  <Alert>
                    <Database className="h-4 w-4" />
                    <AlertDescription>
                      Data exports may take several minutes to complete. You'll receive an email when your export is
                      ready.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance */}
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Appearance</CardTitle>
                  <CardDescription>Customize the look and feel of your dashboard</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Theme</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg cursor-pointer hover:border-primary">
                        <div className="w-full h-20 bg-white border rounded mb-2"></div>
                        <p className="text-sm font-medium text-center">Light</p>
                      </div>
                      <div className="p-4 border rounded-lg cursor-pointer hover:border-primary">
                        <div className="w-full h-20 bg-gray-900 border rounded mb-2"></div>
                        <p className="text-sm font-medium text-center">Dark</p>
                      </div>
                      <div className="p-4 border rounded-lg cursor-pointer hover:border-primary">
                        <div className="w-full h-20 bg-gradient-to-br from-white to-gray-900 border rounded mb-2"></div>
                        <p className="text-sm font-medium text-center">System</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Dashboard Layout</h3>
                    <div className="space-y-2">
                      <Label htmlFor="layout">Default Layout</Label>
                      <Select defaultValue="standard">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compact">Compact</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="expanded">Expanded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Appearance Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}
