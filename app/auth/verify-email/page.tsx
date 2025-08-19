"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Mail, CheckCircle, BarChart3 } from "lucide-react"

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code")
      return
    }

    setIsLoading(true)
    setError("")

    setTimeout(() => {
      if (otp === "123456") {
        setIsVerified(true)
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 2000)
      } else {
        setError("Invalid verification code. Please try again.")
      }
      setIsLoading(false)
    }, 1500)
  }

  const handleResend = async () => {
    setResendCooldown(60)
    setError("")

    setTimeout(() => {
      // Show success message or handle resend logic
    }, 1000)
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-heading font-bold mb-2">Email Verified!</h2>
            <p className="text-muted-foreground mb-4">
              Your email has been successfully verified. Redirecting to dashboard...
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Verify Your Email</h1>
          <p className="text-muted-foreground mt-2">We've sent a verification code to your email address</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Mail className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-xl font-heading">Check your email</CardTitle>
            <CardDescription>Enter the 6-digit verification code we sent to your email address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button onClick={handleVerify} className="w-full" disabled={isLoading || otp.length !== 6}>
                {isLoading ? "Verifying..." : "Verify Email"}
              </Button>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Didn't receive the code?</p>
              <Button
                variant="ghost"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="text-primary hover:text-primary/80"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
              </Button>
            </div>

            <div className="text-center">
              <Link href="/auth/login" className="text-sm text-primary hover:underline">
                Back to login
              </Link>
            </div>

            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground text-center">Demo code: 123456</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
