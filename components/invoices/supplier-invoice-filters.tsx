"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface SupplierInvoiceFiltersProps {
  suppliers: { id: number; name: string }[]
  filters: {
    supplierId: string
    status: string
    startDate: string
    endDate: string
  }
  onFilterChange: (key: string, value: string) => void
  onResetFilters: () => void
}

export function SupplierInvoiceFilters({ suppliers, filters, onFilterChange, onResetFilters }: SupplierInvoiceFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 border-b">
      <Select value={filters.supplierId} onValueChange={(value) => onFilterChange("supplierId", value)}>
        <SelectTrigger>
          <SelectValue placeholder="All Suppliers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Suppliers</SelectItem>
          {suppliers.map((supplier) => (
            <SelectItem key={supplier.id} value={supplier.id.toString()}>
              {supplier.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={(value) => onFilterChange("status", value)}>
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="in_process">In Process</SelectItem>
          <SelectItem value="sent">Sent</SelectItem>
          <SelectItem value="received">Received</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="date"
        placeholder="Start Date"
        value={filters.startDate}
        onChange={(e) => onFilterChange("startDate", e.target.value)}
      />
      
      <Input
        type="date"
        placeholder="End Date"
        value={filters.endDate}
        onChange={(e) => onFilterChange("endDate", e.target.value)}
      />

      <Button onClick={onResetFilters} variant="outline" className="w-full">
        Reset
      </Button>
    </div>
  )
} 