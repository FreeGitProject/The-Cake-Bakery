'use client'
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  ArrowLeft,
} from "lucide-react";

interface Category {
  _id: string;
  name: string;
}

interface Price {
  weight: number;
  costPrice: number;
  sellPrice: number;
}

interface Cake {
  _id: string;
  name: string;
  description: string;
  caketype: string;
  type: string;
  prices: Price[];
  image: string[];
  category: string;
  isAvailable: boolean;
  isPublished: boolean;
}

export default function EditCake({ id }: { id: string }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("basic");
  const router = useRouter();

  const [cake, setCake] = useState<Cake>({
    _id: "",
    name: "",
    description: "",
    caketype: "cake",
    type: "eggless",
    prices: [{ weight: 0, costPrice: 0, sellPrice: 0 }],
    image: [""],
    category: "",
    isAvailable: true,
    isPublished: false,
  });

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    Promise.all([fetchCake(), fetchCategories()])
      .then(() => setIsFetching(false))
      .catch(() => {
        toast({
          variant: "destructive",
          description: "Failed to load cake data",
        });
        router.push("/admin/cakes");
      });
  }, [id]);

  const fetchCake = async () => {
    try {
      const response = await fetch(`/api/cakes/${id}`);
      if (!response.ok) throw new Error("Failed to fetch cake");
      const data = await response.json();
      setCake(data);
    } catch (error) {
      console.error("Error fetching cake:", error);
      throw error;
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!cake.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!cake.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!cake.category) {
      newErrors.category = "Category is required";
    }
    
    cake.prices.forEach((price, index) => {
      if (price.sellPrice <= price.costPrice) {
        newErrors[`price-${index}`] = "Selling price must be higher than cost price";
      }
      if (price.weight <= 0) {
        newErrors[`weight-${index}`] = "Weight must be greater than 0";
      }
    });

    if (!cake.image[0]) {
      newErrors.image = "At least one image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        variant: "destructive",
        description: "Please fix the errors before submitting",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/cakes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cake),
      });
      
      if (response.ok) {
        toast({
          description: "Cake updated successfully",
        });
        router.push("/admin/cakes");
      } else {
        throw new Error("Failed to update cake");
      }
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        description: "Failed to update cake",
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
    setCake((prev) => ({
      ...prev,
      prices: prev.prices.map((price, i) =>
        i === index ? { ...price, [field]: value } : price
      ),
    }));
  };

  if (isFetching) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/cakes")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cakes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Cake</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={cake.name}
                    onChange={(e) => setCake(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter cake name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={cake.description}
                    onChange={(e) => setCake(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter description"
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cake Type</Label>
                    <Select
                      value={cake.caketype}
                      onValueChange={(value) => setCake(prev => ({ ...prev, caketype: value }))}
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

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={cake.category}
                      onValueChange={(value) => setCake(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className={errors.category ? "border-red-500" : ""}>
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
                      <p className="text-sm text-red-500">{errors.category}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Contains Egg</Label>
                  <Select
                    value={cake.type}
                    onValueChange={(value) => setCake(prev => ({ ...prev, type: value }))}
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

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isAvailable"
                    checked={cake.isAvailable}
                    onCheckedChange={(checked) => setCake(prev => ({ ...prev, isAvailable: checked }))}
                  />
                  <Label htmlFor="isAvailable">Available for Purchase</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublished"
                    checked={cake.isPublished}
                    onCheckedChange={(checked) => setCake(prev => ({ ...prev, isPublished: checked }))}
                  />
                  <Label htmlFor="isPublished">IsPublished</Label>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4">
                {cake.prices.map((price, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Weight (kg)</Label>
                          <Input
                            type="number"
                            value={price.weight}
                            onChange={(e) => handlePriceChange(index, "weight", parseFloat(e.target.value))}
                            min="0"
                            step="0.1"
                            className={errors[`weight-${index}`] ? "border-red-500" : ""}
                          />
                          {errors[`weight-${index}`] && (
                            <p className="text-sm text-red-500">{errors[`weight-${index}`]}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Cost Price (₹)</Label>
                          <Input
                            type="number"
                            value={price.costPrice}
                            onChange={(e) => handlePriceChange(index, "costPrice", parseFloat(e.target.value))}
                            min="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Selling Price (₹)</Label>
                          <Input
                            type="number"
                            value={price.sellPrice}
                            onChange={(e) => handlePriceChange(index, "sellPrice", parseFloat(e.target.value))}
                            min="0"
                            className={errors[`price-${index}`] ? "border-red-500" : ""}
                          />
                          {errors[`price-${index}`] && (
                            <p className="text-sm text-red-500">{errors[`price-${index}`]}</p>
                          )}
                        </div>
                      </div>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setCake(prev => ({
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
                  onClick={() => {
                    setCake(prev => ({
                      ...prev,
                      prices: [...prev.prices, { weight: 0, costPrice: 0, sellPrice: 0 }]
                    }));
                  }}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Price Option
                </Button>
              </TabsContent>

              <TabsContent value="images" className="space-y-4">
                             {cake.image.map((image, index) => (
                               <div key={index} className="flex items-center space-x-2">
                                 <Input
                                   value={image}
                                   onChange={(e) => {
                                     const newImages = [...cake.image];
                                     newImages[index] = e.target.value;
                                     setCake(prev => ({ ...prev, image: newImages }));
                                   }}
                                   placeholder={`Image URL ${index + 1}`}
                                   className={index === 0 && errors.image ? "border-red-500" : ""}
                                 />
                                 {index > 0 && (
                                   <Button
                                     type="button"
                                     variant="ghost"
                                     onClick={() => {
                                       setCake(prev => ({
                                         ...prev,
                                         image: prev.image.filter((_, i) => i !== index)
                                       }));
                                     }}
                                   >
                                     <MinusCircle className="w-4 h-4" />
                                   </Button>
                                 )}
                               </div>
                             ))}
                             {errors.image && (
                               <p className="text-sm text-red-500">{errors.image}</p>
                             )}
                             <Button
                               type="button"
                               variant="outline"
                               onClick={() => {
                                 setCake(prev => ({
                                   ...prev,
                                   image: [...prev.image, ""]
                                 }));
                               }}
                             >
                               <PlusCircle className="w-4 h-4 mr-2" />
                               Add Image URL
                             </Button>
                           </TabsContent>
                         </Tabs>
             
                         {Object.keys(errors).length > 0 && (
                           <Alert variant="destructive">
                             <AlertCircle className="h-4 w-4" />
                             <AlertTitle>Error</AlertTitle>
                             <AlertDescription>
                               Please fix the validation errors before submitting
                             </AlertDescription>
                           </Alert>
                         )}
             
                         <div className="flex justify-end space-x-4 pt-6">
                           <Button
                             type="button"
                             variant="outline"
                             onClick={() => router.push("/admin/cakes")}
                           >
                             Cancel
                           </Button>
                           <Button type="submit" disabled={isLoading}>
                             {isLoading ? (
                               <>
                                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                 Updating...
                               </>
                             ) : (
                               "Update Cake"
                             )}
                           </Button>
                         </div>
                       </form>
                     </CardContent>
                   </Card>
                 </div>
               );
             }