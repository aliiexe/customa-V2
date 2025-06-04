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
  Receipt, // Replace FileInvoice with Receipt
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ClientDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  const router = useRouter();
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
      <div className="flex items-center justify-center h-[400px]">
        Loading client details...
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <p className="text-red-500 mb-4">{error || "Client not found"}</p>
        <Button onClick={() => router.push("/clients")}>Back to Clients</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
        <div className="space-x-4">
          <Button variant="outline" asChild>
            <Link href="/clients">Back</Link>
          </Button>
          <Button asChild>
            <Link href={`/clients/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <Mail className="mr-2 h-4 w-4 text-gray-500" />
              <span>{client.email}</span>
            </div>
            <div className="flex items-center">
              <Phone className="mr-2 h-4 w-4 text-gray-500" />
              <span>{client.phoneNumber}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-gray-500" />
              <span>{client.address}</span>
            </div>
            {client.iban && (
              <div className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4 text-gray-500" />
                <span>{client.iban}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Receipt className="mr-2 h-4 w-4 text-gray-500" />
                <span>Invoices</span>
              </div>
              <Badge variant="secondary">{client.invoiceCount || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-gray-500" />
                <span>Quotes</span>
              </div>
              <Badge variant="outline">{client.quoteCount || 0}</Badge>
            </div>
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-medium mb-2">Outstanding Balance</h3>
              {(client.unpaidAmount || 0) > 0 ? (
                <Badge variant="destructive" className="text-lg py-1 px-2">
                  ${(client.unpaidAmount || 0).toFixed(2)}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-lg py-1 px-2">
                  $0.00
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Activity</h2>
          <div className="space-x-2">
            <Button variant="outline" asChild>
              <Link href={`/invoices/client?clientId=${id}`}>
                View All Invoices
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/quotes/client?clientId=${id}`}>
                View All Quotes
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            Invoice and quote history will appear here
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
