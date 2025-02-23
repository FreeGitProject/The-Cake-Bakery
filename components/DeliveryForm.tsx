 // eslint-disable-next-line @typescript-eslint/no-explicit-any
import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from "zod"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(6, 'Valid pin code is required'),
  country: z.string().min(1, 'Country is required'),
  deliveryDate: z.string().min(1, 'Please select a delivery date'),
  deliverySlot: z.string().min(1, 'Please select a delivery time slot'),
  isGift: z.boolean().default(false),
  giftMessage: z.string().optional(),
});
interface DeliveryFormProps {
    formData: any;
    onFormDataChange: (data: any) => void;
    savedAddresses: any[];
    selectedAddress: string;
    onAddressSelect: (addressId: string) => void;
    availableDeliveryDates: any[];
    deliverySlots: any[];
    setCheckoutStep: (step: number) => void;
  }

  const DeliveryForm = ({
    formData,
    onFormDataChange,
    savedAddresses,
    selectedAddress,
    onAddressSelect,
    availableDeliveryDates,
    deliverySlots,
    setCheckoutStep,
  }: DeliveryFormProps  & { setCheckoutStep: React.Dispatch<React.SetStateAction<number>> }) => {
    const form = useForm({
      resolver: zodResolver(formSchema),
      defaultValues: {
        ...formData,
        deliveryDate: '',
        deliverySlot: '',
        isGift: false,
        giftMessage: '',
      },
    });
  
    // Watch form changes and update parent
    useEffect(() => {
      const subscription = form.watch((value) => {
        onFormDataChange(value);
      });
      return () => subscription.unsubscribe();
    }, [form.watch, onFormDataChange]);
  
    // Handle saved address selection
    const handleSavedAddressChange = (addressId: string) => {
      onAddressSelect(addressId);
      // Update form fields with selected address
      const selected = savedAddresses.find(addr => addr._id === addressId);
      if (selected) {
        form.setValue('address', selected.street);
        form.setValue('city', selected.city);
        form.setValue('state', selected.state);
        form.setValue('zipCode', selected.zipCode);
        form.setValue('country', selected.country);
      }
    };
    const handleNextStep = () => {
        form.handleSubmit((data) => {
          setCheckoutStep((prev) => typeof prev === 'number' ? prev + 1 : 1); // Ensure `prev` is a number
        })();
      };
      

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Details</CardTitle>
        <CardDescription>Choose delivery options and address</CardDescription>
      </CardHeader>
      <Form {...form}>
        <CardContent className="space-y-6">
          {savedAddresses?.length > 0 && (
           <FormField
           control={form.control}
           name="savedAddress"
           render={({ field }) => (
             <FormItem>
               <FormLabel>Saved Addresses</FormLabel>
               <Select 
                 value={selectedAddress} 
                 onValueChange={handleSavedAddressChange}
               >
                 <FormControl>
                   <SelectTrigger>
                     <SelectValue placeholder="Choose a saved address" />
                   </SelectTrigger>
                 </FormControl>
                 <SelectContent>
                   {savedAddresses?.map((addr) => (
                     <SelectItem key={addr._id} value={addr._id}>
                       {addr.type} - {addr.street}, {addr.city}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
               <FormMessage />
             </FormItem>
              )}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
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
              name="state"
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
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pin Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="deliveryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Date</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select delivery date" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableDeliveryDates.map((date) => (
                        <SelectItem key={date.value} value={date.value}>
                          {date.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliverySlot"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Time Slot</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {deliverySlots.map((slot) => (
                        <SelectItem
                          key={slot.id}
                          value={slot.id}
                          disabled={!slot.available}
                        >
                          {slot.time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="isGift"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>This is a gift</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('isGift') && (
              <FormField
                control={form.control}
                name="giftMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gift Message</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="min-h-[100px]"
                        placeholder="Enter your gift message..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </CardContent>
      </Form>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCheckoutStep(1)}
        >
          Back to Cart
        </Button>
        <Button type="button" onClick={handleNextStep}>
          Continue to Payment
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DeliveryForm;