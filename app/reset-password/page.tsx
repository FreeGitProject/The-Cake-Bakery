import ResetPasswordForm from "@/components/ResetPasswordForm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reset Password | The Cake Shop",
  description: "Reset your The Cake Shop account password",
}

export default function ResetPasswordPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Reset Password</h1>
      <ResetPasswordForm />
    </div>
  )
}

