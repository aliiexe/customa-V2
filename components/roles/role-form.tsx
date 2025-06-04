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

// Update the schema to include description
const roleSchema = z.object({
  roleName: z.string().min(2, "Role name must be at least 2 characters"),
  description: z.string().optional(),
});

type RoleFormValues = z.infer<typeof roleSchema>;

export default function RoleForm({ roleId }: { roleId: number | null }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Make sure the form includes the description field in the defaultValues:
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      roleName: "",
      description: "", // Add this line
    },
  });

  // Load role data if editing
  useEffect(() => {
    if (roleId) {
      const fetchRole = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/roles/${roleId}`);
          if (response.ok) {
            const role = await response.json();
            form.reset({
              roleName: role.roleName,
              description: role.description || "",
            });
          } else {
            setError("Failed to load role data");
          }
        } catch (error) {
          console.error("Error fetching role:", error);
          setError("Failed to load role data");
        } finally {
          setIsLoading(false);
        }
      };

      fetchRole();
    }
  }, [roleId, form]);

  const onSubmit = async (data: RoleFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = roleId ? `/api/roles/${roleId}` : "/api/roles";

      const method = roleId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/roles");
        router.refresh();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to save role");
      }
    } catch (error) {
      console.error("Error saving role:", error);
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
              name="roleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter role name"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter role description"
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
                onClick={() => router.push("/roles")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : roleId
                  ? "Update Role"
                  : "Create Role"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
