"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, RotateCcw, Filter } from "lucide-react";
import { QuoteStatus } from "@/types/quote-models";

interface SupplierQuoteFiltersProps {
  onFilterChange?: (filters: any) => void;
}

interface Supplier {
  id: number;
  name: string;
}

export default function SupplierQuoteFilters({ onFilterChange }: SupplierQuoteFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Fetch suppliers on component mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch("/api/suppliers");
        if (response.ok) {
          const data = await response.json();
          setSuppliers(data);
        }
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };
    fetchSuppliers();
  }, []);

  // Memoize the filter application to prevent unnecessary calls
  const applyFilters = useCallback(() => {
    const filters = {
      searchTerm: searchTerm.trim(),
      selectedStatus: selectedStatus === "all" ? "" : selectedStatus,
      selectedSupplier: selectedSupplier === "all" ? "" : selectedSupplier,
      dateFrom: dateFrom || "",
      dateTo: dateTo || "",
    };
    onFilterChange?.(filters);
  }, [searchTerm, selectedStatus, selectedSupplier, dateFrom, dateTo, onFilterChange]);

  const handleSearch = () => {
    applyFilters();
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedSupplier("all");
    setDateFrom("");
    setDateTo("");
    
    const resetFilters = {
      searchTerm: "",
      selectedStatus: "",
      selectedSupplier: "",
      dateFrom: "",
      dateTo: "",
    };
    onFilterChange?.(resetFilters);
  };

  // Auto-apply filters when values change (with debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedStatus, selectedSupplier, dateFrom, dateTo]); // Removed onFilterChange to prevent infinite loop

  const hasActiveFilters = searchTerm || (selectedStatus && selectedStatus !== "all") || (selectedSupplier && selectedSupplier !== "all") || dateFrom || dateTo;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="mr-2 h-5 w-5 text-primary" />
          Filter Supplier Quotes
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Use the filters below to find specific supplier quotes
        </p>
      </div>

      {/* Filter Content */}
      <div className="p-6">
        {/* Main Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2 block">
              Search Supplier Quotes
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by supplier name or quote ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 border-gray-300 focus:border-primary focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Status
            </Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-10 border-gray-300 focus:border-primary">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={QuoteStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={QuoteStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={QuoteStatus.CONFIRMED}>Confirmed</SelectItem>
                <SelectItem value={QuoteStatus.APPROVED}>Approved</SelectItem>
                <SelectItem value={QuoteStatus.REJECTED}>Rejected</SelectItem>
                <SelectItem value={QuoteStatus.CONVERTED}>Converted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Supplier Filter */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Supplier
            </Label>
            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger className="h-10 border-gray-300 focus:border-primary">
                <SelectValue placeholder="All Suppliers" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* From Date */}
          <div>
            <Label htmlFor="dateFrom" className="text-sm font-medium text-gray-700 mb-2 block">
              Start Date
            </Label>
            <Input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-10 border-gray-300 focus:border-primary focus:ring-primary/20"
            />
          </div>

          {/* To Date */}
          <div>
            <Label htmlFor="dateTo" className="text-sm font-medium text-gray-700 mb-2 block">
              End Date
            </Label>
            <Input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-10 border-gray-300 focus:border-primary focus:ring-primary/20"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 items-end">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1 h-10 border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-700"
              disabled={!hasActiveFilters}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  Search: {searchTerm}
                </span>
              )}
              {selectedStatus && selectedStatus !== "all" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  Status: {selectedStatus}
                </span>
              )}
              {selectedSupplier && selectedSupplier !== "all" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  Supplier: {suppliers.find(s => s.id.toString() === selectedSupplier)?.name || selectedSupplier}
                </span>
              )}
              {dateFrom && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  From: {dateFrom}
                </span>
              )}
              {dateTo && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  To: {dateTo}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}