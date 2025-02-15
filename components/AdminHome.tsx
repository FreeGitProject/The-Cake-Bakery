'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, ImageIcon, Type, Link2, FileText } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Separator } from "@/components/ui/separator";

interface HomeData {
  _id?: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  buttonText: string;
  buttonLink: string;
}

export default function AdminHome() {
  const [homeList, setHomeList] = useState<HomeData[]>([]);
  const [currentData, setCurrentData] = useState<HomeData>({
    heroTitle: '',
    heroSubtitle: '',
    heroImage: '',
    buttonText: '',
    buttonLink: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('view');
  const { toast } = useToast();

  useEffect(() => {
    async function fetchHomeList() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/home');
        if (!res.ok) throw new Error('Failed to fetch home data');

        const data = await res.json();
        setHomeList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching home data:', error);
        toast({
          title: 'Failed to load data',
          description: 'Could not retrieve home sections. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchHomeList();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const res = await fetch('/api/home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentData),
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save/update home data');
      }
  
      const updatedData = await res.json();
  
      setHomeList((prevList) =>
        currentData._id
          ? prevList.map((item) => (item._id === updatedData._id ? updatedData : item))
          : [...prevList, updatedData]
      );
  
      // Reset the form
      setCurrentData({
        heroTitle: '',
        heroSubtitle: '',
        heroImage: '',
        buttonText: '',
        buttonLink: '',
      });
      setActiveTab('view');
      
      toast({
        title: currentData._id ? 'Home Section Updated' : 'Home Section Created',
        description: `The home section has been successfully ${currentData._id ? 'updated' : 'created'}.`,
      });
    } catch (error) {
      console.error('Error saving/updating home data:', error);
      toast({
        title: 'Operation Failed',
        description: 'An error occurred while saving/updating home data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (_id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/home?_id=${_id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete home data');

      setHomeList((prevList) => prevList.filter((item) => item._id !== _id));
      toast({
        title: 'Home Section Deleted',
        description: 'The home section has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting home data:', error);
      toast({
        title: 'Deletion Failed',
        description: 'An error occurred while deleting home data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (home: HomeData) => {
    setCurrentData(home);
    setActiveTab('create');
  };

  const handleReset = () => {
    setCurrentData({
      heroTitle: '',
      heroSubtitle: '',
      heroImage: '',
      buttonText: '',
      buttonLink: '',
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Home Section Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage your website&apos;s home sections</p>
        </div>
        <Button 
          onClick={() => {
            handleReset();
            setActiveTab('create');
          }}
          className="mt-4 md:mt-0"
        >
          <Plus className="mr-2 h-4 w-4" /> Create New Section
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view">View Sections</TabsTrigger>
          <TabsTrigger value="create">{currentData._id ? "Edit Section" : "Create Section"}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="view" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : homeList.length > 0 ? (
            <ScrollArea className="h-[600px] pr-4">
              <div className="grid grid-cols-1 gap-6">
                {homeList.map((home) => (
                  <Card key={home._id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="relative h-40 bg-muted">
                      {home.heroImage ? (
                        <div 
                          className="w-full h-full bg-cover bg-center" 
                          style={{ backgroundImage: `url(${home.heroImage})` }}
                        >
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-center px-4">
                              <h3 className="text-white text-xl font-bold truncate">{home.heroTitle}</h3>
                              <p className="text-white/80 mt-2 line-clamp-2">{home.heroSubtitle}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Type className="h-4 w-4 mr-2" />
                            <span className="font-medium">Hero Title</span>
                          </div>
                          <p className="text-sm line-clamp-1">{home.heroTitle}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <FileText className="h-4 w-4 mr-2" />
                            <span className="font-medium">Hero Subtitle</span>
                          </div>
                          <p className="text-sm line-clamp-2">{home.heroSubtitle}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Type className="h-4 w-4 mr-2" />
                            <span className="font-medium">Button Text</span>
                          </div>
                          <p className="text-sm line-clamp-1">{home.buttonText}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Link2 className="h-4 w-4 mr-2" />
                            <span className="font-medium">Button Link</span>
                          </div>
                          <p className="text-sm line-clamp-1">{home.buttonLink}</p>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="px-6 pb-6 pt-0 flex flex-wrap gap-3">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(home)}>
                        <Pencil className="h-4 w-4 mr-2" /> Edit
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Home Section</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this home section? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => home._id && handleDelete(home._id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center mb-4">No home sections created yet</p>
                <Button onClick={() => setActiveTab('create')}>
                  <Plus className="mr-2 h-4 w-4" /> Create Your First Section
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>{currentData._id ? "Edit Home Section" : "Create New Home Section"}</CardTitle>
              <CardDescription>
                {currentData._id ? "Update the details for this home section" : "Fill in the details to create a new home section"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="heroTitle" className="text-sm font-medium">
                        Hero Title
                      </Label>
                      <Input
                        id="heroTitle"
                        name="heroTitle"
                        value={currentData.heroTitle}
                        onChange={handleInputChange}
                        placeholder="Enter the main headline"
                        required
                        className="w-full"
                      />
                    </div>
                  
                    <div className="space-y-2">
                      <Label htmlFor="heroSubtitle" className="text-sm font-medium">
                        Hero Subtitle
                      </Label>
                      <Textarea
                        id="heroSubtitle"
                        name="heroSubtitle"
                        value={currentData.heroSubtitle}
                        onChange={handleInputChange}
                        placeholder="Enter the supporting text"
                        rows={3}
                        required
                        className="w-full resize-none"
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="heroImage" className="text-sm font-medium">
                      Hero Image URL
                    </Label>
                    <Input
                      id="heroImage"
                      name="heroImage"
                      value={currentData.heroImage}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                      required
                      className="w-full"
                    />
                    {currentData.heroImage && (
                      <div className="mt-2 relative h-40 rounded-md overflow-hidden">
                        <div
                          className="w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${currentData.heroImage})` }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="buttonText" className="text-sm font-medium">
                        Button Text
                      </Label>
                      <Input
                        id="buttonText"
                        name="buttonText"
                        value={currentData.buttonText}
                        onChange={handleInputChange}
                        placeholder="e.g. Learn More"
                        required
                        className="w-full"
                      />
                    </div>
                  
                    <div className="space-y-2">
                      <Label htmlFor="buttonLink" className="text-sm font-medium">
                        Button Link
                      </Label>
                      <Input
                        id="buttonLink"
                        name="buttonLink"
                        value={currentData.buttonLink}
                        onChange={handleInputChange}
                        placeholder="e.g. /about"
                        required
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {currentData._id 
                      ? (isLoading ? 'Updating...' : 'Update Section') 
                      : (isLoading ? 'Creating...' : 'Create Section')
                    }
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      handleReset();
                      if (currentData._id) {
                        setActiveTab('view');
                      }
                    }}
                    className="w-full sm:w-auto"
                  >
                    {currentData._id ? 'Cancel' : 'Reset Form'}
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