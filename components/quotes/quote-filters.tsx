"use client";

import { useState } from "react";
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

interface QuoteFiltersProps {
  type: "client" | "supplier";
}

export default function QuoteFilters({ type }: QuoteFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Mock data - would be fetched from API in real implementation
  const clients = [
    { id: 1, name: "Acme Corporation" },
    { id: 2, name: "Global Tech Solutions" },
    { id: 3, name: "StartUp Dynamics" },
  ];

  const suppliers = [
    { id: 1, name: "TechSupplier Inc." },
    { id: 2, name: "DisplayTech Ltd." },
    { id: 3, name: "SoundWave Co." },
  ];

  const entities = type === "client" ? clients : suppliers;
  const entityLabel = type === "client" ? "Client" : "Supplier";

  const handleSearch = () => {
    console.log({
      searchTerm,
      selectedStatus,
      selectedEntity,
      dateFrom,
      dateTo,
    });
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedStatus("");
    setSelectedEntity("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Filter Quotes</h3>
        <p className="text-sm text-gray-600 mt-1">
          Use the filters below to find specific quotes
        </p>
      </div>

      {/* Filter Content */}
      <div className="p-6">
        {/* Main Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <Label
              htmlFor="search"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Search Quotes
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder={`Search ${type} quotes...`}
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

          {/* Client/Supplier Filter */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              {entityLabel}
            </Label>
            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
              <SelectTrigger className="h-10 border-gray-300 focus:border-primary">
                <SelectValue placeholder={`Select ${entityLabel}`} />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All {entityLabel}s</SelectItem>
                {entities.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id.toString()}>
                    {entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* From Date */}
          <div>
            <Label
              htmlFor="dateFrom"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
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
            <Label
              htmlFor="dateTo"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
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

        {/* Active Filters Display (Optional) */}
        {(searchTerm ||
          selectedStatus ||
          selectedEntity ||
          dateFrom ||
          dateTo) && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Active filters:
              </span>
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
              {selectedEntity && selectedEntity !== "all" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {entityLabel}:{" "}
                  {
                    entities.find((e) => e.id.toString() === selectedEntity)
                      ?.name
                  }
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
