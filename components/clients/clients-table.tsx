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
  User,
  RotateCcw,
  Search,
  Eye,
  Mail,
  Phone,
  DollarSign,
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

interface Client {
  id: number;
  name: string;
  address: string;
  email: string;
  phoneNumber: string;
  iban?: string;
  createdAt: string;
  updatedAt?: string;
  totalSpent: number;
  unpaidAmount: number;
  orderCount: number;
  lastOrderDate?: string;
  invoiceCount: number;
  quoteCount: number;
}

export default function ClientsTable() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, statusFilter]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/clients");
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched clients data:", data); // Debug log
        setClients(data);
      } else {
        setError("Failed to load clients");
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      setError("Error loading clients");
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = [...clients];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.phoneNumber.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((client) => {
        const hasUnpaid = client.unpaidAmount > 0;
        const hasOrders = client.orderCount > 0;

        switch (statusFilter) {
          case "active":
            return hasOrders;
          case "inactive":
            return !hasOrders;
          case "unpaid":
            return hasUnpaid;
          default:
            return true;
        }
      });
    }

    setFilteredClients(filtered);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedClients = [...filteredClients].sort((a: any, b: any) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (typeof aValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return sortDirection === "asc"
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    }
  });

  const handleDelete = async () => {
    if (!clientToDelete) return;

    try {
      const response = await fetch(`/api/clients/${clientToDelete}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setClients(clients.filter((client) => client.id !== clientToDelete));
      } else {
        alert(data.error || "Failed to delete client");
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("An error occurred while deleting the client");
    } finally {
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const openDeleteDialog = (id: number, client: Client) => {
    if (client.orderCount > 0) {
      alert(
        `This client has ${client.orderCount} order${
          client.orderCount > 1 ? "s" : ""
        } and cannot be deleted.`
      );
      return;
    }
    setClientToDelete(id);
    setDeleteDialogOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchTerm || statusFilter !== "all";

  const getClientStatusBadge = (client: Client) => {
    const hasOrders = client.orderCount > 0;
    const hasUnpaid = client.unpaidAmount > 0;

    if (hasUnpaid) {
      return <Badge variant="destructive">Outstanding</Badge>;
    } else if (hasOrders) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Active
        </Badge>
      );
    } else {
      return <Badge variant="secondary">New</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading clients...</div>
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
            <Button onClick={fetchClients} variant="outline" className="mt-4">
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
            Clients ({clients.length})
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage your client relationships and track their business activity
          </p>
        </div>

        {/* Simplified Filters */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label
                htmlFor="search"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Search Clients
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 border-gray-300 focus:border-primary focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Status
              </Label>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-10 border-gray-300 focus:border-primary">
                    <SelectValue placeholder="All clients" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Clients</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="unpaid">Has Outstanding</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  disabled={!hasActiveFilters}
                  className="h-10 border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <RotateCcw className="w-4 h-4" />
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
                {statusFilter !== "all" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    Status: {statusFilter}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Streamlined Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead
                  className="cursor-pointer text-primary font-semibold hover:text-primary/80 transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-2">
                    Client
                    {sortColumn === "name" && (
                      <span className="text-xs">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-primary font-semibold">
                  Contact
                </TableHead>
                <TableHead
                  className="cursor-pointer text-center text-primary font-semibold hover:text-primary/80 transition-colors"
                  onClick={() => handleSort("orderCount")}
                >
                  <div className="flex items-center justify-center gap-2">
                    Orders
                    {sortColumn === "orderCount" && (
                      <span className="text-xs">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-right text-primary font-semibold hover:text-primary/80 transition-colors"
                  onClick={() => handleSort("totalSpent")}
                >
                  <div className="flex items-center justify-end gap-2">
                    Total Spent
                    {sortColumn === "totalSpent" && (
                      <span className="text-xs">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-primary font-semibold">
                  Status
                </TableHead>
                <TableHead className="text-center text-primary font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <User className="h-12 w-12 mb-4 text-gray-300" />
                      <div className="text-lg font-medium text-gray-900 mb-2">
                        {hasActiveFilters
                          ? "No clients match your filters"
                          : "No clients found"}
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        {hasActiveFilters
                          ? "Try adjusting your search or filter criteria"
                          : "Add your first client to get started"}
                      </div>
                      {!hasActiveFilters && (
                        <Button
                          asChild
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Link href="/clients/new">
                            <User className="mr-2 h-4 w-4" />
                            Add Client
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedClients.map((client) => (
                  <TableRow
                    key={client.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">{client.name}</div>
                          <div className="text-xs text-gray-500">
                            ID: {client.id} • Joined{" "}
                            {format(new Date(client.createdAt), "MMM yyyy")}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="h-3 w-3 mr-2 text-gray-400" />
                          {client.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-3 w-3 mr-2 text-gray-400" />
                          {client.phoneNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800"
                      >
                        {client.orderCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <div className="flex items-center justify-end gap-1 font-medium">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          {client.totalSpent.toFixed(2)}
                        </div>
                        {client.unpaidAmount > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            ${client.unpaidAmount.toFixed(2)} outstanding
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getClientStatusBadge(client)}</TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                          className="border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-colors"
                        >
                          <Link href={`/clients/${client.id}`}>
                            <Eye className="h-4 w-4 text-gray-600" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                          className="border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-colors"
                        >
                          <Link href={`/clients/${client.id}/edit`}>
                            <Edit className="h-4 w-4 text-gray-600" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteDialog(client.id, client)}
                          disabled={client.orderCount > 0}
                          className={`border-gray-300 transition-colors ${
                            client.orderCount > 0
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
        {clients.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                Showing {filteredClients.length} of {clients.length} clients
              </div>
              <div className="text-right">
                <div>
                  Total Revenue: $
                  {clients.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
                </div>
                {clients.some((c) => c.unpaidAmount > 0) && (
                  <div className="text-red-600">
                    Outstanding: $
                    {clients
                      .reduce((sum, c) => sum + c.unpaidAmount, 0)
                      .toFixed(2)}
                  </div>
                )}
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
              Delete Client
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this client? This will permanently
              remove the client and all associated data. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Client
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
