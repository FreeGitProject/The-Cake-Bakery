import ResetPasswordForm from "@/components/ResetPasswordForm"
import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Reset Password | The Cake Shop",
  description: "Reset your The Cake Shop account password",
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#FAFAFA]">
      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl font-bold text-brand-text mb-8 text-center">Reset Password</h1>
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
