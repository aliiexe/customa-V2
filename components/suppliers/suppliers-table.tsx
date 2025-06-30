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
  Building2,
  RotateCcw,
  Search,
  Eye,
  Mail,
  Phone,
  DollarSign,
  Package,
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

interface Supplier {
  id: number;
  name: string;
  contactName: string;
  address: string;
  email: string;
  phoneNumber: string;
  website?: string;
  iban?: string;
  rib?: string;
  createdAt: string;
  updatedAt?: string;
  productCount: number;
  invoiceCount: number;
  totalSpent: number;
  unpaidAmount: number;
  lastOrderDate?: string;
}

export default function SuppliersTable() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [suppliers, searchTerm, statusFilter]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/suppliers");
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched suppliers data:", data);
        setSuppliers(data);
      } else {
        setError("Failed to load suppliers");
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setError("Error loading suppliers");
    } finally {
      setLoading(false);
    }
  };

  const filterSuppliers = () => {
    let filtered = [...suppliers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.phoneNumber.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((supplier) => {
        const hasUnpaid = supplier.unpaidAmount > 0;
        const hasProducts = supplier.productCount > 0;
        const hasOrders = supplier.invoiceCount > 0;

        switch (statusFilter) {
          case "active":
            return hasProducts && hasOrders;
          case "inactive":
            return !hasOrders;
          case "unpaid":
            return hasUnpaid;
          case "products":
            return hasProducts;
          default:
            return true;
        }
      });
    }

    setFilteredSuppliers(filtered);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedSuppliers = [...filteredSuppliers].sort((a: any, b: any) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (typeof aValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return sortDirection === "asc" ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
    }
  });

  const handleDelete = async () => {
    if (!supplierToDelete) return;

    try {
      const response = await fetch(`/api/suppliers/${supplierToDelete}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setSuppliers(suppliers.filter((supplier) => supplier.id !== supplierToDelete));
      } else {
        alert(data.error || "Failed to delete supplier");
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);
      alert("An error occurred while deleting the supplier");
    } finally {
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
    }
  };

  const openDeleteDialog = (id: number, supplier: Supplier) => {
    if (supplier.productCount > 0 || supplier.invoiceCount > 0) {
      alert(
        `This supplier has ${supplier.productCount} product${
          supplier.productCount > 1 ? "s" : ""
        } and ${supplier.invoiceCount} order${
          supplier.invoiceCount > 1 ? "s" : ""
        } and cannot be deleted.`
      );
      return;
    }
    setSupplierToDelete(id);
    setDeleteDialogOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchTerm || statusFilter !== "all";

  const getSupplierStatusBadge = (supplier: Supplier) => {
    const hasProducts = supplier.productCount > 0;
    const hasOrders = supplier.invoiceCount > 0;
    const hasUnpaid = supplier.unpaidAmount > 0;

    if (hasUnpaid) {
      return <Badge variant="destructive">Outstanding</Badge>;
    } else if (hasProducts && hasOrders) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Active
        </Badge>
      );
    } else if (hasProducts) {
      return <Badge variant="secondary">Products Only</Badge>;
    } else {
      return <Badge variant="outline">New</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading suppliers...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <div className="text-lg font-medium">{error}</div>
            <Button
              onClick={fetchSuppliers}
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
            <Building2 className="mr-2 h-5 w-5 text-primary" />
            Suppliers ({suppliers.length})
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage your supplier relationships and track their business activity
          </p>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label
                htmlFor="search"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Search Suppliers
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, contact, email, or phone..."
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
                    <SelectValue placeholder="All suppliers" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Suppliers</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="products">Has Products</SelectItem>
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

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead
                  className="cursor-pointer text-primary font-semibold hover:text-primary/80 transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-2">
                    Supplier
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
                  onClick={() => handleSort("productCount")}
                >
                  <div className="flex items-center justify-center gap-2">
                    Products
                    {sortColumn === "productCount" && (
                      <span className="text-xs">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-center text-primary font-semibold hover:text-primary/80 transition-colors"
                  onClick={() => handleSort("invoiceCount")}
                >
                  <div className="flex items-center justify-center gap-2">
                    Orders
                    {sortColumn === "invoiceCount" && (
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
                <TableHead className="text-primary font-semibold">Status</TableHead>
                <TableHead className="text-primary font-semibold">IBAN</TableHead>
                <TableHead className="text-primary font-semibold">RIB</TableHead>
                <TableHead className="text-center text-primary font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Building2 className="h-12 w-12 mb-4 text-gray-300" />
                      <div className="text-lg font-medium text-gray-900 mb-2">
                        {hasActiveFilters
                          ? "No suppliers match your filters"
                          : "No suppliers found"}
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        {hasActiveFilters
                          ? "Try adjusting your search or filter criteria"
                          : "Add your first supplier to get started"}
                      </div>
                      {!hasActiveFilters && (
                        <Button
                          asChild
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Link href="/suppliers/new">
                            <Building2 className="mr-2 h-4 w-4" />
                            Add Supplier
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedSuppliers.map((supplier) => (
                  <TableRow
                    key={supplier.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">{supplier.name}</div>
                          <div className="text-xs text-gray-500">
                            ID: {supplier.id} • Added{" "}
                            {format(new Date(supplier.createdAt), "MMM yyyy")}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="h-3 w-3 mr-2 text-gray-400" />
                          {supplier.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-3 w-3 mr-2 text-gray-400" />
                          {supplier.phoneNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          Contact: {supplier.contactName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <Package className="h-3 w-3 mr-1" />
                        {supplier.productCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-purple-100 text-purple-800">
                        {supplier.invoiceCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <div className="flex items-center justify-end gap-1 font-medium">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          {supplier.totalSpent.toFixed(2)}
                        </div>
                        {supplier.unpaidAmount > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            ${supplier.unpaidAmount.toFixed(2)} outstanding
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getSupplierStatusBadge(supplier)}
                    </TableCell>
                    <TableCell>{supplier.iban || '-'}</TableCell>
                    <TableCell>{supplier.rib || '-'}</TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                          className="border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-colors"
                        >
                          <Link href={`/suppliers/${supplier.id}`}>
                            <Eye className="h-4 w-4 text-gray-600" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                          className="border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-colors"
                        >
                          <Link href={`/suppliers/${supplier.id}/edit`}>
                            <Edit className="h-4 w-4 text-gray-600" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteDialog(supplier.id, supplier)}
                          disabled={supplier.productCount > 0 || supplier.invoiceCount > 0}
                          className={`border-gray-300 transition-colors ${
                            supplier.productCount > 0 || supplier.invoiceCount > 0
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
        {suppliers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                Showing {filteredSuppliers.length} of {suppliers.length} suppliers
              </div>
              <div className="text-right">
                <div>
                  Total Products: {suppliers.reduce((sum, s) => sum + s.productCount, 0)}
                </div>
                <div>
                  Total Expenses: $
                  {suppliers
                    .reduce((sum, s) => sum + s.totalSpent, 0)
                    .toFixed(2)}
                </div>
                {suppliers.some(s => s.unpaidAmount > 0) && (
                  <div className="text-red-600">
                    Outstanding: $
                    {suppliers
                      .reduce((sum, s) => sum + s.unpaidAmount, 0)
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
              Delete Supplier
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this supplier? This will permanently remove
              the supplier and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Supplier
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
