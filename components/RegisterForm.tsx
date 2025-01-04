/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function RegisterForm() {
  const [step, setStep] = useState(1)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (step === 1) {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        })
        const data = await res.json()
        if (res.ok) {
          setStep(2)
        } else {
          setError(data.error)
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error:any) {
        setError('An error occurred. Please try again.')
      }
    } else {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp }),
        })
        const data = await res.json()
        if (res.ok) {
          router.push('/login')
        } else {
          setError(data.error)
        }
         // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error:any) {
        setError('An error occurred. Please try again.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      {step === 1 ? (
        <>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </>
      ) : (
        <div>
          <Label htmlFor="otp">Enter OTP sent to your email</Label>
          <Input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </div>
      )}
      <Button type="submit">{step === 1 ? 'Register' : 'Verify OTP'}</Button>
    </form>
  )
}

