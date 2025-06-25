"use client";

import { useState, useEffect } from "react";
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
import { Search, RotateCcw } from "lucide-react";
import { QuoteStatus } from "@/types/quote-models";

interface ClientQuoteFiltersProps {
  onFilterChange?: (filters: any) => void;
}

interface Client {
  id: number;
  name: string;
}

export default function ClientQuoteFilters({ onFilterChange }: ClientQuoteFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [clients, setClients] = useState<Client[]>([]);

  // Fetch clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/clients");
        if (response.ok) {
          const data = await response.json();
          setClients(data);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, []);

  const handleSearch = () => {
    const filters = {
      searchTerm: searchTerm.trim(),
      selectedStatus: selectedStatus === "all" ? "" : selectedStatus,
      selectedClient: selectedClient === "all" ? "" : selectedClient,
      dateFrom: dateFrom || "",
      dateTo: dateTo || "",
    };
    onFilterChange?.(filters);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedClient("all");
    setDateFrom("");
    setDateTo("");
    
    const filters = {
      searchTerm: "",
      selectedStatus: "",
      selectedClient: "",
      dateFrom: "",
      dateTo: "",
    };
    onFilterChange?.(filters);
  };

  // Auto-apply filters when values change (with debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filters = {
        searchTerm: searchTerm.trim(),
        selectedStatus: selectedStatus === "all" ? "" : selectedStatus,
        selectedClient: selectedClient === "all" ? "" : selectedClient,
        dateFrom: dateFrom || "",
        dateTo: dateTo || "",
      };
      onFilterChange?.(filters);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedStatus, selectedClient, dateFrom, dateTo, onFilterChange]);

  // Set default values on mount
  useEffect(() => {
    setSelectedStatus("all");
    setSelectedClient("all");
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Filter Client Quotes</h3>
        <p className="text-sm text-gray-600 mt-1">
          Use the filters below to find specific client quotes
        </p>
      </div>

      {/* Filter Content */}
      <div className="p-6">
        {/* Main Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2 block">
              Search Client Quotes
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by client name or quote ID..."
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

          {/* Client Filter */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Client
            </Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="h-10 border-gray-300 focus:border-primary">
                <SelectValue placeholder="All Clients" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Clients</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* From Date */}
          <div>
            <Label htmlFor="dateFrom" className="text-sm font-medium text-gray-700 mb-2 block">
              From Date
            </Label>
            <Input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-10 border-gray-300 focus:border-primary focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Secondary Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* To Date */}
          <div>
            <Label htmlFor="dateTo" className="text-sm font-medium text-gray-700 mb-2 block">
              To Date
            </Label>
            <Input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-10 border-gray-300 focus:border-primary focus:ring-primary/20"
            />
          </div>

          {/* Spacer columns */}
          <div className="hidden lg:block lg:col-span-3"></div>

          {/* Action Buttons */}
          <div className="flex gap-2 lg:justify-end">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1 lg:flex-none h-10 border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSearch}
              className="flex-1 lg:flex-none h-10 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Apply Filters
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || (selectedStatus && selectedStatus !== "all") || (selectedClient && selectedClient !== "all") || dateFrom || dateTo) && (
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
              {selectedClient && selectedClient !== "all" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  Client: {clients.find(c => c.id.toString() === selectedClient)?.name || selectedClient}
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