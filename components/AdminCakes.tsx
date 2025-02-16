/* eslint-disable @next/next/no-img-element */
'use client'
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";

interface Cake {
  _id: string;
  name: string;
  description: string;
  type: string;
  prices: {
    weight: number;
    costPrice: number;
    sellPrice: number;
  }[];
  image: string[];
  category: string;
  createdAt: string;
}

interface PaginatedResponse {
  data: Cake[];
  total: number;
  page: number;
  limit: number;
}

export default function AdminCakes() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [cakeType, setCakeType] = useState<string>("cake");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const perPage = 10;
  const router = useRouter();

  useEffect(() => {
    fetchCakes();
  }, [cakeType, searchTerm, categoryFilter, currentPage, sortConfig]);

  const fetchCakes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/cakes?caketype=${cakeType}&page=${currentPage}&limit=${perPage}&search=${searchTerm}&category=${categoryFilter}&sort=${sortConfig.key}&direction=${sortConfig.direction}`
      );
      const data: PaginatedResponse = await response.json();
      setCakes(data.data);
      setTotalPages(Math.ceil(data.total / perPage));
    } catch (error) {
      console.error("Error fetching cakes:", error);
    }
    setIsLoading(false);
  };

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/cakes/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchCakes();
      }
    } catch (error) {
      console.error("Error deleting cake:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Cakes</h1>
        <Button onClick={() => router.push("/admin/create-cake")}>
          Add New Cake
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search cakes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                //icon={<Search className="w-4 h-4" />}
              />
            </div>
            <Select
              value={cakeType}
              onValueChange={(value) => setCakeType(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cake">Cake</SelectItem>
                <SelectItem value="pastries">Pastry</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="birthday">Birthday</SelectItem>
                <SelectItem value="wedding">Wedding</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price Range</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              cakes.map((cake) => (
                <TableRow key={cake._id}>
                  <TableCell>
                    <img
                      src={cake.image[0]}
                      alt={cake.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/cakes/${cake._id}`}
                      className="font-medium hover:underline"
                    >
                      {cake.name}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {cake.description.substring(0, 60)}...
                    </p>
                  </TableCell>
                  <TableCell className="capitalize">{cake.type}</TableCell>
                  <TableCell>{cake.category}</TableCell>
                  <TableCell>
                    ₹{Math.min(...cake.prices.map((p) => p.sellPrice))} - ₹
                    {Math.max(...cake.prices.map((p) => p.sellPrice))}
                  </TableCell>
                  <TableCell>
                  {cake.createdAt}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/admin/edit-cake/${cake._id}`)
                          }
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger className="w-full text-left text-red-600">
                              Delete
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Cake</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this cake? This
                                  action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(cake._id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

