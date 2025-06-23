"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import ClientInvoicesTable from "@/components/invoices/client-invoices-table"
import { InvoiceFilters } from "@/components/invoices/invoice-filters"
import Link from "next/link"

interface Invoice {
  id: number
  clientName: string
  totalAmount: number
  dateCreated: string
  deliveryDate: string
  payment_status: "PAID" | "UNPAID"
  delivery_status: "IN_PROCESS" | "SENDING" | "DELIVERED"
}

interface Client {
  id: number
  name: string
}

export default function ClientInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    clientId: "",
    payment_status: "",
    delivery_status: "",
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch clients for the filter dropdown
        const clientsResponse = await fetch("/api/clients")
        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json()
          setClients(clientsData)
        }

        // Fetch invoices based on filters
        const params = new URLSearchParams()
        if (filters.clientId && filters.clientId !== 'all') params.append("clientId", filters.clientId)
        if (filters.payment_status && filters.payment_status !== 'all') params.append("payment_status", filters.payment_status)
        if (filters.delivery_status && filters.delivery_status !== 'all') params.append("delivery_status", filters.delivery_status)
        if (filters.startDate) params.append("startDate", filters.startDate)
        if (filters.endDate) params.append("endDate", filters.endDate)
        
        const response = await fetch(`/api/invoices/client?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setInvoices(data)
        } else {
          console.error("Failed to fetch invoices")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [filters])
  
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleResetFilters = () => {
    setFilters({
      clientId: "",
      payment_status: "",
      delivery_status: "",
      startDate: "",
      endDate: "",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Client Invoices</h1>
        <Button asChild>
          <Link href="/invoices/client/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Invoice
          </Link>
        </Button>
      </div>

      <InvoiceFilters 
        clients={clients} 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onResetFilters={handleResetFilters} 
      />
      {isLoading ? (
        <p>Loading invoices...</p>
      ) : (
        <ClientInvoicesTable invoices={invoices} />
      )}
    </div>
  )
}
