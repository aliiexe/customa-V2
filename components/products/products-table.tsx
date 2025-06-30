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
import {
  Edit,
  Trash2,
  Package,
  Eye,
  AlertTriangle,
  Building2,
  Tag,
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

interface Product {
  id: number;
  name: string;
  reference: string;
  description?: string;
  supplierPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  provisionalStock?: number;
  reorderLevel?: number;
  categoryId: number;
  categoryName?: string;
  supplierId: number;
  supplierName?: string;
  createdAt: string;
  updatedAt?: string;
  expectedEntry?: number;
  expectedRelease?: number;
}

interface ProductsTableProps {
  filters: {
    search: string;
    category: string;
    supplier: string;
    stockLevel: string;
    priceRange: string;
  };
}

export default function ProductsTable({ filters }: ProductsTableProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched products data:", data);
        setProducts(data);
      } else {
        setError("Failed to load products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Error loading products");
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          product.reference.toLowerCase().includes(filters.search.toLowerCase()) ||
          (product.description &&
            product.description.toLowerCase().includes(filters.search.toLowerCase())) ||
          (product.categoryName &&
            product.categoryName.toLowerCase().includes(filters.search.toLowerCase())) ||
          (product.supplierName &&
            product.supplierName.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    // Category filter
    if (filters.category !== "all") {
      filtered = filtered.filter(
        (product) => product.categoryId.toString() === filters.category
      );
    }

    // Supplier filter
    if (filters.supplier !== "all") {
      filtered = filtered.filter(
        (product) => product.supplierId.toString() === filters.supplier
      );
    }

    // Stock level filter
    if (filters.stockLevel !== "all") {
      filtered = filtered.filter((product) => {
        const totalStock = product.stockQuantity + (product.provisionalStock || 0);
        switch (filters.stockLevel) {
          case "out":
            return totalStock === 0;
          case "low":
            return totalStock > 0 && totalStock <= 10;
          case "medium":
            return totalStock > 10 && totalStock <= 50;
          case "high":
            return totalStock > 50;
          default:
            return true;
        }
      });
    }

    // Price range filter
    if (filters.priceRange !== "all") {
      filtered = filtered.filter((product) => {
        const price = product.sellingPrice;
        switch (filters.priceRange) {
          case "0-25":
            return price >= 0 && price <= 25;
          case "25-100":
            return price > 25 && price <= 100;
          case "100-500":
            return price > 100 && price <= 500;
          case "500+":
            return price > 500;
          default:
            return true;
        }
      });
    }

    setFilteredProducts(filtered);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
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
    if (!productToDelete) return;

    try {
      const response = await fetch(`/api/products/${productToDelete}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setProducts(products.filter((product) => product.id !== productToDelete));
      } else {
        alert(data.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("An error occurred while deleting the product");
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const openDeleteDialog = (id: number) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const getStockStatusBadge = (product: Product) => {
    // Use only actual stock for status badges, not provisional
    const actualStock = product.stockQuantity;
    const reorderLevel = product.reorderLevel || 5;

    if (actualStock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (actualStock <= reorderLevel) {
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Low Stock</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800 border-green-200">In Stock</Badge>;
    }
  };

  const calculateProfitMargin = (product: Product) => {
    if (product.supplierPrice <= 0) return 0;
    return ((product.sellingPrice - product.supplierPrice) / product.supplierPrice) * 100;
  };

  const hasActiveFilters =
    filters.search ||
    filters.category !== "all" ||
    filters.supplier !== "all" ||
    filters.stockLevel !== "all" ||
    filters.priceRange !== "all";

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading products...</div>
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
              onClick={fetchProducts}
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
            Products ({products.length})
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage your product inventory and track stock levels
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead
                  className="cursor-pointer text-primary font-semibold hover:text-primary/80 transition-colors"
                  onClick={() => handleSort("reference")}
                >
                  <div className="flex items-center gap-2">
                    Reference
                    {sortColumn === "reference" && (
                      <span className="text-xs">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-primary font-semibold hover:text-primary/80 transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-2">
                    Product
                    {sortColumn === "name" && (
                      <span className="text-xs">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-primary font-semibold">
                  Category & Supplier
                </TableHead>
                <TableHead className="text-primary font-semibold text-center">Real Stock</TableHead>
                <TableHead className="text-primary font-semibold text-center">Expected Entry</TableHead>
                <TableHead className="text-primary font-semibold text-center">Expected Release</TableHead>
                <TableHead
                  className="cursor-pointer text-right text-primary font-semibold hover:text-primary/80 transition-colors"
                  onClick={() => handleSort("sellingPrice")}
                >
                  <div className="flex items-center justify-end gap-2">
                    Pricing
                    {sortColumn === "sellingPrice" && (
                      <span className="text-xs">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-primary font-semibold">Status</TableHead>
                <TableHead className="text-center text-primary font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Package className="h-12 w-12 mb-4 text-gray-300" />
                      <div className="text-lg font-medium text-gray-900 mb-2">
                        {hasActiveFilters
                          ? "No products match your filters"
                          : "No products found"}
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        {hasActiveFilters
                          ? "Try adjusting your search or filter criteria"
                          : "Add your first product to get started"}
                      </div>
                      {!hasActiveFilters && (
                        <Button
                          asChild
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Link href="/products/new">
                            <Package className="mr-2 h-4 w-4" />
                            Add Product
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Tag className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">{product.reference}</div>
                          <div className="text-xs text-gray-500">
                            ID: {product.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Package className="h-3 w-3 mr-1 text-gray-400" />
                          <span className="text-gray-900">{product.categoryName || "Uncategorized"}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Building2 className="h-3 w-3 mr-1 text-gray-400" />
                          <span>{product.supplierName || "Unknown Supplier"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium text-gray-900">{product.stockQuantity}</TableCell>
                    <TableCell className="text-center font-medium text-blue-700">{product.expectedEntry ?? 0}</TableCell>
                    <TableCell className="text-center font-medium text-amber-700">{product.expectedRelease ?? 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <div className="flex items-center justify-end gap-1 font-medium text-gray-900">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          {Number(product.sellingPrice).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Cost: ${Number(product.supplierPrice).toFixed(2)}
                        </div>
                        <div className="text-xs">
                          <span className={`font-medium ${calculateProfitMargin(product) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Number(calculateProfitMargin(product)).toFixed(1)}% margin
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStockStatusBadge(product)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                          className="border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-colors"
                        >
                          <Link href={`/products/${product.id}`}>
                            <Eye className="h-4 w-4 text-gray-600" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                          className="border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-colors"
                        >
                          <Link href={`/products/${product.id}/edit`}>
                            <Edit className="h-4 w-4 text-gray-600" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteDialog(product.id)}
                          className="border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
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
        {products.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                Showing {filteredProducts.length} of {products.length} products
              </div>
              <div className="text-right space-y-1">
                <div>
                  Total Stock: {products.reduce((sum, p) => sum + p.stockQuantity, 0)} units
                </div>
                <div>
                  Total Value: $
                  {products
                    .reduce((sum, p) => sum + (p.sellingPrice * p.stockQuantity), 0)
                    .toFixed(2)}
                </div>
                {products.some(p => (p.stockQuantity + (p.provisionalStock || 0)) <= 10) && (
                  <div className="text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {products.filter(p => (p.stockQuantity + (p.provisionalStock || 0)) <= 10).length} low stock alerts
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
              Delete Product
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This will permanently remove
              the product and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
