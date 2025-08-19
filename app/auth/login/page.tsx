"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, BarChart3, TrendingUp } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Try to connect to backend API first
      const response = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Store token if needed
        if (data.data?.token) {
          localStorage.setItem('authToken', data.data.token);
        }
        // Redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Invalid email or password");
      }
    } catch (error) {
      console.log('Backend connection failed, using fallback authentication');
      
      // Fallback to local validation if backend is not available
      const validCredentials = [
        { email: "admin@adanalytics.com", password: "AdAnalytics2024!Admin" },
        { email: "manager@adanalytics.com", password: "AdAnalytics2024!Manager" },
        { email: "analyst@adanalytics.com", password: "AdAnalytics2024!Analyst" },
        { email: "viewer@adanalytics.com", password: "AdAnalytics2024!Viewer" },
        // Keep demo credentials for testing
        { email: "demo@adanalytics.com", password: "demo123" }
      ];
      
      const isValid = validCredentials.some(cred => 
        cred.email === email && cred.password === password
      );
      
      if (isValid) {
        // Redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        setError("Invalid email or password");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary-foreground/10 rounded-xl">
              <BarChart3 className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-heading font-bold">AdAnalytics Pro</h1>
          </div>
          <h2 className="text-4xl font-heading font-bold mb-6">Real-time insights for smarter campaigns</h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Track, analyze, and optimize your ad performance with advanced analytics and real-time reporting.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <span>Live Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <span>Campaign Management</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-heading font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-2">Sign in to your AdAnalytics Pro account</p>
            <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium mb-2">Demo Credentials:</p>
              <p className="text-muted-foreground">admin@adanalytics.com / AdAnalytics2024!Admin</p>
              <p className="text-muted-foreground">manager@adanalytics.com / AdAnalytics2024!Manager</p>
              <p className="text-muted-foreground">analyst@adanalytics.com / AdAnalytics2024!Analyst</p>
              <p className="text-muted-foreground">viewer@adanalytics.com / AdAnalytics2024!Viewer</p>
            </div>
          </div>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-heading">Sign in</CardTitle>
              <CardDescription>Enter your email and password to access your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/auth/signup" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>

              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground text-center">Demo: demo@adanalytics.com / demo123</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
