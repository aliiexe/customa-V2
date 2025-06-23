"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"
import { QuoteStatus } from "@/types/quote-models"

interface QuoteFiltersProps {
  type: "client" | "supplier"
}

export default function QuoteFilters({ type }: QuoteFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedEntity, setSelectedEntity] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  // Mock data - would be fetched from API in real implementation
  const clients = [
    { id: 1, name: "Acme Corporation" },
    { id: 2, name: "Global Tech Solutions" },
    { id: 3, name: "StartUp Dynamics" },
  ]

  const suppliers = [
    { id: 1, name: "TechSupplier Inc." },
    { id: 2, name: "DisplayTech Ltd." },
    { id: 3, name: "SoundWave Co." },
  ]

  const entities = type === "client" ? clients : suppliers
  const entityLabel = type === "client" ? "Client" : "Supplier"

  const handleSearch = () => {
    // In a real implementation, this would trigger an API call with the filters
    console.log({
      searchTerm,
      selectedStatus,
      selectedEntity,
      dateFrom,
      dateTo,
    })
  }

  const handleReset = () => {
    setSearchTerm("")
    setSelectedStatus("")
    setSelectedEntity("")
    setDateFrom("")
    setDateTo("")
  }

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg border shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="flex w-full items-center space-x-2">
          <Input
            placeholder={`Search ${type} quotes...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-gray-300 focus:border-green-500 focus:ring-green-500"
          />
          <Button type="submit" size="icon" onClick={handleSearch} className="bg-green-600 hover:bg-green-700">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="border-gray-300 focus:border-green-500">
            <SelectValue placeholder="Status" />
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

        <Select value={selectedEntity} onValueChange={setSelectedEntity}>
          <SelectTrigger className="border-gray-300 focus:border-green-500">
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

        <div className="space-y-2">
          <Label htmlFor="dateFrom" className="text-sm text-green-600">
            From Date
          </Label>
          <Input
            id="dateFrom"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border-gray-300 focus:border-green-500 focus:ring-green-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateTo" className="text-sm text-green-600">
            To Date
          </Label>
          <Input
            id="dateTo"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border-gray-300 focus:border-green-500 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleReset} className="border-gray-300 text-gray-600 hover:bg-gray-100">
          Reset Filters
        </Button>
        <Button onClick={handleSearch} className="bg-green-600 hover:bg-green-700">
          Apply Filters
        </Button>
      </div>
    </div>
  )
}
