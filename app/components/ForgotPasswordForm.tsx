/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Mail, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ForgotPasswordFormProps {
  onSuccess: () => void
}

export default function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const data = await response.json()
        setError(data.error || "An error occurred. Please try again.")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert
          variant="destructive"
          className="rounded-xl border-red-200 bg-red-50"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label
          htmlFor="forgot-password-email"
          className="text-sm font-medium text-brand-text flex items-center gap-2"
        >
          <Mail className="h-4 w-4 text-brand-pink" />
          Email
        </Label>
        <Input
          id="forgot-password-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 rounded-xl border-gray-200 focus:border-brand-pink focus:ring-brand-pink/20 transition-colors"
          placeholder="Enter your email address"
          required
          disabled={isLoading}
        />
        <p className="text-xs text-gray-400">
          We&apos;ll send you a link to reset your password.
        </p>
      </div>

      <Button
        type="submit"
        className="w-full h-11 rounded-xl text-white font-semibold shadow-soft hover:shadow-card transition-all duration-200 hover:brightness-105"
        style={{
          background: "linear-gradient(135deg, #FF9494 0%, #FFB4B4 100%)",
        }}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Reset Password"
        )}
      </Button>
    </form>
  )
}
