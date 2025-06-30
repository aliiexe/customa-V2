"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import SupplierForm from "@/components/suppliers/supplier-form";
import { Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EditSupplierPage() {
  const params = useParams();
  const router = useRouter();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        const response = await fetch(`/api/suppliers/${id}`);
        if (response.ok) {
          const data = await response.json();
          setSupplier(data);
        } else if (response.status === 404) {
          setError("Supplier not found");
        } else {
          setError("Failed to load supplier");
        }
      } catch (error) {
        console.error("Error fetching supplier:", error);
        setError("Error loading supplier");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchSupplier();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-lg text-gray-600">
            Loading supplier details...
          </div>
        </div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Building2 className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-red-500 mb-4 text-lg">
          {error || "Supplier not found"}
        </p>
        <Button onClick={() => router.push("/suppliers")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Suppliers
        </Button>
      </div>
    );
  }

  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  return <SupplierForm supplierId={id} initialData={supplier} />;
}
