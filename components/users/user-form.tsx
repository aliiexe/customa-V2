"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Key,
  Shield,
  AlertCircle,
  Save,
  X,
} from "lucide-react";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .optional()
  .refine((val) => val === undefined || val.length >= 8, {
    message: "Password must be at least 8 characters",
  });

const userFormSchema = z
  .object({
    firstname: z.string().min(2, "First name must be at least 2 characters"),
    lastname: z.string().min(2, "Last name must be at least 2 characters"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Must be a valid email address"),
    phone: z.string().min(6, "Phone number must be at least 6 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().min(2, "City must be at least 2 characters"),
    actived: z.boolean().default(true),
    balance: z.number().default(0),
    password: passwordSchema,
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // If password is provided, confirmPassword must match
      if (data.password) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

type UserFormValues = z.infer<typeof userFormSchema>;

interface Role {
  id: number;
  roleName: string;
}

export default function UserForm({ userId }: { userId: number | null }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!userId);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<number[]>([]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      username: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      actived: true,
      balance: 0,
      password: undefined,
      confirmPassword: undefined,
    },
  });

  // Load user data if editing
  useEffect(() => {
    if (userId) {
      const fetchUser = async () => {
        setInitialLoading(true);
        try {
          const response = await fetch(`/api/users/${userId}`);
          if (response.ok) {
            const user = await response.json();

            form.reset({
              firstname: user.firstname,
              lastname: user.lastname,
              username: user.username,
              email: user.email,
              phone: user.phone,
              address: user.address,
              city: user.city,
              actived: user.actived,
              balance: user.balance,
              password: undefined, // Don't populate password
              confirmPassword: undefined,
            });
          } else {
            setError("Failed to load user data");
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          setError("Failed to load user data");
        } finally {
          setInitialLoading(false);
        }
      };

      fetchUser();
    }
  }, [userId, form]);

  // Fetch roles for the user
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch("/api/roles");
        if (response.ok) {
          const data = await response.json();
          setRoles(data);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchRoles();

    // If editing, fetch user's roles
    if (userId) {
      const fetchUserRoles = async () => {
        try {
          const response = await fetch(`/api/users/${userId}/roles`);
          if (response.ok) {
            const data = await response.json();
            setUserRoles(data.map((role: Role) => role.id));
          }
        } catch (error) {
          console.error("Error fetching user roles:", error);
        }
      };

      fetchUserRoles();
    }
  }, [userId]);

  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true);
    setError(null);

    // Remove confirmPassword before sending to API
    const { confirmPassword, ...submitData } = data;

    // If not updating password, remove the password field
    if (!submitData.password) {
      delete submitData.password;
    }

    try {
      const url = userId ? `/api/users/${userId}` : "/api/users";
      const method = userId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const responseData = await response.json();

      if (response.ok) {
        let savedUserId = userId;

        // If creating a new user, get the new ID
        if (!userId) {
          savedUserId = responseData.id;
        }

        // Then save the user's roles
        if (savedUserId) {
          const rolesResponse = await fetch(`/api/users/${savedUserId}/roles`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roleIds: userRoles }),
          });

          const rolesData = await rolesResponse.json();

          if (!rolesResponse.ok) {
            setError(
              `User saved but roles could not be updated: ${
                rolesData.error || "Unknown error"
              }`
            );
            setIsLoading(false);
            return;
          }
        }

        router.push("/users");
        router.refresh();
      } else {
        setError(responseData.error || "Failed to save user");
      }
    } catch (error) {
      console.error("Error saving user:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Add role toggle function
  const toggleRole = (roleId: number) => {
    setUserRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="shadow-sm border-gray-200">
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-300 animate-pulse" />
              <div className="text-lg text-gray-600">Loading user data...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Form Card */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="bg-primary/5 border-b border-gray-100">
          <CardTitle className="text-primary flex items-center gap-2">
            <User className="h-5 w-5" />
            User Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          First Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="First name"
                            disabled={isLoading}
                            className="h-11 border-gray-300 focus:border-primary focus:ring-primary/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          Last Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Last name"
                            disabled={isLoading}
                            className="h-11 border-gray-300 focus:border-primary focus:ring-primary/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          Username *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Username"
                            disabled={isLoading || userId !== null}
                            className="h-11 border-gray-300 focus:border-primary focus:ring-primary/20"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          {userId
                            ? "Username cannot be changed after creation"
                            : "Choose a unique username"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          Email Address *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Email address"
                            type="email"
                            disabled={isLoading}
                            className="h-11 border-gray-300 focus:border-primary focus:ring-primary/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          Phone Number *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Phone number"
                            disabled={isLoading}
                            className="h-11 border-gray-300 focus:border-primary focus:ring-primary/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          City *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="City"
                            disabled={isLoading}
                            className="h-11 border-gray-300 focus:border-primary focus:ring-primary/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Full Address *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Full address"
                            disabled={isLoading}
                            className="h-11 border-gray-300 focus:border-primary focus:ring-primary/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Account Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  Account Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Active Status Toggle */}
                  <FormField
                    control={form.control}
                    name="actived"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <div className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium text-gray-900">
                              Account Status
                            </FormLabel>
                            <FormDescription>
                              Enable or disable user access to the platform
                            </FormDescription>
                          </div>
                          <FormControl>
                            <div className="flex items-center">
                              <label
                                className={`relative inline-block w-12 h-6 rounded-full transition-colors cursor-pointer ${
                                  field.value ? "bg-primary" : "bg-gray-300"
                                }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  field.onChange(!field.value);
                                }}
                              >
                                <span
                                  className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                                    field.value ? "translate-x-6" : "translate-x-0"
                                  }`}
                                />
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={field.value}
                                  onChange={() => {}}
                                  disabled={isLoading}
                                />
                              </label>
                              <span className="ml-3 font-medium text-gray-700">
                                {field.value ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          {userId
                            ? "New Password (leave blank to keep current)"
                            : "Password *"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Password"
                            type="password"
                            disabled={isLoading}
                            className="h-11 border-gray-300 focus:border-primary focus:ring-primary/20"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || undefined)
                            }
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          Password must be at least 8 characters long
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Confirm password"
                            type="password"
                            disabled={isLoading}
                            className="h-11 border-gray-300 focus:border-primary focus:ring-primary/20"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || undefined)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* User Roles Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  User Roles & Permissions
                </h3>

                {roles.length === 0 ? (
                  <div className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
                    No roles available. Create roles first to assign them to users.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center space-x-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50/50 cursor-pointer transition-colors"
                        onClick={() => toggleRole(role.id)}
                      >
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={userRoles.includes(role.id)}
                          onCheckedChange={() => toggleRole(role.id)}
                        />
                        <label
                          htmlFor={`role-${role.id}`}
                          className="text-sm font-medium leading-none cursor-pointer flex-grow"
                        >
                          {role.roleName}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/users")}
                  disabled={isLoading}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px]"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="mr-2 h-4 w-4" />
                      {userId ? "Update User" : "Create User"}
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
            <User className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">
                User Management Tips
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Assign appropriate roles to control user permissions</li>
                <li>• Use strong passwords (minimum 8 characters)</li>
                <li>• Deactivate users instead of deleting to preserve data integrity</li>
                <li>• Regularly review user roles and permissions</li>
                <li>• Username cannot be changed once the account is created</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
