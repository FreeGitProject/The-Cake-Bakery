"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {  useState } from "react"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
//import { Textarea } from "@/components/ui/textarea"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"

import { Checkbox } from "@/components/ui/checkbox"
//import { useSession } from "next-auth/react"

// Define the schema for form validation
const companyFormSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  locations: z.array(
    z.object({
      id: z.number(),
      name: z.string().min(1, "Branch name is required"),
      address: z.object({
        line1: z.string().min(1, "Address line 1 is required"),
        line2: z.string().optional(),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        pincode: z.string().min(6, "Valid pincode is required"),
      }),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number(),
        mapUrl: z.string().url("Valid map URL is required"),
      }),
      hours: z.object({
        weekdays: z.object({
          days: z.string(),
          open: z.string(),
          close: z.string(),
        }),
        saturday: z.object({
          days: z.string(),
          open: z.string(),
          close: z.string(),
        }),
        sunday: z.object({
          days: z.string(),
          open: z.string(),
          close: z.string(),
        }),
      }),
      contact: z.object({
        phone: z.string().min(10, "Valid phone number is required"),
        email: z.string().email("Valid email is required"),
      }),
      features: z.array(z.string()),
      specialHours: z.object({
        festivals: z.string(),
        holidays: z.string(),
      }),
    })
  ),
  socialMedia: z.object({
    instagram: z.string(),
    facebook: z.string(),
    twitter: z.string(),
  }),
  delivery: z.object({
    radius: z.string(),
    minimumOrder: z.number(),
    partners: z.array(z.string()),
  }),
});

// Available features for the checkbox group
const availableFeatures = [
  "Birthday Cakes",
  "Custom Orders", 
  "Wedding Cakes",
  "Cafe Seating",
  "Free WiFi",
  "Parking Available",
  "Vegan Options",
  "Gluten-Free Options",
  "Drive-Thru",
  "Home Delivery"
];

// Available delivery partners
const deliveryPartners = [
  "Swiggy",
  "Zomato",
  "UberEats",
  "Dunzo",
  "In-house Delivery"
];

export default function CompanyInfoForm() {
  // Initialize form with default values
  const form = useForm<z.infer<typeof companyFormSchema>>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      companyName: "The Cake Shop",
      locations: [
        {
          id: 1,
          name: "Noida Branch",
          address: {
            line1: "Shop No. A-79, S.K Market",
            line2: "Shramik Kunj, Sector 110",
            city: "Noida",
            state: "Uttar Pradesh",
            pincode: "201304",
          },
          coordinates: {
            lat: 28.533370126037724,
            lng: 77.38762052489452,
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1752.6056133790903!2d77.38762052489452!3d28.533370126037724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce8a68ffffff1%3A0xaf4867a2327d6c68!2sThe%20Cake%20Shop!5e0!3m2!1sen!2sin!4v1736051994561!5m2!1sen!2sin",
          },
          hours: {
            weekdays: {
              days: "Monday - Friday",
              open: "7:00 AM",
              close: "8:00 PM",
            },
            saturday: {
              days: "Saturday",
              open: "8:00 AM",
              close: "9:00 PM",
            },
            sunday: {
              days: "Sunday",
              open: "9:00 AM",
              close: "7:00 PM",
            },
          },
          contact: {
            phone: "+91 98765 43210",
            email: "noida@thecakeshop.com",
          },
          features: [
            "Birthday Cakes",
            "Custom Orders",
            "Wedding Cakes",
            "Cafe Seating",
            "Free WiFi",
            "Parking Available",
          ],
          specialHours: {
            festivals: "Extended hours during festivals",
            holidays: "Open on all major holidays",
          },
        },
      ],
      socialMedia: {
        instagram: "@thecakeshop_noida",
        facebook: "TheCakeShopNoida",
        twitter: "@CakeShopNoida",
      },
      delivery: {
        radius: "10km",
        minimumOrder: 500,
        partners: ["Swiggy", "Zomato", "UberEats"],
      },
    },
  });
 
   const [isSubmitting, setIsSubmitting] = useState(false);
//    const { data: session } = useSession()
//   useEffect(() => {
//     if (session?.user?.role === "admin") {
//       fetchCompanyInfo()
//     }
//   }, [session])

//   const fetchCompanyInfo = async () => {
//     try {
//       const response = await fetch("/api/company-info")
//       if (response.ok) {
//         const data = await response.json()
//       // Reset form with fetched data
//       form.reset(data)
//       } else {
//         throw new Error("Failed to fetch company info")
//       }
//     } catch (error) {
//       console.error("Error fetching company info:", error)
//       toast({
//         title: "Error",
//         description: "Failed to fetch company info. Please try again.",
//         variant: "destructive",
//       })
//     }
//   }
  const handleSubmit = async (data: z.infer<typeof companyFormSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/company-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Company info updated successfully.",
        });
      } else {
        throw new Error("Failed to update company info");
      }
    } catch (error) {
      console.error("Error updating company info:", error);
      toast({
        title: "Error",
        description: "Failed to update company info. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Company Information</CardTitle>
          <CardDescription>
            Update your cake shop&apos;s company information, location and services
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent className="space-y-6">
              {/* Company Name */}
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator className="my-6" />
              
              <h3 className="text-lg font-medium">Location Information</h3>
              
              {form.watch("locations").map((location, locationIndex) => (
                <Accordion type="single" collapsible key={location.id} defaultValue="location">
                  <AccordionItem value="location">
                    <AccordionTrigger>
                      {form.watch(`locations.${locationIndex}.name`) || `Location ${locationIndex + 1}`}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 p-2">
                        {/* Branch Name */}
                        <FormField
                          control={form.control}
                          name={`locations.${locationIndex}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Branch Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Address Section */}
                        <div className="border rounded-md p-4 space-y-4">
                          <h4 className="font-medium">Address</h4>
                          
                          <FormField
                            control={form.control}
                            name={`locations.${locationIndex}.address.line1`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address Line 1</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`locations.${locationIndex}.address.line2`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address Line 2 (Optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name={`locations.${locationIndex}.address.city`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`locations.${locationIndex}.address.state`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`locations.${locationIndex}.address.pincode`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Pincode</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        {/* Coordinates */}
                        <div className="border rounded-md p-4 space-y-4">
                          <h4 className="font-medium">Map Coordinates</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`locations.${locationIndex}.coordinates.lat`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Latitude</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="any" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`locations.${locationIndex}.coordinates.lng`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Longitude</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="any" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name={`locations.${locationIndex}.coordinates.mapUrl`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Map Embed URL</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                  Enter the Google Maps embed URL for your location
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {/* Business Hours */}
                        <div className="border rounded-md p-4 space-y-4">
                          <h4 className="font-medium">Business Hours</h4>
                          
                          {/* Weekdays */}
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">Weekdays</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name={`locations.${locationIndex}.hours.weekdays.days`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Days</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`locations.${locationIndex}.hours.weekdays.open`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Opening Time</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`locations.${locationIndex}.hours.weekdays.close`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Closing Time</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                          
                          {/* Saturday */}
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">Saturday</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name={`locations.${locationIndex}.hours.saturday.days`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Days</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`locations.${locationIndex}.hours.saturday.open`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Opening Time</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`locations.${locationIndex}.hours.saturday.close`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Closing Time</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                          
                          {/* Sunday */}
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">Sunday</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name={`locations.${locationIndex}.hours.sunday.days`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Days</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`locations.${locationIndex}.hours.sunday.open`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Opening Time</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`locations.${locationIndex}.hours.sunday.close`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Closing Time</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Special Hours */}
                        <div className="border rounded-md p-4 space-y-4">
                          <h4 className="font-medium">Special Hours</h4>
                          
                          <FormField
                            control={form.control}
                            name={`locations.${locationIndex}.specialHours.festivals`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Festival Hours</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`locations.${locationIndex}.specialHours.holidays`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Holiday Hours</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {/* Contact Details */}
                        <div className="border rounded-md p-4 space-y-4">
                          <h4 className="font-medium">Contact Details</h4>
                          
                          <FormField
                            control={form.control}
                            name={`locations.${locationIndex}.contact.phone`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`locations.${locationIndex}.contact.email`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {/* Features */}
                        <div className="border rounded-md p-4 space-y-4">
                          <h4 className="font-medium">Features</h4>
                          <FormField
                            control={form.control}
                            name={`locations.${locationIndex}.features`}
                            render={() => (
                              <FormItem>
                                <div className="grid grid-cols-2 gap-2">
                                  {availableFeatures.map((feature) => (
                                    <FormField
                                      key={feature}
                                      control={form.control}
                                      name={`locations.${locationIndex}.features`}
                                      render={({ field }) => {
                                        return (
                                          <FormItem
                                            key={feature}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                          >
                                            <FormControl>
                                              <Checkbox
                                                checked={field.value?.includes(feature)}
                                                onCheckedChange={(checked) => {
                                                  return checked
                                                    ? field.onChange([...field.value, feature])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                          (value) => value !== feature
                                                        )
                                                      )
                                                }}
                                              />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                              {feature}
                                            </FormLabel>
                                          </FormItem>
                                        )
                                      }}
                                    />
                                  ))}
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
              
              <Separator className="my-6" />
              
              {/* Social Media */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Social Media</h3>
                
                <FormField
                  control={form.control}
                  name="socialMedia.instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="socialMedia.facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="socialMedia.twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Separator className="my-6" />
              
              {/* Delivery Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Delivery Information</h3>
                
                <FormField
                  control={form.control}
                  name="delivery.radius"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Radius</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="delivery.minimumOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Order (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="delivery.partners"
                  render={() => (
                    <FormItem>
                      <FormLabel>Delivery Partners</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {deliveryPartners.map((partner) => (
                          <FormField
                            key={partner}
                            control={form.control}
                            name="delivery.partners"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={partner}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(partner)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, partner])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== partner
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {partner}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => form.reset()}>
                Reset
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}