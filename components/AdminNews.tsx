'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Loader from '@/app/components/Loader';
import { Calendar, FileText, Image as ImageIcon, Plus, Trash2, RefreshCw, Search, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";

interface NewsItem {
  _id?: string;
  title: string;
  date: string;
  description: string;
  imageUrl: string;
}

export default function AdminNews() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<NewsItem[]>([]);
  const [newItem, setNewItem] = useState<NewsItem>({ title: '', date: '', description: '', imageUrl: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('view');
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchNewsItems();
  },);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems(newsItems);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = newsItems.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query) ||
        new Date(item.date).toLocaleDateString().includes(query)
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, newsItems]);

  async function fetchNewsItems() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/news');
      if (!res.ok) throw new Error('Failed to fetch news items');
      
      const data = await res.json();
      setNewsItems(data);
      setFilteredItems(data);
      
      toast({
        title: "News loaded successfully",
        description: `Loaded ${data.length} news items`,
      });
    } catch (error) {
      console.error('Error fetching news items:', error);
      toast({
        title: "Failed to load news",
        description: "Could not retrieve news items. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewItem((prevItem) => ({ ...prevItem, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      
      if (!res.ok) throw new Error('Failed to add news item');
      
      const addedItem = await res.json();
      setNewsItems((prevItems) => [...prevItems, addedItem]);
      setNewItem({ title: '', date: '', description: '', imageUrl: '' });
      
      if (formRef.current) formRef.current.reset();
      setActiveTab('view');
      
      toast({
        title: "News item added",
        description: "The news item has been successfully added",
      });
    } catch (error) {
      console.error('Error adding news item:', error);
      toast({
        title: "Failed to add news item",
        description: "An error occurred while adding the news item",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to delete news item');
      
      setNewsItems((prevItems) => prevItems.filter(item => item._id !== id));
      
      toast({
        title: "News item deleted",
        description: "The news item has been successfully removed",
      });
    } catch (error) {
      console.error('Error deleting news item:', error);
      toast({
        title: "Deletion failed",
        description: "An error occurred while deleting the news item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && newsItems.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error(e);
      return dateString;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">News Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage your website&apos;s news items</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0 w-full md:w-auto">
          <Button
            onClick={() => {
              setNewItem({ title: '', date: '', description: '', imageUrl: '' });
              setActiveTab('create');
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add News Item
          </Button>
          <Button variant="outline" onClick={fetchNewsItems} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view">View News Items</TabsTrigger>
          <TabsTrigger value="create">Add News Item</TabsTrigger>
        </TabsList>
        
        <TabsContent value="view" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search news items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Showing {filteredItems.length} of {newsItems.length} items
            </p>
          </div>
          
          {filteredItems.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
                {filteredItems.map((item) => (
                  <Card key={item._id} className="overflow-hidden flex flex-col h-full">
                    <div className="relative h-48 overflow-hidden">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full opacity-90 hover:opacity-100">
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>{item.title}</DialogTitle>
                              <DialogDescription>{formatDate(item.date)}</DialogDescription>
                            </DialogHeader>
                            <div className="mt-4">
                              <img 
                                src={item.imageUrl} 
                                alt={item.title}
                                className="w-full max-h-[70vh] object-contain rounded-md"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    
                    <CardHeader className="pb-2">
                      <div className="flex items-center text-sm text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(item.date)}
                      </div>
                      <CardTitle className="line-clamp-1">{item.title}</CardTitle>
                    </CardHeader>
                    
                    <CardContent className="flex-grow">
                      <p className="text-muted-foreground text-sm line-clamp-3">{item.description}</p>
                    </CardContent>
                    
                    <CardFooter className="pt-2">
                      <div className="flex w-full justify-between items-center">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete News Item</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;{item.title}&quot;? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => item._id && handleDelete(item._id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                                <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.title)}>
                              Copy title
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.imageUrl)}>
                              Copy image URL
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              {searchQuery ? (
                <>
                  <h3 className="text-lg font-medium mb-2">No matching news items</h3>
                  <p className="text-muted-foreground mb-4">Try a different search term or clear the search</p>
                  <Button variant="outline" onClick={() => setSearchQuery('')}>Clear search</Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium mb-2">No news items yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first news item to get started</p>
                  <Button onClick={() => setActiveTab('create')}>Add News Item</Button>
                </>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Add New News Item</CardTitle>
            </CardHeader>
            <CardContent>
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Title
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={newItem.title}
                      onChange={handleInputChange}
                      placeholder="Enter news title"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-3">
                    <Label htmlFor="date" className="text-sm font-medium">
                      Date
                    </Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={newItem.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-3">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={newItem.description}
                      onChange={handleInputChange}
                      placeholder="Enter news description"
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-3">
                    <Label htmlFor="imageUrl" className="text-sm font-medium">
                      Image URL
                    </Label>
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      value={newItem.imageUrl}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                      required
                    />
                    {newItem.imageUrl && (
                      <div className="mt-2 rounded-md overflow-hidden h-48">
                        <img 
                          src={newItem.imageUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).onerror = null;
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setNewItem({ title: '', date: '', description: '', imageUrl: '' });
                      setActiveTab('view');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4" /> Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" /> Add News Item
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
