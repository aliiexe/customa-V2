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
  Building2,
  ArrowLeft,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

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
        } else if (response.status === 404) {
          setError("Supplier not found");
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-lg text-gray-600">Loading supplier details...</div>
        </div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Building2 className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-red-500 mb-4 text-lg">{error || "Supplier not found"}</p>
        <Button onClick={() => router.push("/suppliers")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Suppliers
        </Button>
      </div>
    );
  }

  const getSupplierStatusBadge = () => {
    const hasProducts = supplier.productCount > 0;
    const hasOrders = supplier.invoiceCount > 0;
    const hasUnpaid = supplier.unpaidAmount > 0;

    if (hasUnpaid) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Outstanding
        </Badge>
      );
    } else if (hasProducts && hasOrders) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Active
        </Badge>
      );
    } else if (hasProducts) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Package className="h-3 w-3" />
          Products Only
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          New
        </Badge>
      );
    }
  };

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
              <Link href="/suppliers">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl font-bold text-gray-900">{supplier.name}</h1>
                </div>
                {getSupplierStatusBadge()}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <span className="font-medium">{supplier.contactName}</span>
                <span className="text-gray-400">•</span>
                <span>{supplier.phoneNumber}</span>
                <span className="text-gray-400">•</span>
                <span className="text-sm">Added {format(new Date(supplier.createdAt), "MMM yyyy")}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href={`/suppliers/${params.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Supplier
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/products?supplier=${supplier.id}`}>
                <Package className="mr-2 h-4 w-4" />
                View Products ({supplier.productCount})
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/invoices/supplier?supplierId=${supplier.id}`}>
                <FileText className="mr-2 h-4 w-4" />
                View Orders ({supplier.invoiceCount})
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/invoices/supplier/new?supplierId=${supplier.id}`}>
                <Plus className="mr-2 h-4 w-4" />
                New Purchase Order
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Contact Information */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-primary/5 border-b border-gray-100">
              <CardTitle className="text-primary flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-gray-400 mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 break-all">{supplier.email}</div>
                  <div className="text-sm text-gray-500">Email Address</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900">{supplier.phoneNumber}</div>
                  <div className="text-sm text-gray-500">Phone Number</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <div className="font-medium text-gray-900 leading-relaxed">{supplier.address}</div>
                  <div className="text-sm text-gray-500">Business Address</div>
                </div>
              </div>
              
              {supplier.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <a
                      href={
                        supplier.website.startsWith("http")
                          ? supplier.website
                          : `https://${supplier.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:text-blue-500 hover:underline flex items-center gap-1 break-all"
                    >
                      {supplier.website}
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                    <div className="text-sm text-gray-500">Website</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Business Summary */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-primary/5 border-b border-gray-100">
              <CardTitle className="text-primary flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Business Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Products</span>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-base px-3 py-1">
                  {supplier.productCount || 0}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Purchase Orders</span>
                </div>
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 text-base px-3 py-1">
                  {supplier.invoiceCount || 0}
                </Badge>
              </div>
              
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    Total Spent
                  </span>
                  <span className="font-bold text-xl text-green-600">
                    {formatCurrency(Number(supplier.totalSpent || 0))}
                  </span>
                </div>
                
                {Number(supplier.unpaidAmount || 0) > 0 && (
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="text-sm font-medium text-red-700 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Outstanding
                    </span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(Number(supplier.unpaidAmount || 0))}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timeline & Actions */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-primary/5 border-b border-gray-100">
              <CardTitle className="text-primary flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline & Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Supplier Added</div>
                    <div className="text-sm text-gray-600">
                      {format(new Date(supplier.createdAt), "MMMM dd, yyyy 'at' h:mm a")}
                    </div>
                  </div>
                </div>
                
                {supplier.lastOrderDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Last Purchase Order</div>
                      <div className="text-sm text-gray-600">
                        {format(new Date(supplier.lastOrderDate), "MMMM dd, yyyy 'at' h:mm a")}
                      </div>
                    </div>
                  </div>
                )}
                
                {supplier.updatedAt && supplier.updatedAt !== supplier.createdAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Last Updated</div>
                      <div className="text-sm text-gray-600">
                        {format(new Date(supplier.updatedAt), "MMMM dd, yyyy 'at' h:mm a")}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t space-y-2">
                <div className="text-sm font-medium text-gray-700 mb-3">Quick Actions</div>
                
                <Button variant="outline" size="sm" asChild className="w-full justify-start">
                  <Link href={`/products/new?supplier=${supplier.id}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Link>
                </Button>
                
                <Button variant="outline" size="sm" asChild className="w-full justify-start">
                  <Link href={`/invoices/supplier/new?supplierId=${supplier.id}`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Create Purchase Order
                  </Link>
                </Button>
                
                <Button variant="outline" size="sm" asChild className="w-full justify-start">
                  <Link href={`/suppliers/${supplier.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Insights */}
        {(supplier.productCount > 0 || supplier.invoiceCount > 0) && (
          <Card className="mt-6 shadow-sm border-gray-200">
            <CardHeader className="bg-primary/5 border-b border-gray-100">
              <CardTitle className="text-primary flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Supplier Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Average Order Value</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${supplier.invoiceCount > 0 
                      ? (Number(supplier.totalSpent) / Number(supplier.invoiceCount)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : '0.00'
                    }
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Products per Order</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {supplier.invoiceCount > 0 
                      ? Math.round((Number(supplier.productCount) / Number(supplier.invoiceCount)) * 10) / 10
                      : '0'
                    }
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Payment Status</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Number(supplier.unpaidAmount) > 0 
                      ? `${Math.round((Number(supplier.totalSpent) / (Number(supplier.totalSpent) + Number(supplier.unpaidAmount))) * 100)}%`
                      : '100%'
                    }
                  </div>
                  <div className="text-xs text-gray-500">Paid</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Relationship</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(() => {
                      const daysSinceAdded = Math.floor((Date.now() - new Date(supplier.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                      if (daysSinceAdded < 30) return `${daysSinceAdded}d`;
                      if (daysSinceAdded < 365) return `${Math.floor(daysSinceAdded / 30)}mo`;
                      return `${Math.floor(daysSinceAdded / 365)}y`;
                    })()}
                  </div>
                  <div className="text-xs text-gray-500">Duration</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
