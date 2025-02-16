"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadCloud } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminBulkUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/admin/import-cakes", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success",
          description: `Import completed. ${data.importLog.successCount} cakes imported successfully.`,
        })
        router.push("/admin/import-logs")
      } else {
        throw new Error("Failed to import cakes")
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  if (session?.user?.role !== "admin") {
    return <p>You do not have permission to view this page.</p>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Upload Cakes</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Excel file (XLSX)</p>
              </div>
              <Input id="dropzone-file" type="file" accept=".xlsx" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          {file && <p className="text-sm text-gray-500">Selected file: {file.name}</p>}
          <Button type="submit" disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload and Import"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

