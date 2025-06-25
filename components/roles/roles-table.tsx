"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Edit,
  Trash2,
  Shield,
  RotateCcw,
  Search,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

interface Role {
  id: number;
  roleName: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  userCount?: number;
}

export default function RolesTable() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState("roleName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [usageFilter, setUsageFilter] = useState("all");

  useEffect(() => {
    fetchRolesWithUserCounts();
  }, []);

  useEffect(() => {
    filterRoles();
  }, [roles, searchTerm, usageFilter]);

  const fetchRolesWithUserCounts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/roles");
      if (response.ok) {
        const data = await response.json();

        // Fetch user counts for each role
        const rolesWithCounts = await Promise.all(
          data.map(async (role: Role) => {
            try {
              const countResponse = await fetch(
                `/api/roles/${role.id}/users/count`
              );
              if (countResponse.ok) {
                const { count } = await countResponse.json();
                role.userCount = count;
              } else {
                role.userCount = 0;
              }
            } catch (error) {
              console.error(
                `Error fetching user count for role ${role.id}:`,
                error
              );
              role.userCount = 0;
            }
            return role;
          })
        );

        setRoles(rolesWithCounts);
      } else {
        setError("Failed to load roles");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      setError("Error loading roles");
    } finally {
      setLoading(false);
    }
  };

  const filterRoles = () => {
    let filtered = [...roles];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (role) =>
          role.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (role.description &&
            role.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Usage filter
    if (usageFilter !== "all") {
      if (usageFilter === "assigned") {
        filtered = filtered.filter((role) => role.userCount && role.userCount > 0);
      } else if (usageFilter === "unassigned") {
        filtered = filtered.filter(
          (role) => !role.userCount || role.userCount === 0
        );
      }
    }

    setFilteredRoles(filtered);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedRoles = [...filteredRoles].sort((a: any, b: any) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (typeof aValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
  });

  const handleDelete = async () => {
    if (!roleToDelete) return;

    try {
      const response = await fetch(`/api/roles/${roleToDelete}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setRoles(roles.filter((role) => role.id !== roleToDelete));
      } else {
        alert(data.error || "Failed to delete role");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      alert("An error occurred while deleting the role");
    } finally {
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  const openDeleteDialog = (id: number) => {
    const role = roles.find((r) => r.id === id);
    if (role && role.userCount && role.userCount > 0) {
      alert(
        `This role is assigned to ${role.userCount} user${
          role.userCount > 1 ? "s" : ""
        } and cannot be deleted. Remove all users from this role first.`
      );
      return;
    }

    setRoleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setUsageFilter("all");
  };

  const hasActiveFilters = searchTerm || usageFilter !== "all";

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading roles...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <div className="text-lg font-medium">{error}</div>
            <Button
              onClick={fetchRolesWithUserCounts}
              variant="outline"
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="mr-2 h-5 w-5 text-primary" />
            User Roles ({roles.length})
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Define and manage user roles and permissions in the system
          </p>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Label
                htmlFor="search"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Search Roles
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by role name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 border-gray-300 focus:border-primary focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex flex-col justify-between">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                User Assignment
              </Label>
              <div className="flex">
                <Select value={usageFilter} onValueChange={setUsageFilter}>
                  <SelectTrigger className="h-10 border-gray-300 focus:border-primary flex-1">
                    <SelectValue placeholder="Filter by usage" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="assigned">Assigned to Users</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  disabled={!hasActiveFilters}
                  className="h-10 ml-2 border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="sr-only">Reset</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Active filters:
                </span>
                {searchTerm && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    Search: {searchTerm}
                  </span>
                )}
                {usageFilter !== "all" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    Status:{" "}
                    {usageFilter === "assigned"
                      ? "Assigned"
                      : "Unassigned"}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead
                  className="cursor-pointer text-primary font-semibold hover:text-primary/80 transition-colors"
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center gap-2">
                    ID
                    {sortColumn === "id" && (
                      <span className="text-xs">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-primary font-semibold hover:text-primary/80 transition-colors"
                  onClick={() => handleSort("roleName")}
                >
                  <div className="flex items-center gap-2">
                    Role Name
                    {sortColumn === "roleName" && (
                      <span className="text-xs">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-primary font-semibold">
                  Description
                </TableHead>
                <TableHead
                  className="cursor-pointer text-primary font-semibold hover:text-primary/80 transition-colors text-right"
                  onClick={() => handleSort("userCount")}
                >
                  <div className="flex items-center justify-end gap-2">
                    Users
                    {sortColumn === "userCount" && (
                      <span className="text-xs">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-primary font-semibold hover:text-primary/80 transition-colors"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center gap-2">
                    Created
                    {sortColumn === "createdAt" && (
                      <span className="text-xs">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-center text-primary font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Shield className="h-12 w-12 mb-4 text-gray-300" />
                      <div className="text-lg font-medium text-gray-900 mb-2">
                        {hasActiveFilters
                          ? "No roles match your filters"
                          : "No roles found"}
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        {hasActiveFilters
                          ? "Try adjusting your search or filter criteria"
                          : "Create your first role to get started"}
                      </div>
                      {!hasActiveFilters && (
                        <Button
                          asChild
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Link href="/roles/new">
                            <Shield className="mr-2 h-4 w-4" />
                            Create Role
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedRoles.map((role) => (
                  <TableRow
                    key={role.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-600 w-14">
                      {role.id}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <div className="font-semibold">{role.roleName}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 max-w-xs truncate">
                      {role.description || (
                        <span className="text-gray-400 italic">
                          No description
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          role.userCount && role.userCount > 0
                            ? "default"
                            : "secondary"
                        }
                        className={
                          role.userCount && role.userCount > 0
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-gray-100 text-gray-600"
                        }
                      >
                        <Users className="h-3 w-3 mr-1" />
                        {role.userCount || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {format(new Date(role.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                          className="border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-colors"
                        >
                          <Link href={`/roles/${role.id}/edit`}>
                            <Edit className="h-4 w-4 text-gray-600" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteDialog(role.id)}
                          disabled={!!(role.userCount && role.userCount > 0)}
                          className={`border-gray-300 transition-colors ${
                            role.userCount && role.userCount > 0
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        {roles.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                Showing {filteredRoles.length} of {roles.length} roles
              </div>
              <div>
                {roles.filter((r) => r.userCount && r.userCount > 0).length} roles
                assigned to users
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete Role
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this role? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
