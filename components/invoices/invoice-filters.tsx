"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RotateCcw, Filter } from "lucide-react"

interface InvoiceFiltersProps {
  clients: { id: number; name: string }[]
  filters: {
    clientId: string
    payment_status: string
    delivery_status: string
    startDate: string
    endDate: string
  }
  onFilterChange: (key: string, value: string) => void
  onResetFilters: () => void
}

export function InvoiceFilters({ clients, filters, onFilterChange, onResetFilters }: InvoiceFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(value => value && value !== "all")

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="mr-2 h-5 w-5 text-primary" />
          Filter Invoices
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Use the filters below to find specific invoices
        </p>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Client
          </Label>
          <Select value={filters.clientId} onValueChange={(value) => onFilterChange("clientId", value)}>
            <SelectTrigger className="h-10 border-gray-300 focus:border-primary">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Payment Status
          </Label>
          <Select value={filters.payment_status} onValueChange={(value) => onFilterChange("payment_status", value)}>
            <SelectTrigger className="h-10 border-gray-300 focus:border-primary">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Statuses</SelectItem>
              <SelectItem value="UNPAID">Unpaid</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Delivery Status
          </Label>
          <Select value={filters.delivery_status} onValueChange={(value) => onFilterChange("delivery_status", value)}>
            <SelectTrigger className="h-10 border-gray-300 focus:border-primary">
              <SelectValue placeholder="Delivery Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Delivery Statuses</SelectItem>
              <SelectItem value="IN_PROCESS">In Process</SelectItem>
              <SelectItem value="SENDING">Sending</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Start Date
          </Label>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange("startDate", e.target.value)}
            className="h-10 border-gray-300 focus:border-primary focus:ring-primary/20"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            End Date
          </Label>
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange("endDate", e.target.value)}
            className="h-10 border-gray-300 focus:border-primary focus:ring-primary/20"
          />
        </div>

        <div className="flex items-end">
          <Button 
            onClick={onResetFilters} 
            variant="outline" 
            className="w-full h-10 border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-700"
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
            {filters.clientId && filters.clientId !== "all" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                Client: {clients.find(c => c.id.toString() === filters.clientId)?.name}
              </span>
            )}
            {filters.payment_status && filters.payment_status !== "all" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                Payment: {filters.payment_status}
              </span>
            )}
            {filters.delivery_status && filters.delivery_status !== "all" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                Delivery: {filters.delivery_status}
              </span>
            )}
            {filters.startDate && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                From: {filters.startDate}
              </span>
            )}
            {filters.endDate && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                To: {filters.endDate}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
