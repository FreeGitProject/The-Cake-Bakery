/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, User, Mail, Lock, AlertCircle, Loader2, KeyRound } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function RegisterForm() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Password strength indicators
  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    // Length check
    if (password.length >= 8) strength += 1;
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;
    // Contains number
    if (/[0-9]/.test(password)) strength += 1;
    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    return (strength / 5) * 100;
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 30) return "bg-red-500";
    if (strength < 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = (strength: number) => {
    if (strength < 30) return "Weak";
    if (strength < 60) return "Fair";
    if (strength < 80) return "Good";
    return "Strong";
  };

  const strengthPercent = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (step === 1) {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        });
        const data = await res.json();
        if (res.ok) {
          setStep(2);
          toast({
            title: "Check your email",
            description: `We've sent a verification code to ${email}`,
          });
        } else {
          setError(data.error);
        }
      } catch (error:any) {
        console.error("Registration error:", error); // Use the error
        setError('An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp }),
        });
        const data = await res.json();
        if (res.ok) {
          toast({
            title: "Account verified!",
            description: "You can now login with your credentials",
          });
          router.push('/login');
        } else {
          setError(data.error);
        }
      } catch (error:any) {
        console.error("Registration error:", error); // Use the error
        setError('An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="bg-white rounded-2xl shadow-elevated border border-gray-100 overflow-hidden">
        {/* Gradient top accent */}
        <div
          className="h-1 w-full"
          style={{
            background:
              "linear-gradient(135deg, #FF9494 0%, #FFB4B4 50%, #FFD1D1 100%)",
          }}
        />

        <CardHeader className="px-8 pt-8 pb-2 space-y-2 text-center">
          <CardTitle className="text-2xl font-display font-bold text-brand-text">
            {step === 1 ? 'Create an account' : 'Verify your email'}
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            {step === 1
              ? 'Enter your information to create an account'
              : `We've sent a verification code to ${email}`}
          </CardDescription>

          {/* Progress indicator */}
          <div className="pt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span className={step === 1 ? "text-brand-pink font-medium" : "text-gray-400"}>
                Account Details
              </span>
              <span className={step === 2 ? "text-brand-pink font-medium" : "text-gray-400"}>
                Verification
              </span>
            </div>
            <Progress value={step === 1 ? 50 : 100} className="h-1.5 rounded-full" />
          </div>
        </CardHeader>

        <CardContent className="px-8 pt-4 pb-2">
          {error && (
            <Alert
              variant="destructive"
              className="mb-6 rounded-xl border-red-200 bg-red-50"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                {/* Username */}
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-sm font-medium text-brand-text flex items-center gap-2"
                  >
                    <User className="h-4 w-4 text-brand-pink" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-11 rounded-xl border-gray-200 focus:border-brand-pink focus:ring-brand-pink/20 transition-colors"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-brand-text flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4 text-brand-pink" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-xl border-gray-200 focus:border-brand-pink focus:ring-brand-pink/20 transition-colors"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-brand-text flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4 text-brand-pink" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pr-10 rounded-xl border-gray-200 focus:border-brand-pink focus:ring-brand-pink/20 transition-colors"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-brand-pink transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <Progress
                        value={strengthPercent}
                        className={`h-1 rounded-full ${getStrengthColor(strengthPercent)}`}
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-400">
                          Password strength:{" "}
                          <span className="font-medium text-brand-text">
                            {getStrengthText(strengthPercent)}
                          </span>
                        </p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs text-brand-pink cursor-help font-medium">
                                Tips
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="w-80 p-3 rounded-xl">
                              <p className="text-xs">
                                Strong passwords include:
                                <ul className="list-disc pl-4 mt-1 space-y-1">
                                  <li>At least 8 characters</li>
                                  <li>Lowercase and uppercase letters</li>
                                  <li>Numbers</li>
                                  <li>Special characters</li>
                                </ul>
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* OTP verification step */
              <div className="space-y-2">
                <Label
                  htmlFor="otp"
                  className="text-sm font-medium text-brand-text flex items-center gap-2"
                >
                  <KeyRound className="h-4 w-4 text-brand-pink" />
                  Verification Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="h-11 rounded-xl border-gray-200 focus:border-brand-pink focus:ring-brand-pink/20 text-center text-lg tracking-widest transition-colors"
                  maxLength={6}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  Didn&apos;t receive a code?{" "}
                  <button
                    type="button"
                    className="text-brand-pink hover:text-brand-pink/80 font-medium transition-colors"
                    disabled={isLoading}
                  >
                    Resend code
                  </button>
                </p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 rounded-xl text-white font-semibold shadow-soft hover:shadow-card transition-all duration-200 hover:brightness-105 mt-6"
              style={{
                background:
                  "linear-gradient(135deg, #FF9494 0%, #FFB4B4 100%)",
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {step === 1 ? 'Creating account...' : 'Verifying...'}
                </>
              ) : (
                step === 1 ? 'Create Account' : 'Verify & Continue'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-center justify-center gap-1.5 px-8 pt-4 pb-8">
          <span className="text-sm text-gray-400">
            Already have an account?
          </span>
          <Link
            href="/login"
            className="text-sm font-semibold text-brand-pink hover:text-brand-pink/80 transition-colors"
          >
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
