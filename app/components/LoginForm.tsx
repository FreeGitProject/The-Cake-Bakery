/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import ForgotPasswordForm from "./ForgotPasswordForm";
import Link from "next/link";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        {error && <p className="text-red-500">{error}</p>}
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
        <div className="flex justify-between items-center">
          <Button type="submit">Login</Button>
          <Link
            href="/register"
            className="text-sm text-blue-600 hover:text-blue-800 transition duration-300"
          >
            Don&apos;t have an account? Register
          </Link>
        </div>
      </form>
      <div className="text-center">
        <Dialog
          open={isForgotPasswordOpen}
          onOpenChange={setIsForgotPasswordOpen}
        >
          <DialogTrigger asChild>
            <Button variant="link" className="text-sm">
              Forgot Password?
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
            </DialogHeader>
            <ForgotPasswordForm
              onSuccess={() => {
                setIsForgotPasswordOpen(false);
                toast({
                  title: "Password Reset Email Sent",
                  description:
                    "Check your email for instructions to reset your password.",
                });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
