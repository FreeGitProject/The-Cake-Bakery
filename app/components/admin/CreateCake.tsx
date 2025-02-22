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
import { Loader2, PlusCircle, MinusCircle, AlertCircle } from "lucide-react";
import { EventForm } from "@/components/EventForm";

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
  const [isEvent, setIsEvent] = useState(false)
  const [eventStartDate, setEventStartDate] = useState("")
  const [eventEndDate, setEventEndDate] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("basic");
  const router = useRouter();

  const [newCake, setNewCake] = useState({
    name: "",
    description: "",
    caketype: "cake",
    type: "eggless",
    prices: [{ weight: 0, costPrice: 0, sellPrice: 0 }],
    image: [""],
    category: "",
    isAvailable: true,
    isEvent,
    eventStartDate: isEvent ? eventStartDate : undefined,
    eventEndDate: isEvent ? eventEndDate : undefined,
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
      if (price.sellPrice <= price.costPrice) {
        newErrors[`price-${index}`] = "Selling price must be higher than cost price";
      }
      if (price.weight <= 0) {
        newErrors[`weight-${index}`] = "Weight must be greater than 0";
      }
    });

    if (!newCake.image[0]) {
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
      const response = await fetch("/api/cakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCake),
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
      console.error(error)
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Add New Cake</CardTitle>
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
                    value={newCake.name}
                    onChange={(e) => setNewCake(prev => ({ ...prev, name: e.target.value }))}
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
                    value={newCake.description}
                    onChange={(e) => setNewCake(prev => ({ ...prev, description: e.target.value }))}
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

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={newCake.category}
                      onValueChange={(value) => setNewCake(prev => ({ ...prev, category: value }))}
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

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isAvailable"
                    checked={newCake.isAvailable}
                    onCheckedChange={(checked) => setNewCake(prev => ({ ...prev, isAvailable: checked }))}
                  />
                  <Label htmlFor="isAvailable">Available for Purchase</Label>


                  <div className="flex items-center space-x-2">
        <Switch id="is-event" checked={isEvent} onCheckedChange={setIsEvent} />
        <Label htmlFor="is-event">Is this an event?</Label>
      </div>
                  {isEvent && (
        <EventForm
          eventStartDate={eventStartDate}
          eventEndDate={eventEndDate}
          setEventStartDate={setEventStartDate}
          setEventEndDate={setEventEndDate}
        />
      )}
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4">
                {newCake.prices.map((price, index) => (
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
              </TabsContent>

              <TabsContent value="images" className="space-y-4">
                {newCake.image.map((image, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={image}
                      onChange={(e) => {
                        const newImages = [...newCake.image];
                        newImages[index] = e.target.value;
                        setNewCake(prev => ({ ...prev, image: newImages }));
                      }}
                      placeholder={`Image URL ${index + 1}`}
                      className={index === 0 && errors.image ? "border-red-500" : ""}
                    />
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setNewCake(prev => ({
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
                    setNewCake(prev => ({
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
                    Creating...
                  </>
                ) : (
                  "Create Cake"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}