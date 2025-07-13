"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Mail,
  Phone,
  MapPin,
  FileText,
  Receipt,
  CreditCard,
  ArrowLeft,
  TrendingUp,
  Calendar,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useCurrency } from "@/lib/currency-provider";

export default function ClientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`/api/clients/${id}`);
        if (response.ok) {
          const data = await response.json();
          setClient(data);
        } else {
          setError("Failed to load client");
        }
      } catch (error) {
        console.error("Error fetching client details:", error);
        setError("Error loading client");
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading client details...</div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Client not found"}</p>
          <Button onClick={() => router.push("/clients")}>Back to Clients</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              asChild
              className="shadow-sm border-gray-200 hover:bg-gray-50"
            >
              <Link href="/clients">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {client.name}
                </h1>
                {Number(client.unpaidAmount || 0) > 0 && (
                  <Badge variant="destructive">Outstanding Balance</Badge>
                )}
              </div>
              <p className="text-gray-600">
                Client since{" "}
                {format(new Date(client.createdAt), "MMMM yyyy")}
              </p>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href={`/clients/${id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Client
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Client Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Information */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="bg-primary/5 border-b border-gray-100">
                <CardTitle className="text-primary flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center">
                  <Mail className="mr-3 h-4 w-4 text-gray-500" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-3 h-4 w-4 text-gray-500" />
                  <span>{client.phoneNumber}</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="mr-3 h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{client.address}</span>
                </div>
                {client.iban && (
                  <div className="flex items-center">
                    <CreditCard className="mr-3 h-4 w-4 text-gray-500" />
                    <span className="font-mono text-sm">{client.iban}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Client Summary */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="bg-primary/5 border-b border-gray-100">
                <CardTitle className="text-primary flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Business Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-900">
                      {client.invoiceCount || 0}
                    </div>
                    <div className="text-sm text-blue-700">Invoices</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-900">
                      {client.quoteCount || 0}
                    </div>
                    <div className="text-sm text-green-700">Quotes</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Total Spent
                    </span>
                    <span className="font-bold text-lg text-primary">
                      {formatCurrency(Number(client.totalSpent || 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Outstanding Balance
                    </span>
                    {Number(client.unpaidAmount || 0) > 0 ? (
                      <Badge variant="destructive" className="text-lg py-1 px-2">
                        {formatCurrency(Number(client.unpaidAmount || 0))}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-lg py-1 px-2 bg-green-100 text-green-800">
                        $0.00
                      </Badge>
                    )}
                  </div>
                </div>

                {client.lastOrderDate && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Last Order
                      </span>
                      <span className="text-sm text-gray-900">
                        {format(new Date(client.lastOrderDate), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-100">
                <CardTitle className="text-gray-700">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href={`/quotes/client/new?clientId=${id}`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Create Quote
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href={`/invoices/client/new?clientId=${id}`}>
                    <Receipt className="mr-2 h-4 w-4" />
                    Create Invoice
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href={`/invoices/client?clientId=${id}`}>
                    View All Invoices
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href={`/quotes/client?clientId=${id}`}>
                    View All Quotes
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="bg-primary/5 border-b border-gray-100">
                <CardTitle className="text-primary flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Activity Timeline
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Recent invoices, quotes, and interactions will appear here
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" asChild>
                      <Link href={`/invoices/client?clientId=${id}`}>
                        View Invoices
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/quotes/client?clientId=${id}`}>
                        View Quotes
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
