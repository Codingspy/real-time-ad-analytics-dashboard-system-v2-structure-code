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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Search, UserPlus, MoreHorizontal, Edit, Trash2, Shield, Mail, Users, Crown, Settings } from "lucide-react"

const mockUsers = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@company.com",
    role: "admin",
    status: "active",
    avatar: "/generic-person.png",
    department: "Marketing",
    lastLogin: "2024-01-22 14:30",
    joinedDate: "2023-06-15",
    campaigns: 12,
    reports: 25,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    role: "manager",
    status: "active",
    avatar: "/generic-person.png",
    department: "Digital Marketing",
    lastLogin: "2024-01-22 09:15",
    joinedDate: "2023-08-20",
    campaigns: 8,
    reports: 18,
  },
  {
    id: "3",
    name: "Mike Chen",
    email: "mike.chen@company.com",
    role: "analyst",
    status: "active",
    avatar: "/placeholder-fqbxu.png",
    department: "Analytics",
    lastLogin: "2024-01-21 16:45",
    joinedDate: "2023-09-10",
    campaigns: 5,
    reports: 32,
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@company.com",
    role: "viewer",
    status: "inactive",
    avatar: "/portrait-woman.png",
    department: "Sales",
    lastLogin: "2024-01-18 11:20",
    joinedDate: "2023-11-05",
    campaigns: 2,
    reports: 7,
  },
  {
    id: "5",
    name: "Alex Rodriguez",
    email: "alex.rodriguez@company.com",
    role: "analyst",
    status: "pending",
    department: "Marketing",
    lastLogin: "Never",
    joinedDate: "2024-01-20",
    campaigns: 0,
    reports: 0,
  },
]

const rolePermissions = {
  admin: {
    name: "Administrator",
    description: "Full access to all features and user management",
    color: "bg-red-100 text-red-800",
    icon: <Crown className="h-4 w-4" />,
  },
  manager: {
    name: "Manager",
    description: "Manage campaigns and view all reports",
    color: "bg-blue-100 text-blue-800",
    icon: <Shield className="h-4 w-4" />,
  },
  analyst: {
    name: "Analyst",
    description: "Create reports and analyze campaign data",
    color: "bg-green-100 text-green-800",
    icon: <Settings className="h-4 w-4" />,
  },
  viewer: {
    name: "Viewer",
    description: "View reports and campaign data only",
    color: "bg-gray-100 text-gray-800",
    icon: <Users className="h-4 w-4" />,
  },
}

interface UserInterface {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "analyst" | "viewer"
  status: "active" | "inactive" | "pending"
  avatar?: string
  department: string
  lastLogin: string
  joinedDate: string
  campaigns: number
  reports: number
}

export default function UsersPage() {
  const [users, setUsers] = useState(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
    }

    return (
      <Badge variant="outline" className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    const roleInfo = rolePermissions[role]
    return (
      <Badge variant="outline" className={roleInfo.color}>
        <span className="flex items-center gap-1">
          {roleInfo.icon}
          {roleInfo.name}
        </span>
      </Badge>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleStatusChange = (userId: string, newStatus: string) => {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)))
  }

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-heading font-bold text-foreground">User Management</h1>
                <p className="text-muted-foreground mt-1">Manage team members and their permissions</p>
              </div>
              <Link href="/users/invite">
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Invite User
                </Button>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-heading font-bold">{users.length}</p>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                      <p className="text-2xl font-heading font-bold">
                        {users.filter((u) => u.status === "active").length}
                      </p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Settings className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Invites</p>
                      <p className="text-2xl font-heading font-bold">
                        {users.filter((u) => u.status === "pending").length}
                      </p>
                    </div>
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Users className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Administrators</p>
                      <p className="text-2xl font-heading font-bold">
                        {users.filter((u) => u.role === "admin").length}
                      </p>
                    </div>
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Settings className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Role Permissions Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-heading">Role Permissions</CardTitle>
              <CardDescription>Overview of user roles and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(rolePermissions).map(([key, role]) => (
                  <div key={key} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1 rounded ${role.color}`}>{role.icon}</div>
                      <h3 className="font-medium">{role.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {users.filter((u) => u.role === key).length} users
                    </p>
                  </div>
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
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Team Members</CardTitle>
              <CardDescription>Manage your team members and their access levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Campaigns</TableHead>
                      <TableHead>Reports</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>{user.campaigns}</TableCell>
                        <TableCell>{user.reports}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{user.lastLogin}</p>
                            <p className="text-muted-foreground">Joined {user.joinedDate}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                Change Role
                              </DropdownMenuItem>
                              {user.status === "active" ? (
                                <DropdownMenuItem onClick={() => handleStatusChange(user.id, "inactive")}>
                                  <Settings className="mr-2 h-4 w-4" />
                                  Deactivate User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleStatusChange(user.id, "active")}>
                                  <Settings className="mr-2 h-4 w-4" />
                                  Activate User
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Resend Invite
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove User
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
