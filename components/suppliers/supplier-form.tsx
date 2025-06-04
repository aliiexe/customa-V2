"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contactName: z.string().min(2, "Contact name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  email: z.string().email("Email must be a valid email address"),
  phoneNumber: z.string().min(6, "Phone number must be at least 6 characters"),
  website: z.string().optional(),
});

type SupplierFormValues = z.infer<typeof formSchema>;

export default function SupplierForm({
  supplierId,
}: {
  supplierId: number | null;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contactName: "",
      address: "",
      email: "",
      phoneNumber: "",
      website: "",
    },
  });

  // Load supplier data if editing
  useEffect(() => {
    if (supplierId) {
      const fetchSupplier = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/suppliers/${supplierId}`);
          if (response.ok) {
            const supplier = await response.json();
            
            form.reset({
              name: supplier.name,
              contactName: supplier.contactName,
              address: supplier.address,
              email: supplier.email,
              phoneNumber: supplier.phoneNumber,
              website: supplier.website || "",
            });
          } else {
            setError("Failed to load supplier data");
          }
        } catch (error) {
          console.error("Error fetching supplier:", error);
          setError("Failed to load supplier data");
        } finally {
          setIsLoading(false);
        }
      };

      fetchSupplier();
    }
  }, [supplierId, form]);

  const onSubmit = async (data: SupplierFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = supplierId 
        ? `/api/suppliers/${supplierId}` 
        : '/api/suppliers';
      
      const method = supplierId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        router.push("/suppliers");
        router.refresh();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save supplier');
      }
    } catch (error) {
      console.error("Error saving supplier:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Supplier name" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Contact person" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email address" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Full address" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Website (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Website" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.push("/suppliers")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : supplierId ? "Update Supplier" : "Create Supplier"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}