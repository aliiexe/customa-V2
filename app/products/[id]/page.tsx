"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Package,
  ArrowLeft,
  Building2,
  Tag,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useCurrency } from "@/lib/currency-provider";

export default function ProductDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          setError("Failed to load product");
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        setError("Error loading product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading product details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Package className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-red-500 mb-4 text-lg">{error || "Product not found"}</p>
        <Button onClick={() => router.push("/products")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>
    );
  }

  const getStockStatusBadge = () => {
    const totalStock = product.stockQuantity + (product.provisionalStock || 0);
    
    if (totalStock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (totalStock <= 5) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>;
    } else if (totalStock <= 10) {
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Low Stock</Badge>;
    } else if (totalStock <= 20) {
      return <Badge variant="secondary">Medium Stock</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800 border-green-200">In Stock</Badge>;
    }
  };

  const calculateProfitMargin = () => {
    if (product.supplierPrice === 0) return 0;
    return ((product.sellingPrice - product.supplierPrice) / product.supplierPrice * 100);
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
              <Link href="/products">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Package className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <div className="ml-auto">{getStockStatusBadge()}</div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Tag className="h-4 w-4" />
                <span className="font-medium">{product.reference}</span>
                <span className="text-gray-400">•</span>
                <span>{product.categoryName || "Uncategorized"}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href={`/products/${params.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Product
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/quotes/client/new">
                <Package className="mr-2 h-4 w-4" />
                Create Quote
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Product Information */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-primary/5 border-b border-gray-100">
              <CardTitle className="text-primary flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Reference</div>
                <div className="text-gray-900 font-mono">{product.reference}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Name</div>
                <div className="text-gray-900">{product.name}</div>
              </div>
              {product.description && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Description</div>
                  <div className="text-gray-900 text-sm">{product.description}</div>
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Category</div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {product.categoryName || "Uncategorized"}
                </Badge>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Supplier</div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{product.supplierName || "Unknown Supplier"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Information */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-primary/5 border-b border-gray-100">
              <CardTitle className="text-primary flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Stock Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Physical Stock</div>
                  <div className="text-2xl font-bold text-gray-900">{product.stockQuantity}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Provisional</div>
                  <div className="text-2xl font-bold text-blue-600">{product.provisionalStock || 0}</div>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="text-sm font-medium text-gray-700 mb-1">Total Available</div>
                <div className="text-3xl font-bold text-primary">
                  {product.stockQuantity + (product.provisionalStock || 0)}
                </div>
              </div>
              <div className="pt-2">
                <div className="text-sm font-medium text-gray-700 mb-2">Stock Status</div>
                {getStockStatusBadge()}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-primary/5 border-b border-gray-100">
              <CardTitle className="text-primary flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Supplier Price</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(Number(product.supplierPrice || 0))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Selling Price</div>
                <div className="text-xl font-bold text-primary">
                  {formatCurrency(Number(product.sellingPrice || 0))}
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="text-sm font-medium text-gray-700 mb-1">Profit Margin</div>
                <div className={`text-lg font-semibold ${calculateProfitMargin() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calculateProfitMargin().toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Profit per Unit</div>
                <div className={`font-medium ${(product.sellingPrice - product.supplierPrice) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(product.sellingPrice - product.supplierPrice)}
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="text-sm font-medium text-gray-700 mb-1">Inventory Value</div>
                <div className="text-lg font-semibold text-gray-900">
                  ${(product.sellingPrice * product.stockQuantity).toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline & Actions */}
          <Card className="shadow-sm border-gray-200 md:col-span-2 lg:col-span-3">
            <CardHeader className="bg-primary/5 border-b border-gray-100">
              <CardTitle className="text-primary flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline & Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Created</div>
                    <div className="text-gray-900">
                      {format(new Date(product.createdAt), "MMMM dd, yyyy 'at' h:mm a")}
                    </div>
                  </div>
                  {product.updatedAt && product.updatedAt !== product.createdAt && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Last Updated</div>
                      <div className="text-gray-900">
                        {format(new Date(product.updatedAt), "MMMM dd, yyyy 'at' h:mm a")}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-3">Quick Actions</div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" asChild className="w-full justify-start">
                      <Link href={`/quotes/client/new?product=${product.id}`}>
                        <Package className="mr-2 h-4 w-4" />
                        Create Quote
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="w-full justify-start">
                      <Link href={`/invoices/client/new?product=${product.id}`}>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Create Invoice
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="w-full justify-start">
                      <Link href={`/products?category=${product.categoryId}`}>
                        <Package className="mr-2 h-4 w-4" />
                        View Similar Products
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
