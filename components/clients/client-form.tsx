"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Save,
  X,
  AlertCircle,
} from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Client name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  email: z.string().email("Email must be a valid email address"),
  phoneNumber: z.string().min(6, "Phone number must be at least 6 characters"),
  iban: z.string().optional(),
});

type ClientFormValues = z.infer<typeof formSchema>;

export default function ClientForm({ clientId }: { clientId: number | null }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!clientId);
  const [error, setError] = useState<string | null>(null);
  const [clientStats, setClientStats] = useState<any>(null);

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
        setInitialLoading(true);
        try {
          // Fetch client data
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

            // Fetch client stats
            try {
              const statsResponse = await fetch(
                `/api/clients/${clientId}/stats`
              );
              if (statsResponse.ok) {
                const stats = await statsResponse.json();
                setClientStats(stats);
              }
            } catch (error) {
              console.error("Error fetching client stats:", error);
            }
          } else {
            setError("Failed to load client data");
          }
        } catch (error) {
          console.error("Error fetching client:", error);
          setError("Failed to load client data");
        } finally {
          setInitialLoading(false);
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

  if (initialLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-sm border-gray-200">
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-300 animate-pulse" />
              <div className="text-lg text-gray-600">Loading client data...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Stats Card (only for editing) */}
      {clientId && clientStats && (
        <Card className="shadow-sm border-gray-200 bg-blue-50/50">
          <CardHeader className="bg-blue-100/50 border-b border-blue-200">
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <User className="h-5 w-5" />
              Client Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">
                  {clientStats.orderCount || 0}
                </div>
                <div className="text-sm text-blue-700">Total Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">
                  ${Number(clientStats.totalSpent || 0).toFixed(2)}
                </div>
                <div className="text-sm text-blue-700">Total Spent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">
                  ${Number(clientStats.unpaidAmount || 0).toFixed(2)}
                </div>
                <div className="text-sm text-blue-700">Outstanding</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">
                  {clientStats.quoteCount || 0}
                </div>
                <div className="text-sm text-blue-700">Active Quotes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Form Card */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="bg-primary/5 border-b border-gray-100">
          <CardTitle className="text-primary flex items-center gap-2">
            <User className="h-5 w-5" />
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          Client Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Client or company name"
                            disabled={isLoading}
                            className="h-11 border-gray-300 focus:border-primary focus:ring-primary/20"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          The official name of the client or business
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          Email Address *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="client@example.com"
                            type="email"
                            disabled={isLoading}
                            className="h-11 border-gray-300 focus:border-primary focus:ring-primary/20"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          Primary email for communication and invoicing
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          Phone Number *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+1 (555) 123-4567"
                            disabled={isLoading}
                            className="h-11 border-gray-300 focus:border-primary focus:ring-primary/20"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          Primary contact number
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="iban"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          IBAN (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="GB82 WEST 1234 5698 7654 32"
                            disabled={isLoading}
                            className="h-11 border-gray-300 focus:border-primary focus:ring-primary/20"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          International bank account number for payments
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Address Information
                </h3>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Full Address *
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Street address, city, state, postal code, country"
                          disabled={isLoading}
                          className="min-h-[100px] border-gray-300 focus:border-primary focus:ring-primary/20"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500">
                        Complete address for shipping and billing purposes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/clients")}
                  disabled={isLoading}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px]"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="mr-2 h-4 w-4" />
                      {clientId ? "Update Client" : "Create Client"}
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card className="shadow-sm border-gray-200 bg-blue-50/50">
        <CardContent className="p-6">
          <div className="flex items-start">
            <User className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">
                Client Management Tips
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • Ensure all contact information is accurate for smooth
                  communication
                </li>
                <li>
                  • IBAN information helps with international payment processing
                </li>
                <li>• Complete addresses are required for shipping and billing</li>
                <li>
                  • You cannot delete clients with existing orders or outstanding
                  balances
                </li>
                <li>• Client data is used across quotes, invoices, and reports</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
