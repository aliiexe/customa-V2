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
import { Edit, Trash2, Package, Filter, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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

interface Category {
  id: number;
  name: string;
  productsCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesTable() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, searchTerm, statusFilter]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        setError("Failed to load categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Error loading categories");
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = [...categories];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "with-products") {
        filtered = filtered.filter((category) => category.productsCount > 0);
      } else if (statusFilter === "empty") {
        filtered = filtered.filter((category) => category.productsCount === 0);
      }
    }

    setFilteredCategories(filtered);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedCategories = [...filteredCategories].sort((a: any, b: any) => {
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
    if (!categoryToDelete) return;

    try {
      const response = await fetch(`/api/categories/${categoryToDelete}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setCategories(
          categories.filter((category) => category.id !== categoryToDelete)
        );
      } else {
        alert(data.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("An error occurred while deleting the category");
    } finally {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const openDeleteDialog = (id: number) => {
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchTerm || statusFilter !== "all";

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading categories...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <div className="text-lg font-medium">{error}</div>
            <Button
              onClick={fetchCategories}
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
            <Package className="mr-2 h-5 w-5 text-primary" />
            Product Categories ({categories.length})
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Organize your products into categories for better management
          </p>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label
                htmlFor="search"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Search Categories
              </Label>
              <Input
                id="search"
                placeholder="Search by category name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 border-gray-300 focus:border-primary focus:ring-primary/20"
              />
            </div>
            <div className="w-48">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Status
              </Label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
                defaultValue="all"
              >
                <SelectTrigger className="h-10 border-gray-300 focus:border-primary">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="with-products">With Products</SelectItem>
                  <SelectItem value="empty">Empty Categories</SelectItem>
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
                    Status:{" "}
                    {statusFilter === "with-products"
                      ? "With Products"
                      : "Empty"}
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
                    Category Name
                    {sortColumn === "name" && (
                      <span className="text-xs">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer text-primary font-semibold hover:text-primary/80 transition-colors"
                  onClick={() => handleSort("productsCount")}
                >
                  <div className="flex items-center justify-end gap-2">
                    Products
                    {sortColumn === "productsCount" && (
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
              {sortedCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Package className="h-12 w-12 mb-4 text-gray-300" />
                      <div className="text-lg font-medium text-gray-900 mb-2">
                        {hasActiveFilters
                          ? "No categories match your filters"
                          : "No categories found"}
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        {hasActiveFilters
                          ? "Try adjusting your search or filter criteria"
                          : "Create your first product category to get started"}
                      </div>
                      {!hasActiveFilters && (
                        <Button
                          asChild
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Link href="/categories/new">
                            <Package className="mr-2 h-4 w-4" />
                            Create Category
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedCategories.map((category) => (
                  <TableRow
                    key={category.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Package className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">{category.name}</div>
                          <div className="text-xs text-gray-500">
                            Created{" "}
                            {new Date(category.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={category.productsCount > 0 ? "default" : "secondary"}
                        className={
                          category.productsCount > 0
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-gray-100 text-gray-600"
                        }
                      >
                        {category.productsCount}{" "}
                        {category.productsCount === 1 ? "product" : "products"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                          className="border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-colors"
                        >
                          <Link href={`/categories/${category.id}/edit`}>
                            <Edit className="h-4 w-4 text-gray-600" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteDialog(category.id)}
                          disabled={category.productsCount > 0}
                          className={`border-gray-300 transition-colors ${
                            category.productsCount > 0
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
        {categories.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                Showing {filteredCategories.length} of {categories.length} categories
              </div>
              <div>
                {categories.reduce((sum, cat) => sum + cat.productsCount, 0)}{" "}
                products total
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
              Delete Category
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot be
              undone.
              {categoryToDelete &&
                categories.find((c) => c.id === categoryToDelete)
                  ?.productsCount === 0 && (
                  <div className="mt-2 text-green-600">
                    ✓ This category has no products and can be safely deleted.
                  </div>
                )}
              {categoryToDelete &&
                (() => {
                  const cat = categories.find((c) => c.id === categoryToDelete);
                  return cat && cat.productsCount > 0 ? (
                    <div className="mt-2 text-red-600">
                      ⚠ This category contains products and cannot be deleted.
                    </div>
                  ) : null;
                })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
