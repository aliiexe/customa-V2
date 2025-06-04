"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Globe,
  Mail,
  Phone,
  MapPin,
  Package,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SupplierDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const response = await fetch(`/api/suppliers/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setSupplier(data);
        } else {
          setError("Failed to load supplier");
        }
      } catch (error) {
        console.error("Error fetching supplier details:", error);
        setError("Error loading supplier");
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        Loading supplier details...
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <p className="text-red-500 mb-4">{error || "Supplier not found"}</p>
        <Button onClick={() => router.push("/suppliers")}>
          Back to Suppliers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{supplier.name}</h1>
        <div className="space-x-4">
          <Button variant="outline" asChild>
            <Link href="/suppliers">Back</Link>
          </Button>
          <Button asChild>
            <Link href={`/suppliers/${params.id}/edit`}>
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
              <span>{supplier.email}</span>
            </div>
            <div className="flex items-center">
              <Phone className="mr-2 h-4 w-4 text-gray-500" />
              <span>{supplier.phoneNumber}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-gray-500" />
              <span>{supplier.address}</span>
            </div>
            {supplier.website && (
              <div className="flex items-center">
                <Globe className="mr-2 h-4 w-4 text-gray-500" />
                <a
                  href={
                    supplier.website.startsWith("http")
                      ? supplier.website
                      : `https://${supplier.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {supplier.website}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supplier Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Package className="mr-2 h-4 w-4 text-gray-500" />
                <span>Products</span>
              </div>
              <Badge variant="secondary">{supplier.productCount || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-gray-500" />
                <span>Purchase Orders</span>
              </div>
              <Badge variant="outline">{supplier.invoiceCount || 0}</Badge>
            </div>
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-medium mb-2">Contact Person</h3>
              <p>{supplier.contactName}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* You could add more sections here, like a list of products from this supplier */}
    </div>
  );
}
