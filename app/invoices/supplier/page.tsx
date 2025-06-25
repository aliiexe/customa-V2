"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import SupplierInvoicesTable from "@/components/invoices/supplier-invoices-table"
import { SupplierInvoiceFilters } from "@/components/invoices/supplier-invoice-filters"
import Link from "next/link"

interface Invoice {
  id: number
  supplierName: string
  totalAmount: number
  dateCreated: string
  deliveryDate: string
  payment_status: "PAID" | "UNPAID"
  delivery_status: "IN_PROCESS" | "SENDING" | "DELIVERED"
  itemCount: number
}

interface Supplier {
  id: number
  name: string
}

export default function SupplierInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    supplierId: "all",
    payment_status: "all",
    delivery_status: "all",
    startDate: "",
    endDate: "",
  })

  // Fetch suppliers on mount
  useEffect(() => {
    fetchSuppliers()
  }, [])

  // Fetch invoices when filters change
  useEffect(() => {
    fetchInvoices()
  }, [filters])

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("/api/suppliers")
      if (response.ok) {
        const data = await response.json()
        setSuppliers(data)
      } else {
        console.error("Failed to fetch suppliers")
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error)
    }
  }

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      
      if (filters.supplierId && filters.supplierId !== "all") {
        params.append("supplierId", filters.supplierId)
      }
      if (filters.payment_status && filters.payment_status !== "all") {
        params.append("payment_status", filters.payment_status)
      }
      if (filters.delivery_status && filters.delivery_status !== "all") {
        params.append("delivery_status", filters.delivery_status)
      }
      if (filters.startDate) {
        params.append("startDate", filters.startDate)
      }
      if (filters.endDate) {
        params.append("endDate", filters.endDate)
      }

      const queryString = params.toString()
      const url = queryString ? `/api/invoices/supplier?${queryString}` : "/api/invoices/supplier"
      
      console.log("Fetching invoices with URL:", url)
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        console.log("Invoices fetched:", data)
        setInvoices(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch invoices")
        setInvoices([])
      }
    } catch (error) {
      console.error("Error fetching invoices:", error)
      setError("Error loading invoices")
      setInvoices([])
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleResetFilters = useCallback(() => {
    setFilters({
      supplierId: "all",
      payment_status: "all",
      delivery_status: "all",
      startDate: "",
      endDate: "",
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Supplier Invoices
              </h1>
              <p className="mt-2 text-gray-600">
                Manage and track all your supplier invoices in one place
              </p>
            </div>
            <Button 
              asChild 
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              <Link href="/invoices/supplier/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Invoice
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <SupplierInvoiceFilters
            suppliers={suppliers}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <SupplierInvoicesTable 
            invoices={invoices} 
            isLoading={isLoading}
            onInvoicesChange={fetchInvoices}
          />
        </div>
      </div>
    </div>
  )
}