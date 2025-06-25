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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Package, 
  DollarSign, 
  Building2, 
  Tag, 
  AlertCircle,
  TrendingUp,
  Warehouse,
  Save,
  X,
  Plus,
  Info
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name must be less than 100 characters"),
  reference: z
    .string()
    .min(3, "Reference must be at least 3 characters")
    .max(50, "Reference must be less than 50 characters")
    .regex(/^[A-Z0-9\-_]+$/i, "Reference can only contain letters, numbers, hyphens, and underscores"),
  supplierPrice: z.coerce
    .number()
    .min(0, "Supplier price cannot be negative")
    .max(999999.99, "Price is too large"),
  sellingPrice: z.coerce
    .number()
    .min(0, "Selling price cannot be negative")
    .max(999999.99, "Price is too large"),
  stockQuantity: z.coerce
    .number()
    .int()
    .min(0, "Stock quantity cannot be negative")
    .max(999999, "Stock quantity is too large"),
  provisionalStock: z.coerce
    .number()
    .int()
    .min(0, "Provisional stock cannot be negative")
    .max(999999, "Provisional stock is too large")
    .default(0),
  reorderLevel: z.coerce
    .number()
    .int()
    .min(0, "Reorder level cannot be negative")
    .max(999999, "Reorder level is too large")
    .default(5),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  supplierId: z.string().min(1, "Please select a supplier"),
  categoryId: z.string().min(1, "Please select a category"),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface Category {
  id: string;
  name: string;
  productCount?: number;
}

interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  productCount?: number;
}

export default function ProductForm({
  productId,
}: {
  productId: number | null;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!productId);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [referenceAvailable, setReferenceAvailable] = useState<boolean | null>(null);
  const [checkingReference, setCheckingReference] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      reference: "",
      supplierPrice: 0,
      sellingPrice: 0,
      stockQuantity: 0,
      provisionalStock: 0,
      reorderLevel: 5,
      description: "",
      supplierId: "",
      categoryId: "",
    },
  });

  // Watch values for calculations
  const watchSupplierPrice = form.watch("supplierPrice");
  const watchSellingPrice = form.watch("sellingPrice");
  const watchReference = form.watch("reference");
  const watchStockQuantity = form.watch("stockQuantity");
  const watchProvisionalStock = form.watch("provisionalStock");
  const watchReorderLevel = form.watch("reorderLevel");

  // Calculate profit margin
  const profitMargin = watchSupplierPrice > 0 
    ? ((watchSellingPrice - watchSupplierPrice) / watchSupplierPrice * 100).toFixed(1)
    : "0";

  const profitAmount = watchSellingPrice - watchSupplierPrice;
  const totalStock = watchStockQuantity + watchProvisionalStock;

  // Check if stock is low
  const isLowStock = totalStock <= watchReorderLevel && totalStock > 0;
  const isOutOfStock = totalStock === 0;

  // Load categories and suppliers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, suppliersResponse] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/suppliers")
        ]);

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }

        if (suppliersResponse.ok) {
          const suppliersData = await suppliersResponse.json();
          setSuppliers(suppliersData);
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
        setError("Failed to load form data. Please refresh the page.");
      }
    };

    fetchData();
  }, []);

  // Check reference availability
  useEffect(() => {
    const checkReference = async () => {
      if (!watchReference || watchReference.length < 3) {
        setReferenceAvailable(null);
        return;
      }

      setCheckingReference(true);
      try {
        const params = new URLSearchParams();
        params.append("reference", watchReference);
        if (productId) params.append("excludeId", productId.toString());

        const response = await fetch(`/api/products/check-reference?${params}`);
        const data = await response.json();
        setReferenceAvailable(data.available);
      } catch (error) {
        console.error("Error checking reference:", error);
        setReferenceAvailable(null);
      } finally {
        setCheckingReference(false);
      }
    };

    const timeoutId = setTimeout(checkReference, 500);
    return () => clearTimeout(timeoutId);
  }, [watchReference, productId]);

  // Load product data if editing
  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        setInitialLoading(true);
        try {
          const response = await fetch(`/api/products/${productId}`);
          if (response.ok) {
            const product = await response.json();

            form.reset({
              name: product.name,
              reference: product.reference,
              supplierPrice: product.supplierPrice,
              sellingPrice: product.sellingPrice,
              stockQuantity: product.stockQuantity,
              provisionalStock: product.provisionalStock ?? 0,
              reorderLevel: product.reorderLevel ?? 5,
              description: product.description || "",
              supplierId: product.supplierId.toString(),
              categoryId: product.categoryId.toString(),
            });
          } else {
            setError("Failed to load product data");
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          setError("Failed to load product data");
        } finally {
          setInitialLoading(false);
        }
      };

      fetchProduct();
    }
  }, [productId, form]);

  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = productId ? `/api/products/${productId}` : "/api/products";
      const method = productId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/products");
        router.refresh();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-lg text-gray-600">Loading product details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="bg-primary/5 border-b border-gray-100">
          <CardTitle className="text-primary flex items-center gap-2">
            <Package className="h-5 w-5" />
            {productId ? "Edit Product" : "Create New Product"}
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            {productId 
              ? "Update product information and inventory details"
              : "Add a new product to your inventory with all necessary details"
            }
          </p>
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                        <Package className="h-4 w-4 text-gray-500" />
                        Product Name *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter product name" 
                          className="h-10 border-gray-300 focus:border-primary"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500">
                        Choose a clear, descriptive name for your product
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                        <Tag className="h-4 w-4 text-gray-500" />
                        Product Reference *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="e.g., PRD-001, SKU-ABC123" 
                            className="h-10 border-gray-300 focus:border-primary pr-10"
                            {...field} 
                          />
                          {checkingReference && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                          {!checkingReference && referenceAvailable !== null && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              {referenceAvailable ? (
                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                </div>
                              ) : (
                                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                  <X className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription className="text-gray-500">
                        Unique identifier (letters, numbers, hyphens, underscores only)
                      </FormDescription>
                      {!checkingReference && referenceAvailable === false && (
                        <div className="text-red-600 text-sm">
                          This reference is already in use
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                        <Tag className="h-4 w-4 text-gray-500" />
                        Category *
                      </FormLabel>
                      <FormControl>
                        <Select
                          disabled={isLoading}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="h-10 border-gray-300 focus:border-primary">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{category.name}</span>
                                  {category.productCount !== undefined && (
                                    <Badge variant="secondary" className="ml-2">
                                      {category.productCount}
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        Supplier *
                      </FormLabel>
                      <FormControl>
                        <Select
                          disabled={isLoading}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="h-10 border-gray-300 focus:border-primary">
                            <SelectValue placeholder="Select a supplier" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{supplier.name}</span>
                                  {supplier.contactName && (
                                    <span className="text-xs text-gray-500">{supplier.contactName}</span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter detailed product description..."
                        className="min-h-[100px] border-gray-300 focus:border-primary resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500">
                      Provide detailed information about the product (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Pricing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="supplierPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        Supplier Price *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="h-10 border-gray-300 focus:border-primary pl-8"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-gray-500">
                        Cost price from your supplier
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sellingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        Selling Price *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="h-10 border-gray-300 focus:border-primary pl-8"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-gray-500">
                        Price you sell to customers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Profit Margin Display */}
              {watchSupplierPrice > 0 && watchSellingPrice > 0 && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Profit Margin</span>
                    </div>
                    <div className="text-2xl font-bold text-green-700">{profitMargin}%</div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">Profit Amount</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">${profitAmount.toFixed(2)}</div>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">Markup</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-700">
                      {watchSupplierPrice > 0 ? (watchSellingPrice / watchSupplierPrice).toFixed(2) : "0.00"}x
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inventory Information */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Warehouse className="h-5 w-5 text-primary" />
                Inventory Management
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="stockQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                        <Package className="h-4 w-4 text-gray-500" />
                        Current Stock *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          placeholder="0" 
                          className="h-10 border-gray-300 focus:border-primary"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500">
                        Current available stock
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="provisionalStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                        <Package className="h-4 w-4 text-gray-500" />
                        Provisional Stock
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          placeholder="0" 
                          className="h-10 border-gray-300 focus:border-primary"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500">
                        Stock on order/reserved
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reorderLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                        <AlertCircle className="h-4 w-4 text-gray-500" />
                        Reorder Level *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          placeholder="5" 
                          className="h-10 border-gray-300 focus:border-primary"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500">
                        Alert when stock falls below this level
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Stock Status Display */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Warehouse className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Total Available Stock</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-700">{totalStock} units</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Current: {watchStockQuantity} + Provisional: {watchProvisionalStock}
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Stock Status</span>
                  </div>
                  {isOutOfStock ? (
                    <Badge variant="destructive" className="text-sm">Out of Stock</Badge>
                  ) : isLowStock ? (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-sm">Low Stock Alert</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-sm">Good Stock Level</Badge>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    Reorder level: {watchReorderLevel} units
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="shadow-sm border-gray-200">
            <CardContent className="pt-6">
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/products")}
                  disabled={isLoading}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || (referenceAvailable === false)}
                  className="bg-primary hover:bg-primary/90 min-w-[140px]"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {productId ? "Update Product" : "Create Product"}
                    </>
                  )}
                </Button>
              </div>

              {/* Form Guidelines */}
              <Separator className="my-6" />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Product Guidelines</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Use clear, descriptive product names for easy identification</li>
                      <li>• Product references must be unique across your inventory</li>
                      <li>• Set appropriate reorder levels to avoid stockouts</li>
                      <li>• Review profit margins to ensure healthy business growth</li>
                      <li>• Keep descriptions detailed for better product management</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
