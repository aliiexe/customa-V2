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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, ArrowUpDown, Search, Package } from "lucide-react";
import Link from "next/link";

interface ProductInventoryData {
  id: string;
  name: string;
  reference: string;
  category: string;
  supplier: string;
  inStock: number;
  reorderLevel: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
}

export function ProductInventoryTable() {
  const [data, setData] = useState<ProductInventoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<ProductInventoryData[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    category: "all",
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProductInventoryData;
    direction: "asc" | "desc";
  }>({
    key: "name",
    direction: "asc",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports/products/inventory`);

        if (!response.ok) {
          throw new Error("Failed to fetch inventory data");
        }

        const inventoryData = await response.json();
        setData(inventoryData);
        setFilteredData(inventoryData);
      } catch (error) {
        console.error("Error fetching inventory data:", error);
        setError("Unable to load inventory data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters
    let result = [...data];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.reference.toLowerCase().includes(searchLower) ||
          item.supplier.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status !== "all") {
      result = result.filter((item) => item.status === filters.status);
    }

    if (filters.category !== "all") {
      result = result.filter((item) => item.category === filters.category);
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredData(result);
  }, [data, filters, sortConfig]);

  const handleSort = (key: keyof ProductInventoryData) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-stock":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            In Stock
          </Badge>
        );
      case "low-stock":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
            Low Stock
          </Badge>
        );
      case "out-of-stock":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            Out of Stock
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const uniqueCategories = Array.from(
    new Set(data.map((item) => item.category))
  )
    .filter(Boolean)
    .sort();

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products by name, reference, or supplier..."
            className="pl-9"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.category}
            onValueChange={(value) =>
              setFilters({ ...filters, category: value })
            }
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1 font-medium"
                >
                  Product
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("reference")}
                  className="flex items-center gap-1 font-medium"
                >
                  Reference
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("inStock")}
                  className="flex items-center gap-1 font-medium ml-auto"
                >
                  Stock
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="h-8 w-8 text-gray-300" />
                    <p className="text-gray-500">
                      No products found matching your filters
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.reference}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.supplier}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 items-center">
                      {product.inStock}
                      {product.inStock <= product.reorderLevel &&
                        product.inStock > 0 && (
                          <Badge
                            variant="outline"
                            className="bg-amber-50 border-amber-200"
                          >
                            Low
                          </Badge>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {getStatusBadge(product.status)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/products/${product.id}`}>
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredData.length} of {data.length} products
      </div>
    </div>
  );
}
