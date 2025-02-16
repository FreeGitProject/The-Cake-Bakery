import type { Metadata } from "next"
import AdminImportLogs from "@/components/AdminImportLogs"

export const metadata: Metadata = {
  title: "Import Logs | Admin Dashboard",
  description: "View logs of bulk cake imports",
}

export default function AdminImportLogsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* <h1 className="text-3xl font-bold mb-6">Import Logs</h1> */}
      <AdminImportLogs />
    </div>
  )
}

