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
import { Edit, Trash2, User, Filter, RotateCcw, Search } from "lucide-react";
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
}

interface User {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  actived: boolean | number;
  createdAt: string;
  updatedAt: string;
  roles?: Role[];
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState("username");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

  useEffect(() => {
    fetchUsersWithRoles();
    fetchCurrentUser();
    fetchRoles();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter, roleFilter]);

  const fetchUsersWithRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();

        // Fetch roles for each user
        const usersWithRoles = await Promise.all(
          data.map(async (user: User) => {
            try {
              const rolesResponse = await fetch(`/api/users/${user.id}/roles`);
              if (rolesResponse.ok) {
                user.roles = await rolesResponse.json();
              }
            } catch (error) {
              console.error(`Error fetching roles for user ${user.id}:`, error);
            }
            return user;
          })
        );

        setUsers(usersWithRoles);
      } else {
        setError("Failed to load users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      // This is a placeholder - implement based on your auth system
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const data = await response.json();
        setCurrentUserId(data.userId);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/roles");
      if (response.ok) {
        const data = await response.json();
        setAvailableRoles(data);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        filtered = filtered.filter((user) => user.actived);
      } else if (statusFilter === "inactive") {
        filtered = filtered.filter((user) => !user.actived);
      }
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) =>
        user.roles?.some((role) => role.id.toString() === roleFilter)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedUsers = [...filteredUsers].sort((a: any, b: any) => {
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
    if (!userToDelete) return;

    try {
      const response = await fetch(`/api/users/${userToDelete}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(users.filter((user) => user.id !== userToDelete));
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("An error occurred while deleting the user");
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const openDeleteDialog = (id: number) => {
    if (id === currentUserId) {
      alert("You cannot delete your own account");
      return;
    }
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setRoleFilter("all");
  };

  const hasActiveFilters =
    searchTerm || statusFilter !== "all" || roleFilter !== "all";

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading users...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <div className="text-lg font-medium">{error}</div>
            <Button
              onClick={fetchUsersWithRoles}
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
            <User className="mr-2 h-5 w-5 text-primary" />
            System Users ({users.length})
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage user accounts and their access permissions
          </p>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label
                htmlFor="search"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Search Users
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, username, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 border-gray-300 focus:border-primary focus:ring-primary/20"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Status
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 border-gray-300 focus:border-primary">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active Users</SelectItem>
                  <SelectItem value="inactive">Inactive Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Role
              </Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-10 border-gray-300 focus:border-primary">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Roles</SelectItem>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.roleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={resetFilters}
                variant="outline"
                disabled={!hasActiveFilters}
                className="h-10 border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
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
                {statusFilter !== "all" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    Status: {statusFilter === "active" ? "Active" : "Inactive"}
                  </span>
                )}
                {roleFilter !== "all" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    Role:{" "}
                    {
                      availableRoles.find(
                        (r) => r.id.toString() === roleFilter
                      )?.roleName
                    }
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
                  onClick={() => handleSort("username")}
                >
                  <div className="flex items-center gap-2">
                    Username
                    {sortColumn === "username" && (
                      <span className="text-xs">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-primary font-semibold hover:text-primary/80 transition-colors"
                  onClick={() => handleSort("firstname")}
                >
                  <div className="flex items-center gap-2">
                    First Name
                    {sortColumn === "firstname" && (
                      <span className="text-xs">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-primary font-semibold hover:text-primary/80 transition-colors"
                  onClick={() => handleSort("lastname")}
                >
                  <div className="flex items-center gap-2">
                    Last Name
                    {sortColumn === "lastname" && (
                      <span className="text-xs">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-primary font-semibold">
                  Email
                </TableHead>
                <TableHead className="text-primary font-semibold">
                  Roles
                </TableHead>
                <TableHead
                  className="cursor-pointer text-primary font-semibold hover:text-primary/80 transition-colors"
                  onClick={() => handleSort("actived")}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {sortColumn === "actived" && (
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
              {sortedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <User className="h-12 w-12 mb-4 text-gray-300" />
                      <div className="text-lg font-medium text-gray-900 mb-2">
                        {hasActiveFilters
                          ? "No users match your filters"
                          : "No users found"}
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        {hasActiveFilters
                          ? "Try adjusting your search or filter criteria"
                          : "Create your first user account to get started"}
                      </div>
                      {!hasActiveFilters && (
                        <Button
                          asChild
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Link href="/users/new">
                            <User className="mr-2 h-4 w-4" />
                            Create User
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">{user.username}</div>
                          <div className="text-xs text-gray-500">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {user.firstname}
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {user.lastname}
                    </TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((role) => (
                          <Badge
                            key={role.id}
                            variant="secondary"
                            className="bg-primary/10 text-primary border-primary/20"
                          >
                            {role.roleName}
                          </Badge>
                        )) || (
                          <span className="text-sm text-gray-400">No roles</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.actived ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-red-100 text-red-800 border-red-200"
                        >
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                          className="border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-colors"
                        >
                          <Link href={`/users/${user.id}/edit`}>
                            <Edit className="h-4 w-4 text-gray-600" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteDialog(user.id)}
                          disabled={user.id === currentUserId}
                          className={`border-gray-300 transition-colors ${
                            user.id === currentUserId
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
        {users.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                Showing {filteredUsers.length} of {users.length} users
              </div>
              <div>
                {users.filter((u) => u.actived).length} active,{" "}
                {users.filter((u) => !u.actived).length} inactive
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
              Delete User Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user account? This will
              permanently remove the user and all associated data. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
