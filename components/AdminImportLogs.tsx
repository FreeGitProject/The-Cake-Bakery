"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImportLog {
  _id: string
  fileName: string
  cloudinaryUrl: string
  importedBy: {
    username: string
  }
  status: string
  totalRecords: number
  successCount: number
  failureCount: number
  errorDetails: string[]
  createdAt: string
}

export default function AdminImportLogs() {
  const [importLogs, setImportLogs] = useState<ImportLog[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState("All")
  const { data: session } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchImportLogs()
    }
  }, [session])

  const fetchImportLogs = async () => {
    try {
      const response = await fetch(
        `/api/admin/import-logs?page=${currentPage}&status=${statusFilter !== "All" ? statusFilter : ""}`,
      )
      if (response.ok) {
        const data = await response.json()
        setImportLogs(data.importLogs)
        setTotalPages(data.totalPages)
      } else {
        throw new Error("Failed to fetch import logs")
      }
    } catch (error) {
      console.error("Error fetching import logs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch import logs. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (session?.user?.role !== "admin") {
    return <p>You do not have permission to view this page.</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Import Logs</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File Name</TableHead>
            <TableHead>Uploaded By</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total Records</TableHead>
            <TableHead>Success Count</TableHead>
            <TableHead>Failure Count</TableHead>
            <TableHead>Upload Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {importLogs.map((log) => (
            <TableRow key={log._id}>
              <TableCell>{log.fileName}</TableCell>
              <TableCell>{log.importedBy.username}</TableCell>
              <TableCell>{log.status}</TableCell>
              <TableCell>{log.totalRecords}</TableCell>
              <TableCell>{log.successCount}</TableCell>
              <TableCell>{log.failureCount}</TableCell>
              <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => handleDownload(log.cloudinaryUrl, log.fileName)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between items-center mt-4">
        <div>
          Page {currentPage} of {totalPages}
        </div>
        <div>
          <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            Previous
          </Button>
          <Button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="ml-2"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

