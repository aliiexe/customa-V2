"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Package } from "lucide-react";
import ProductsTable from "@/components/products/products-table";
import ProductFilters from "@/components/products/product-filters";
import Link from "next/link";

export default function ProductsPage() {
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    supplier: "all",
    stockLevel: "all",
    priceRange: "all",
  });

  // Use useCallback to memoize the filter handler
  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                <Package className="h-8 w-8 text-primary" />
                Products
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your product inventory, pricing, and stock levels
              </p>
            </div>
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              <Link href="/products/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <ProductFilters onFiltersChange={handleFiltersChange} />
        </div>

        {/* Products Table */}
        <ProductsTable filters={filters} />
      </div>
    </div>
  );
}
