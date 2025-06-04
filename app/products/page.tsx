import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import ProductsTable from "@/components/products/products-table";
import ProductFilters from "@/components/products/product-filters";
import Link from "next/link";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Button asChild>
          <Link href="/products/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <ProductFilters />
      <ProductsTable />
    </div>
  );
}
