"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package, Save, X, AlertCircle } from "lucide-react";
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

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9\s\-_&]+$/,
      "Category name contains invalid characters"
    ),
});

type CategoryFormValues = z.infer<typeof formSchema>;

export default function CategoryForm({
  categoryId,
}: {
  categoryId: number | null;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(!!categoryId);

  // Initialize form with default value
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  // Load category data if editing
  useEffect(() => {
    if (categoryId) {
      const fetchCategory = async () => {
        setInitialLoading(true);
        try {
          const response = await fetch(`/api/categories/${categoryId}`);
          if (response.ok) {
            const category = await response.json();
            form.reset({ name: category.name });
          } else {
            setError("Failed to load category data");
          }
        } catch (error) {
          console.error("Error fetching category:", error);
          setError("Failed to load category data");
        } finally {
          setInitialLoading(false);
        }
      };

      fetchCategory();
    }
  }, [categoryId, form]);

  const onSubmit = async (data: CategoryFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = categoryId
        ? `/api/categories/${categoryId}`
        : "/api/categories";

      const method = categoryId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/categories");
        router.refresh();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to save category");
      }
    } catch (error) {
      console.error("Error saving category:", error);
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
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300 animate-pulse" />
              <div className="text-lg text-gray-600">Loading category...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Form Card */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="bg-primary/5 border-b border-gray-100">
          <CardTitle className="text-primary flex items-center gap-2">
            <Package className="h-5 w-5" />
            Category Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Category Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Electronics, Office Supplies, Furniture"
                        disabled={isLoading}
                        className="h-11 border-gray-300 focus:border-primary focus:ring-primary/20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500">
                      Choose a clear, descriptive name for this product category.
                      Use letters, numbers, spaces, hyphens, underscores, and
                      ampersands only.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/categories")}
                  disabled={isLoading}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="mr-2 h-4 w-4" />
                      {categoryId ? "Update Category" : "Create Category"}
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
            <Package className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">
                Category Management Tips
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Keep category names clear and descriptive</li>
                <li>• Categories help organize products for easier management</li>
                <li>• You can only delete empty categories (no products assigned)</li>
                <li>• Categories are used in reports and filtering throughout the system</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
