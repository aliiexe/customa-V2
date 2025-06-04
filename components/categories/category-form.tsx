"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
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
        setIsLoading(true);
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
          setIsLoading(false);
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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter category name"
                      disabled={isLoading}
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
                onClick={() => router.push("/categories")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : categoryId
                  ? "Update Category"
                  : "Create Category"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
