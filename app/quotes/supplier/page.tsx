"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import SupplierQuotesTable from "@/components/quotes/supplier-quotes-table";
import SupplierQuoteFilters from "@/components/quotes/supplier-quote-filters";
import Link from "next/link";

interface Quote {
  id: number;
  supplierName: string;
  totalAmount: number;
  dateCreated: string;
  validUntil: string;
  status: string;
  itemsCount: number;
  convertedInvoiceId?: number;
}

export default function SupplierQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all quotes on initial load
  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/quotes/supplier");
      if (response.ok) {
        const data = await response.json();
        setQuotes(data);
        setFilteredQuotes(data); // Initially show all quotes
      } else {
        console.error("Failed to fetch quotes");
        setQuotes([]);
        setFilteredQuotes([]);
      }
    } catch (error) {
      console.error("Error fetching quotes:", error);
      setQuotes([]);
      setFilteredQuotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Use useCallback to memoize the filter handler and prevent infinite loops
  const handleFilterChange = useCallback(
    async (filters: any) => {
      setIsLoading(true);

      try {
        // Build query parameters - only add non-empty values
        const params = new URLSearchParams();

        if (filters.searchTerm && filters.searchTerm.trim()) {
          params.append("search", filters.searchTerm.trim());
        }
        if (filters.selectedStatus && filters.selectedStatus !== "all") {
          params.append("status", filters.selectedStatus);
        }
        if (filters.selectedSupplier && filters.selectedSupplier !== "all") {
          params.append("supplierId", filters.selectedSupplier);
        }
        if (filters.dateFrom) {
          params.append("startDate", filters.dateFrom);
        }
        if (filters.dateTo) {
          params.append("endDate", filters.dateTo);
        }

        const queryString = params.toString();
        const url = queryString
          ? `/api/quotes/supplier?${queryString}`
          : "/api/quotes/supplier";

        console.log("Fetching with URL:", url);

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setFilteredQuotes(data);
          console.log("Filtered quotes:", data);
        } else {
          console.error("Failed to fetch filtered quotes");
          setFilteredQuotes([]);
        }
      } catch (error) {
        console.error("Error fetching filtered quotes:", error);
        setFilteredQuotes([]);
      } finally {
        setIsLoading(false);
      }
    },
    [] // Empty dependency array since we don't need any external dependencies
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Supplier Quotes
              </h1>
              <p className="mt-2 text-gray-600">
                Request and manage quotes from your suppliers
              </p>
            </div>
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              <Link href="/quotes/supplier/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Request Quote
              </Link>
            </Button>
          </div>
        </div>

        {/* Supplier-specific Filters */}
        <div className="mb-6">
          <SupplierQuoteFilters onFilterChange={handleFilterChange} />
        </div>

        {/* Supplier Quotes Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <SupplierQuotesTable
            quotes={filteredQuotes}
            isLoading={isLoading}
            onQuotesChange={fetchQuotes}
          />
        </div>
      </div>
    </div>
  );
}
