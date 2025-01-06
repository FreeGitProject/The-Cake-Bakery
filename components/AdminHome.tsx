'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
//import Loader from '@/app/components/Loader';
import { useToast } from "@/hooks/use-toast";
interface HomeData {
  _id?: string; // Use _id as the unique identifier
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  buttonText: string;
  buttonLink: string;
}

export default function AdminHome() {
  const [homeList, setHomeList] = useState<HomeData[]>([]); // Initialize as an empty array
  const [currentData, setCurrentData] = useState<HomeData>({
    heroTitle: '',
    heroSubtitle: '',
    heroImage: '',
    buttonText: '',
    buttonLink: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast(); // Initialize toast hook

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
      } finally {
        setIsLoading(false);
      }
    }
    fetchHomeList();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      // Determine API endpoint based on whether _id exists
      const res = await fetch('/api/home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentData), // Send data including _id if present
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save/update home data');
      }
  
      const updatedData = await res.json();
  
      // Update the UI based on response
      setHomeList((prevList) =>
        currentData._id
          ? prevList.map((item) => (item._id === updatedData._id ? updatedData : item)) // Update the existing entry
          : [...prevList, updatedData] // Add new entry
      );
  
      // Reset the form
      setCurrentData({
        heroTitle: '',
        heroSubtitle: '',
        heroImage: '',
        buttonText: '',
        buttonLink: '',
      }); 
      toast({
        title: currentData._id ? 'Home Section Updated' : 'Home Section Created',
        description: `The home section has been successfully ${currentData._id ? 'updated' : 'created'}.`,
       // variant: 'success',
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
       // variant: 'success',
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
  };

  // if (isLoading) {
  //   return (
  //     <div>
  //       <Loader />
  //     </div>
  //   );
  // }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Home Sections</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <Label htmlFor="heroTitle">Hero Title</Label>
          <Input
            id="heroTitle"
            name="heroTitle"
            value={currentData.heroTitle}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
          <Textarea
            id="heroSubtitle"
            name="heroSubtitle"
            value={currentData.heroSubtitle}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="heroImage">Hero Image URL</Label>
          <Input
            id="heroImage"
            name="heroImage"
            value={currentData.heroImage}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="buttonText">Button Text</Label>
          <Input
            id="buttonText"
            name="buttonText"
            value={currentData.buttonText}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="buttonLink">Button Link</Label>
          <Input
            id="buttonLink"
            name="buttonLink"
            value={currentData.buttonLink}
            onChange={handleInputChange}
            required
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {currentData._id ? (isLoading ? 'Updating...' : 'Update Home Section') : (isLoading ? 'Saving...' : 'Save Home Section')}
        </Button>
      </form>

      <div className="space-y-4">
        {homeList.length > 0 ? (
          homeList.map((home) => (
            <div key={home._id} className="border p-4 rounded">
              <h2 className="text-xl font-bold">{home.heroTitle}</h2>
              <p>{home.heroSubtitle}</p>
              <p>{home.heroImage}</p>
              <p>{home.buttonText}</p>
              <p>{home.buttonLink}</p>
              <div className="flex gap-4 mt-4">
                <Button variant="secondary" onClick={() => handleEdit(home)}>
                  Edit
                </Button>
                <Button variant="secondary" onClick={() => handleDelete(home._id!)}>
                  Delete
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p>No home data available.</p>
        )}
      </div>
    </div>
  );
}
