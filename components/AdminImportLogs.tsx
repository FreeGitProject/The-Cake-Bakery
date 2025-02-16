'use client'
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Badge,
} from "@/components/ui/badge";

interface ImportLog {
  _id: string;
  fileName: string;
  cloudinaryUrl: string;
  importedBy: {
    username: string;
  };
  status: string;
  totalRecords: number;
  successCount: number;
  failureCount: number;
  errorDetails: string[];
  createdAt: string;
}

export default function AdminImportLogs() {
  const [importLogs, setImportLogs] = useState<ImportLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchImportLogs();
    }
  }, [session, currentPage, statusFilter]);

  const fetchImportLogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/import-logs?page=${currentPage}&status=${
          statusFilter !== "All" ? statusFilter : ""
        }`
      );
      if (response.ok) {
        const data = await response.json();
        setImportLogs(data.importLogs);
        setTotalPages(data.totalPages);
      } else {
        throw new Error("Failed to fetch import logs");
      }
    } catch (error) {
      console.log(error)
      toast({
        title: "Error",
        description: "Failed to fetch import logs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleRowExpansion = (logId: string) => {
    setExpandedRows((prev) =>
      prev.includes(logId)
        ? prev.filter((id) => id !== logId)
        : [...prev, logId]
    );
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (session?.user?.role !== "admin") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to view this page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Import Logs</CardTitle>
            <CardDescription>
              View and manage your data import history
            </CardDescription>
          </div>
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
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px]"></TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Records</TableHead>
                <TableHead className="text-right">Success</TableHead>
                <TableHead className="text-right">Failures</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {importLogs.map((log) => (
                <React.Fragment key={log._id}>
                  <TableRow className="hover:bg-gray-50">
                    <TableCell>
                      {log.errorDetails?.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(log._id)}
                          className="p-0 h-6 w-6"
                        >
                          {expandedRows.includes(log._id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{log.fileName}</TableCell>
                    <TableCell>{log.importedBy.username}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeVariant(log.status)}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{log.totalRecords}</TableCell>
                    <TableCell className="text-right text-green-600">
                      {log.successCount}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {log.failureCount}
                    </TableCell>
                    <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(log.cloudinaryUrl, log.fileName)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedRows.includes(log._id) && log.errorDetails?.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="bg-gray-50 p-4">
                        <Alert variant="destructive" className="mb-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Import Errors</AlertTitle>
                          <AlertDescription>
                            The following errors occurred during import:
                          </AlertDescription>
                        </Alert>
                        <div className="space-y-2 ml-6">
                          {log.errorDetails.map((error, index) => (
                            <div
                              key={index}
                              className="text-sm text-red-600 flex items-start gap-2"
                            >
                              <span>•</span>
                              <span>{error}</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}