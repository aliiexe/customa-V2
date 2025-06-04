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
  address: z.string().min(5, "Address must be at least 5 characters"),
  email: z.string().email("Email must be a valid email address"),
  phoneNumber: z.string().min(6, "Phone number must be at least 6 characters"),
  iban: z.string().optional(),
});

type ClientFormValues = z.infer<typeof formSchema>;

export default function ClientForm({ clientId }: { clientId: number | null }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      email: "",
      phoneNumber: "",
      iban: "",
    },
  });

  // Load client data if editing
  useEffect(() => {
    if (clientId) {
      const fetchClient = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/clients/${clientId}`);
          if (response.ok) {
            const client = await response.json();

            form.reset({
              name: client.name,
              address: client.address,
              email: client.email,
              phoneNumber: client.phoneNumber,
              iban: client.iban || "",
            });
          } else {
            setError("Failed to load client data");
          }
        } catch (error) {
          console.error("Error fetching client:", error);
          setError("Failed to load client data");
        } finally {
          setIsLoading(false);
        }
      };

      fetchClient();
    }
  }, [clientId, form]);

  const onSubmit = async (data: ClientFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = clientId ? `/api/clients/${clientId}` : "/api/clients";

      const method = clientId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/clients");
        router.refresh();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to save client");
      }
    } catch (error) {
      console.error("Error saving client:", error);
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
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Client name"
                        disabled={isLoading}
                        {...field}
                      />
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
                      <Input
                        placeholder="Email address"
                        disabled={isLoading}
                        {...field}
                      />
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
                      <Input
                        placeholder="Phone number"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="iban"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IBAN (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bank account number"
                        disabled={isLoading}
                        {...field}
                      />
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
                      <Input
                        placeholder="Full address"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/clients")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : clientId
                  ? "Update Client"
                  : "Create Client"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
