"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

interface DateRangePickerProps {
  dateRange: DateRange;
  onUpdate: (range: DateRange) => void;
  className?: string;
}

export function DateRangePicker({
  dateRange,
  onUpdate,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onUpdate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

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

  useEffect(() => {
    // In a real app, fetch from API
    const mockData: ProductInventoryData[] = [
      {
        id: 1,
        name: "Laptop Pro X1",
        reference: "LP-X1",
        category: "Electronics",
        supplier: "Tech Solutions Inc.",
        inStock: 24,
        reorderLevel: 10,
        status: "in-stock",
      },
      {
        id: 2,
        name: "Wireless Mouse",
        reference: "WM-101",
        category: "Computer Accessories",
        supplier: "Tech Solutions Inc.",
        inStock: 8,
        reorderLevel: 10,
        status: "low-stock",
      },
      {
        id: 3,
        name: "Ergonomic Office Chair",
        reference: "EOC-2023",
        category: "Furniture",
        supplier: "Furniture Plus",
        inStock: 15,
        reorderLevel: 5,
        status: "in-stock",
      },
      {
        id: 4,
        name: "Premium Paper Ream",
        reference: "PPR-500",
        category: "Office Supplies",
        supplier: "Office World",
        inStock: 0,
        reorderLevel: 20,
        status: "out-of-stock",
      },
    ];

    setData(mockData);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading inventory data...</div>;
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
