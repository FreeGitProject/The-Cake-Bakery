"use client"

import { useState, useEffect, useCallback } from "react"
import { debounce } from "lodash"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface User {
  _id: string
  username: string
  email: string
  role: "user" | "admin"
}

export default function AdminUserList() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState<"user" | "admin">("user")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const fetchUsers = useCallback(
    async (search: string, page: number) => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/admin/users?page=${page}&limit=10&search=${search}`)
        if (response.ok) {
          const data = await response.json()
          setUsers(data.users)
          setTotalPages(data.totalPages)
          setCurrentPage(data.currentPage)
        } else {
          throw new Error("Failed to fetch users")
        }
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "Error",
          description: "Failed to fetch users. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const debouncedFetchUsers = useCallback(
    debounce((search: string, page: number) => fetchUsers(search, page), 500),
    [fetchUsers],
  )

  useEffect(() => {
    debouncedFetchUsers(searchTerm, currentPage)
  }, [debouncedFetchUsers, searchTerm, currentPage])

  const handleRoleChange = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch("/api/admin/users/update-role", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser._id, newRole }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers(users.map((user) => (user._id === updatedUser._id ? updatedUser : user)))
        toast({
          title: "Success",
          description: "User role updated successfully!",
        })
      } else {
        throw new Error("Failed to update user role")
      }
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div>
  
      <div className="mb-4">
        <Input type="text" placeholder="Search by username or email" value={searchTerm} onChange={handleSearchChange} />
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => {
                            setSelectedUser(user)
                            setNewRole(user.role === "admin" ? "user" : "admin")
                          }}
                        >
                          Update Role
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Update User Role</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to change {user.username}'s role from {user.role} to{" "}
                            {user.role === "admin" ? "user" : "admin"}?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleRoleChange}>Confirm</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-between items-center">
            <div>
              Page {currentPage} of {totalPages}
            </div>
            <div>
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="mr-2"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

