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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Shield, Save, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Updated schema with more validation
const roleSchema = z.object({
  roleName: z
    .string()
    .min(2, "Role name must be at least 2 characters")
    .max(50, "Role name must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      "Role name can only contain letters, numbers, spaces, hyphens and underscores"
    ),
  description: z
    .string()
    .max(255, "Description cannot exceed 255 characters")
    .optional(),
});

type RoleFormValues = z.infer<typeof roleSchema>;

export default function RoleForm({ roleId }: { roleId: number | null }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!roleId);
  const [error, setError] = useState<string | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      roleName: "",
      description: "",
    },
  });

  // Load role data if editing
  useEffect(() => {
    if (roleId) {
      const fetchRole = async () => {
        setInitialLoading(true);
        try {
          const response = await fetch(`/api/roles/${roleId}`);
          if (response.ok) {
            const role = await response.json();
            form.reset({
              roleName: role.roleName,
              description: role.description || "",
            });

            // Fetch user count for this role
            try {
              const countResponse = await fetch(
                `/api/roles/${roleId}/users/count`
              );
              if (countResponse.ok) {
                const { count } = await countResponse.json();
                setUserCount(count);
              }
            } catch (error) {
              console.error("Error fetching user count:", error);
            }
          } else {
            setError("Failed to load role data");
          }
        } catch (error) {
          console.error("Error fetching role:", error);
          setError("Failed to load role data");
        } finally {
          setInitialLoading(false);
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

  if (initialLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-sm border-gray-200">
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300 animate-pulse" />
              <div className="text-lg text-gray-600">Loading role data...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Main Form Card */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="bg-primary/5 border-b border-gray-100">
          <CardTitle className="text-primary flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {roleId && userCount !== null && userCount > 0 && (
            <Alert className="mb-6 border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700">
                This role is currently assigned to {userCount} user
                {userCount !== 1 ? "s" : ""}. Changes will affect all users with
                this role.
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="roleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Role Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Administrator, Editor, Viewer"
                        disabled={isLoading}
                        className="h-11 border-gray-300 focus:border-primary focus:ring-primary/20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500">
                      A unique name for this role. Used to identify permissions
                      throughout the system.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the permissions and purpose of this role"
                        disabled={isLoading}
                        className="min-h-[100px] border-gray-300 focus:border-primary focus:ring-primary/20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500">
                      Optional description to help others understand the purpose of
                      this role.
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
                  onClick={() => router.push("/roles")}
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
                      {roleId ? "Update Role" : "Create Role"}
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
            <Shield className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">
                Role Management Tips
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • Use descriptive role names that clearly indicate purpose
                </li>
                <li>• Roles can be assigned to multiple users</li>
                <li>
                  • You cannot delete roles that are currently assigned to users
                </li>
                <li>
                  • Consider creating roles based on job functions or departments
                </li>
                <li>
                  • Use descriptions to document what permissions each role has
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
