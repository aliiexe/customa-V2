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

interface ProductInventoryData {
  id: number;
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
      } catch (error) {
        console.error("Error fetching inventory data:", error);
        setError("Unable to load inventory data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product Name</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Supplier</TableHead>
          <TableHead className="text-right">In Stock</TableHead>
          <TableHead className="text-right">Reorder Level</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{product.reference}</TableCell>
            <TableCell>{product.category}</TableCell>
            <TableCell>{product.supplier}</TableCell>
            <TableCell className="text-right">{product.inStock}</TableCell>
            <TableCell className="text-right">{product.reorderLevel}</TableCell>
            <TableCell>
              <Badge
                variant={
                  product.status === "in-stock"
                    ? "default"
                    : product.status === "low-stock"
                    ? "secondary"
                    : "destructive"
                }
                className={
                  product.status === "in-stock"
                    ? "bg-primary text-green-800 hover:bg-green-200"
                    : product.status === "low-stock"
                    ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                    : "bg-red-100 text-red-800 hover:bg-red-200"
                }
              >
                {product.status === "in-stock"
                  ? "In Stock"
                  : product.status === "low-stock"
                  ? "Low Stock"
                  : "Out of Stock"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
