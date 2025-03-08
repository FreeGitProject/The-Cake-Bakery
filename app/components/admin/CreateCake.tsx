'use client'
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Loader2,
  PlusCircle,
  MinusCircle,
  AlertCircle,
  Plus,
  Link,
  Upload,
} from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Category {
  _id: string;
  name: string;
}

interface Price {
  weight: number;
  costPrice: number;
  sellPrice: number;
}

export default function CreateCake() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("basic");
  const router = useRouter();

  // Separate states for uploaded images and URL images
  const [uploadedImages, setUploadedImages] = useState<string[]>([""]);
  const [urlImages, setUrlImages] = useState<string[]>([""]);

  const [newCake, setNewCake] = useState({
    name: "",
    description: "",
    caketype: "cake",
    type: "eggless",
    prices: [{ weight: 0, costPrice: 0, sellPrice: 0 }],
    category: "",
    isAvailable: true,
    isPublished: false,
  });

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        variant: "destructive",
        description: "Failed to fetch categories",
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newCake.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!newCake.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!newCake.category) {
      newErrors.category = "Category is required";
    }
    
    newCake.prices.forEach((price, index) => {
      if (price.sellPrice <= 0) {
        newErrors[`sellPrice-${index}`] = "Selling price must be greater than 0";
      }
      // if (price.sellPrice <= price.costPrice) {
      //   newErrors[`price-${index}`] = "Selling price must be higher than cost price";
      // }
      if (price.weight <= 0) {
        newErrors[`weight-${index}`] = "Weight must be greater than 0";
      }
    });

    // Check if at least one valid image exists from either source
    const validUploadedImages = uploadedImages.filter(img => img.trim() !== "");
    const validUrlImages = urlImages.filter(img => img.trim() !== "");
    
    if (validUploadedImages.length === 0 && validUrlImages.length === 0) {
      newErrors.image = "At least one image is required (either uploaded or URL)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the form first
    if (!validateForm()) {
      toast({
        variant: "destructive",
        description: "Please fix the errors before submitting",
      });
      return;
    }

    setIsLoading(true);
    
    // Filter out empty image URLs from both sources
    const filteredUploadedImages = uploadedImages.filter(img => img.trim() !== "");
    const filteredUrlImages = urlImages.filter(img => img.trim() !== "");
    
    // Combine both image sources
    const allImages = [...filteredUploadedImages, ...filteredUrlImages];
    
    try {
      const cakeData = {
        ...newCake,
        image: allImages, // Combined images from both sources
      };
      
      const response = await fetch("/api/cakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cakeData),
      });
      
      if (response.ok) {
        toast({
          description: "Cake created successfully",
        });
        router.push("/admin/cakes");
      } else {
        throw new Error("Failed to create cake");
      }
    } catch (error) {
      console.error("Error creating cake:", error);
      toast({
        variant: "destructive",
        description: "Failed to create cake",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriceChange = (
    index: number,
    field: keyof Price,
    value: number
  ) => {
    setNewCake((prev) => ({
      ...prev,
      prices: prev.prices.map((price, i) =>
        i === index ? { ...price, [field]: value } : price
      ),
    }));
  };
  
  // URL Image Handlers
  const handleAddUrlImage = () => {
    setUrlImages([...urlImages, ""]);
  };
  
  const handleUrlImageChange = (index: number, value: string) => {
    const newImages = [...urlImages];
    newImages[index] = value;
    setUrlImages(newImages);
  };

  const handleRemoveUrlImage = (index: number) => {
    if (urlImages.length > 1) {
      setUrlImages(urlImages.filter((_, i) => i !== index));
    } else {
      // If it's the last image, just clear it instead of removing
      setUrlImages([""]);
    }
  };
  
  // Uploaded Image Handlers
  const handleAddUploadedImage = () => {
    setUploadedImages([...uploadedImages, ""]);
  };
  
// In the CreateCake component, modify the handleUploadedImageChange function:
const handleUploadedImageChange = (index: number, value: string) => {
  // Only update if we have a valid URL from the uploader
  if (value && value.trim() !== "") {
    const newImages = [...uploadedImages];
    newImages[index] = value;
    setUploadedImages(newImages);
  }
  // If the value is empty, we don't update the state, preserving the existing image
};

  const handleRemoveUploadedImage = (index: number) => {
    if (uploadedImages.length > 1) {
      setUploadedImages(uploadedImages.filter((_, i) => i !== index));
    } else {
      // If it's the last image, just clear it instead of removing
      setUploadedImages([""]);
    }
  };

  const goToNextTab = () => {
    if (activeTab === "basic") setActiveTab("pricing");
    else if (activeTab === "pricing") setActiveTab("images");
  };

  const goToPrevTab = () => {
    if (activeTab === "images") setActiveTab("pricing");
    else if (activeTab === "pricing") setActiveTab("basic");
  };

  // Check if any images are added from either source
  const hasAnyValidImages = () => {
    return (
      uploadedImages.some(img => img.trim() !== "") || 
      urlImages.some(img => img.trim() !== "")
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="shadow-md">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-2xl">Add New Cake</CardTitle>
          <CardDescription>Fill in the details to create a new cake product</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Cake Name
                  </Label>
                  <Input
                    id="name"
                    value={newCake.name}
                    onChange={(e) => setNewCake(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter cake name"
                    className={errors.name ? "border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newCake.description}
                    onChange={(e) => setNewCake(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter cake description"
                    className={`min-h-32 ${errors.description ? "border-red-500 focus:ring-red-500" : ""}`}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Cake Type</Label>
                    <Select
                      value={newCake.caketype}
                      onValueChange={(value) => setNewCake(prev => ({ ...prev, caketype: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cake">Cake</SelectItem>
                        <SelectItem value="pastries">Pastry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Category</Label>
                    <Select
                      value={newCake.category}
                      onValueChange={(value) => setNewCake(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className={errors.category ? "border-red-500 focus:ring-red-500" : ""}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-red-500 mt-1">{errors.category}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Contains Egg</Label>
                  <Select
                    value={newCake.type}
                    onValueChange={(value) => setNewCake(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Contains Egg">Contains Egg</SelectItem>
                      <SelectItem value="eggless">Eggless</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="flex items-center space-x-3 p-3 border rounded-md bg-gray-50">
                    <Switch
                      id="isAvailable"
                      checked={newCake.isAvailable}
                      onCheckedChange={(checked) => setNewCake(prev => ({ ...prev, isAvailable: checked }))}
                    />
                    <Label htmlFor="isAvailable" className="font-medium">Available for Purchase</Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 border rounded-md bg-gray-50">
                    <Switch
                      id="isPublished"
                      checked={newCake.isPublished}
                      onCheckedChange={(checked) => setNewCake(prev => ({ ...prev, isPublished: checked }))}
                    />
                    <Label htmlFor="isPublished" className="font-medium">Published on Website</Label>
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/cakes")}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={goToNextTab}>
                    Next: Pricing
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-6">
                <h3 className="text-lg font-medium mb-4">Price Options</h3>
                {newCake.prices.map((price, index) => (
                  <Card key={index} className="border">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Weight (kg)</Label>
                          <Input
                            type="number"
                            value={price.weight || ""}
                            onChange={(e) => handlePriceChange(index, "weight", parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.1"
                            className={errors[`weight-${index}`] ? "border-red-500 focus:ring-red-500" : ""}
                          />
                          {errors[`weight-${index}`] && (
                            <p className="text-sm text-red-500 mt-1">{errors[`weight-${index}`]}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Cost Price (₹)</Label>
                          <Input
                            type="number"
                            value={price.costPrice || ""}
                            onChange={(e) => handlePriceChange(index, "costPrice", parseFloat(e.target.value) || 0)}
                            min="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Selling Price (₹)</Label>
                          <Input
                            type="number"
                            value={price.sellPrice || ""}
                            onChange={(e) => handlePriceChange(index, "sellPrice", parseFloat(e.target.value) || 0)}
                            min="0"
                            className={errors[`price-${index}`] || errors[`sellPrice-${index}`] ? "border-red-500 focus:ring-red-500" : ""}
                          />
                          {errors[`price-${index}`] && (
                            <p className="text-sm text-red-500 mt-1">{errors[`price-${index}`]}</p>
                          )}
                          {errors[`sellPrice-${index}`] && (
                            <p className="text-sm text-red-500 mt-1">{errors[`sellPrice-${index}`]}</p>
                          )}
                        </div>
                      </div>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="mt-4"
                          onClick={() => {
                            setNewCake(prev => ({
                              ...prev,
                              prices: prev.prices.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          <MinusCircle className="w-4 h-4 mr-2" />
                          Remove Price Option
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setNewCake(prev => ({
                      ...prev,
                      prices: [...prev.prices, { weight: 0, costPrice: 0, sellPrice: 0 }]
                    }));
                  }}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Price Option
                </Button>
                
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={goToPrevTab}>
                    Back: Basic Info
                  </Button>
                  <Button type="button" onClick={goToNextTab}>
                    Next: Images
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="images" className="space-y-6">
                <h3 className="text-lg font-medium mb-2">Cake Images</h3>
                <p className="text-sm text-gray-500 mb-4">Add images either by uploading files or providing URLs</p>
                
                {errors.image && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <AlertDescription>{errors.image}</AlertDescription>
                  </Alert>
                )}
                
                <Accordion type="single" collapsible className="w-full">
                  {/* Upload Images Section */}
                  <AccordionItem value="upload-images">
                    <AccordionTrigger className="py-4 px-6 bg-gray-50 rounded-md border">
                      <div className="flex items-center">
                        <Upload className="h-5 w-5 mr-2" />
                        <span>Upload Images</span>
                        {uploadedImages.some(img => img.trim() !== "") && (
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {uploadedImages.filter(img => img.trim() !== "").length} added
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 px-2">
                      <div className="space-y-4">
                        {uploadedImages.map((img, index) => (
                          <div key={index} className="p-4 border rounded-md bg-gray-50">
                            <ImageUploader 
                              onImageUploaded={(url) => handleUploadedImageChange(index, url)} 
                              existingImageUrl={img} 
                            />
                            
                            {index > 0 && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveUploadedImage(index)}
                                className="mt-3 w-full"
                              >
                                <MinusCircle className="w-4 h-4 mr-2" />
                                Remove Image
                              </Button>
                            )}
                          </div>
                        ))}
                        
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleAddUploadedImage} 
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add Another Image
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  {/* URL Images Section */}
                  <AccordionItem value="url-images" className="mt-4">
                    <AccordionTrigger className="py-4 px-6 bg-gray-50 rounded-md border">
                      <div className="flex items-center">
                        <Link className="h-5 w-5 mr-2" />
                        <span>Add Image URLs</span>
                        {urlImages.some(img => img.trim() !== "") && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {urlImages.filter(img => img.trim() !== "").length} added
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 px-2">
                      <div className="space-y-4">
                        {urlImages.map((img, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Input
                                value={img}
                                onChange={(e) => handleUrlImageChange(index, e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="flex-1"
                              />
                              {index > 0 && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => handleRemoveUrlImage(index)}
                                >
                                  <MinusCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                            {img && (
                              <div className="border rounded-md p-2 bg-gray-50">
                                <div className="text-xs text-gray-500 mb-1">Image Preview:</div>
                                <div className="relative h-24 w-full bg-gray-100 rounded overflow-hidden">
                                  <div 
                                    className="absolute inset-0 bg-contain bg-center bg-no-repeat" 
                                    style={{ backgroundImage: `url(${img})` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleAddUrlImage} 
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add Another URL
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                {/* Image Status Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-md border">
                  <h4 className="font-medium mb-2">Image Status</h4>
                  <div className="text-sm grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-medium">Uploaded Images:</span> {uploadedImages.filter(img => img.trim() !== "").length}
                    </div>
                    <div>
                      <span className="font-medium">URL Images:</span> {urlImages.filter(img => img.trim() !== "").length}
                    </div>
                  </div>
                  {!hasAnyValidImages() && (
                    <div className="mt-2 text-sm text-amber-600">
                      <AlertCircle className="inline-block h-4 w-4 mr-1" />
                      You need to add at least one image to create the cake
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-6">
                  <Button type="button" variant="outline" onClick={goToPrevTab}>
                    Back: Pricing
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Cake"
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {Object.keys(errors).length > 0 && (
              <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Please fix the validation errors before submitting
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}