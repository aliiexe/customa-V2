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
import { Skeleton } from "@/components/ui/skeleton";

interface SupplierProduct {
  name: string;
  totalProducts: number;
  percentage: number;
}

export function SupplierProductsTable() {
  const [data, setData] = useState<SupplierProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/reports/suppliers/products");
        if (response.ok) {
          const productData = await response.json();
          setData(productData);
        }
      } catch (error) {
        console.error("Error fetching supplier products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Supplier</TableHead>
          <TableHead className="text-right">Products</TableHead>
          <TableHead className="text-right">Market Share</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((supplier) => (
          <TableRow key={supplier.name}>
            <TableCell className="font-medium">{supplier.name}</TableCell>
            <TableCell className="text-right">
              {supplier.totalProducts}
            </TableCell>
            <TableCell className="text-right">
              {supplier.percentage.toFixed(1)}%
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
