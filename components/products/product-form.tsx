"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Product } from "@/types/models";

// Mock product data
const mockProduct: Product = {
  id: 1,
  name: "Laptop Pro",
  reference: "LP-2023-001",
  supplierPrice: 800,
  sellingPrice: 1200,
  stockQuantity: 24,
  description: "High-performance laptop for professionals",
  supplierId: 1,
  categoryId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  supplierName: "TechSupplier Inc.",
  categoryName: "Electronics",
};

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  reference: z.string().min(3, "Reference must be at least 3 characters"),
  supplierPrice: z.coerce.number().min(0, "Price cannot be negative"),
  sellingPrice: z.coerce.number().min(0, "Price cannot be negative"),
  stockQuantity: z.coerce.number().int().min(0, "Stock cannot be negative"),
  description: z.string().optional(),
  supplierId: z.string().min(1, "Please select a supplier"),
  categoryId: z.string().min(1, "Please select a category"),
});

type ProductFormValues = z.infer<typeof formSchema>;

export default function ProductForm({
  productId,
}: {
  productId: number | null;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with default values
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      reference: "",
      supplierPrice: 0,
      sellingPrice: 0,
      stockQuantity: 0,
      description: "",
      supplierId: "",
      categoryId: "",
    },
  });

  // Load categories and suppliers
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch("/api/categories");
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }

        // Fetch suppliers
        const suppliersResponse = await fetch("/api/suppliers");
        if (suppliersResponse.ok) {
          const suppliersData = await suppliersResponse.json();
          setSuppliers(suppliersData);
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
        setError("Failed to load form data");
      }
    };

    fetchData();
  }, []);

  // Load product data if editing
  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        setIsLoading(true);
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
          setIsLoading(false);
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
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product reference" {...field} />
                    </FormControl>
                    <FormDescription>
                      Unique identifier for this product
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isLoading}
                        {...field}
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
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
                    <FormLabel>Supplier</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isLoading}
                        {...field}
                      >
                        <option value="">Select a supplier</option>
                        {suppliers.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplierPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sellingPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stockQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter product description"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/products")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : productId
                  ? "Update Product"
                  : "Create Product"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
