"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 p-4 border-b">
      <Select value={filters.clientId} onValueChange={(value) => onFilterChange("clientId", value)}>
        <SelectTrigger>
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

      <Select value={filters.payment_status} onValueChange={(value) => onFilterChange("payment_status", value)}>
        <SelectTrigger>
          <SelectValue placeholder="Payment Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Payment Statuses</SelectItem>
          <SelectItem value="UNPAID">Unpaid</SelectItem>
          <SelectItem value="PAID">Paid</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={filters.delivery_status} onValueChange={(value) => onFilterChange("delivery_status", value)}>
        <SelectTrigger>
          <SelectValue placeholder="Delivery Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Delivery Statuses</SelectItem>
          <SelectItem value="IN_PROCESS">In Process</SelectItem>
          <SelectItem value="SENDING">Sending</SelectItem>
          <SelectItem value="DELIVERED">Delivered</SelectItem>
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
