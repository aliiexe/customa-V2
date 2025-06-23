import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import SupplierQuotesTable from "@/components/quotes/supplier-quotes-table";
import QuoteFilters from "@/components/quotes/quote-filters";
import Link from "next/link";

export default function SupplierQuotesPage() {
  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Supplier Quotes
        </h1>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/quotes/supplier/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Request Quote
          </Link>
        </Button>
      </div>

      <QuoteFilters type="supplier" />
      <SupplierQuotesTable />
    </div>
  );
}
