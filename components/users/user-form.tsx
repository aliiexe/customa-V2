"use client";

import * as React from "react";
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
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

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
  description?: string;
}

export default function UserForm({ userId }: { userId: number | null }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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
        setIsLoading(true);
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
          setIsLoading(false);
        }
      };

      fetchUser();
    }
  }, [userId, form]);

  // Fetch roles for the user
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        console.log("Fetching roles...");
        const response = await fetch("/api/roles");
        console.log("Roles API response status:", response.status);
        if (response.ok) {
          const data = await response.json();
          console.log("Roles data received:", data);
          setRoles(data);
        } else {
          console.error("Failed to fetch roles:", await response.text());
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
    console.log("Form submitted with data:", data);
    console.log("Form validation state:", form.formState.errors);

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

      console.log(`Submitting user data to ${url}:`, submitData);

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const responseData = await response.json();
      console.log("API response:", response.status, responseData);

      if (response.ok) {
        let savedUserId = userId;

        // If creating a new user, get the new ID
        if (!userId) {
          savedUserId = responseData.id;
        }

        // Then save the user's roles
        if (savedUserId) {
          console.log(`Updating roles for user ${savedUserId}:`, userRoles);
          const rolesResponse = await fetch(`/api/users/${savedUserId}/roles`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roleIds: userRoles }),
          });

          const rolesData = await rolesResponse.json();
          console.log(
            "Roles update response:",
            rolesResponse.status,
            rolesData
          );

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

        // Use router.push() and router.refresh() to navigate and refresh the page
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
    // Toggle to a single role or clear if the same is selected
    setUserRoles((prev) => (prev.includes(roleId) ? [] : [roleId]));
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
                name="firstname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="First name"
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
                name="lastname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Last name"
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
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Username"
                        disabled={isLoading || userId !== null} // Cannot change username for existing user
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Email address"
                        type="email"
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Phone number"
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
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="City"
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
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Full address"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fixed Active Status Switch - Simplified structure */}
              <FormField
                control={form.control}
                name="actived"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Status
                        </FormLabel>
                        <FormDescription>
                          Enable or disable user access to the platform
                        </FormDescription>
                      </div>
                      <FormControl>
                        {/* Replace Switch with a checkbox styled to look like a toggle */}
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
                          <span className="ml-3">
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
                    <FormLabel>
                      {userId
                        ? "New Password (leave blank to keep current)"
                        : "Password"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Password"
                        type="password"
                        disabled={isLoading}
                        {...field}
                        // Convert undefined to empty string for the input
                        value={field.value || ""}
                        // Convert empty string back to undefined
                        onChange={(e) =>
                          field.onChange(e.target.value || undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Confirm password"
                        type="password"
                        disabled={isLoading}
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

            {/* User Roles Section */}
            <div className="mt-6">
              <Separator className="my-4" />
              <h3 className="font-medium text-lg mb-4">User Roles</h3>

              {roles.length === 0 ? (
                <div className="text-muted-foreground text-sm">
                  No roles available
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50 cursor-pointer"
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

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/users")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : userId
                  ? "Update User"
                  : "Create User"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
