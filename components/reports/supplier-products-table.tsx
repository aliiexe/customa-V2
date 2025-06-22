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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface SupplierProduct {
  id: number;
  supplier: string;
  categories: string[];
  productCount: number;
  percentageOfTotal: number;
  avgPrice: number;
  topCategory: string;
}

export function SupplierProductsTable() {
  const [data, setData] = useState<SupplierProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports/suppliers/products`);

        if (!response.ok) {
          throw new Error("Failed to fetch supplier products data");
        }

        const supplierData = await response.json();
        setData(supplierData);
      } catch (error) {
        console.error("Error fetching supplier products data:", error);
        setError("Unable to load supplier products data.");
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
          <TableHead>Supplier</TableHead>
          <TableHead className="text-right">Products</TableHead>
          <TableHead>Categories</TableHead>
          <TableHead>Distribution</TableHead>
          <TableHead className="text-right">Avg. Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.supplier}</TableCell>
            <TableCell className="text-right">{item.productCount}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {item.categories.map((category) => (
                  <Badge
                    key={category}
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell className="w-[200px]">
              <div className="space-y-1">
                <Progress value={item.percentageOfTotal} className="h-2" />
                <div className="text-xs text-gray-500">
                  {item.percentageOfTotal}% of catalog
                </div>
              </div>
            </TableCell>
            <TableCell className="text-right">
              ${item.avgPrice.toFixed(2)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
