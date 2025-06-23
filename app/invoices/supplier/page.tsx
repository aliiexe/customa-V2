"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import SupplierInvoicesTable from "@/components/invoices/supplier-invoices-table"
import { SupplierInvoiceFilters } from "@/components/invoices/supplier-invoice-filters"
import Link from "next/link"

export default function SupplierInvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [filters, setFilters] = useState({
    supplierId: "all",
    status: "all",
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    fetchSuppliers()
    fetchInvoices()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("/api/suppliers")
      if (response.ok) {
        const data = await response.json()
        setSuppliers(data)
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error)
    }
  }

  const fetchInvoices = async () => {
    try {
      const queryParams = new URLSearchParams()
      if (filters.supplierId !== "all") queryParams.append("supplierId", filters.supplierId)
      if (filters.status !== "all") queryParams.append("status", filters.status)
      if (filters.startDate) queryParams.append("startDate", filters.startDate)
      if (filters.endDate) queryParams.append("endDate", filters.endDate)

      const response = await fetch(`/api/invoices/supplier?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      }
    } catch (error) {
      console.error("Error fetching invoices:", error)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleResetFilters = () => {
    setFilters({
      supplierId: "all",
      status: "all",
      startDate: "",
      endDate: "",
    })
  }

  useEffect(() => {
    fetchInvoices()
  }, [filters])

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-blue-600">Supplier Invoices</h1>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/invoices/supplier/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Invoice
          </Link>
        </Button>
      </div>

      <SupplierInvoiceFilters
        suppliers={suppliers}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />
      <SupplierInvoicesTable invoices={invoices} />
    </div>
  )
} 