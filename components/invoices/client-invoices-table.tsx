"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Eye, Download, CheckCircle, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrency } from "@/lib/currency-provider"

interface Invoice {
  id: number
  clientName: string
  totalAmount: number
  dateCreated: string
  deliveryDate: string
  payment_status: "PAID" | "UNPAID"
  delivery_status: "IN_PROCESS" | "SENDING" | "DELIVERED"
}

interface ClientInvoicesTableProps {
  invoices: Invoice[]
}

export default function ClientInvoicesTable({ invoices: initialInvoices }: ClientInvoicesTableProps) {
  const { formatCurrency } = useCurrency()
  const [invoices, setInvoices] = useState(initialInvoices)
  const router = useRouter()

  // Update local state when props change
  useEffect(() => {
    setInvoices(initialInvoices)
  }, [initialInvoices])

  const getPaymentStatusBadge = (status: "PAID" | "UNPAID") => {
    switch (status) {
      case "PAID":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Paid</Badge>
      case "UNPAID":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Unpaid</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  
  const getDeliveryStatusBadge = (status: "IN_PROCESS" | "SENDING" | "DELIVERED") => {
    switch (status) {
      case "IN_PROCESS":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">In Process</Badge>
      case "SENDING":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Sending</Badge>
      case "DELIVERED":
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Delivered</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (invoices.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-8 text-center">
          <div className="text-gray-500">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-600">Start by creating your first client invoice.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHead className="text-primary font-semibold px-6 py-4">
                Invoice #
              </TableHead>
              <TableHead className="text-primary font-semibold px-6 py-4">
                Client
              </TableHead>
              <TableHead className="text-primary font-semibold px-6 py-4 text-right">
                Amount
              </TableHead>
              <TableHead className="text-primary font-semibold px-6 py-4">
                Date Created
              </TableHead>
              <TableHead className="text-primary font-semibold px-6 py-4">
                Delivery Date
              </TableHead>
              <TableHead className="text-primary font-semibold px-6 py-4">
                Payment Status
              </TableHead>
              <TableHead className="text-primary font-semibold px-6 py-4">
                Delivery Status
              </TableHead>
              <TableHead className="text-primary font-semibold px-6 py-4 text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow 
                key={invoice.id} 
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => router.push(`/invoices/client/${invoice.id}`)}
              >
                <TableCell className="px-6 py-4 font-medium text-primary">
                  #{invoice.id.toString().padStart(5, "0")}
                </TableCell>
                <TableCell className="px-6 py-4 text-gray-700">
                  {invoice.clientName}
                </TableCell>
                <TableCell className="px-6 py-4 text-right text-gray-700 font-medium">
                  {formatCurrency(parseFloat(invoice.totalAmount.toString()))}
                </TableCell>
                <TableCell className="px-6 py-4 text-gray-700">
                  {format(new Date(invoice.dateCreated), "MMM dd, yyyy")}
                </TableCell>
                <TableCell className="px-6 py-4 text-gray-700">
                  {format(new Date(invoice.deliveryDate), "MMM dd, yyyy")}
                </TableCell>
                <TableCell className="px-6 py-4">
                  {getPaymentStatusBadge(invoice.payment_status)}
                </TableCell>
                <TableCell className="px-6 py-4">
                  {getDeliveryStatusBadge(invoice.delivery_status)}
                </TableCell>
                <TableCell className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      asChild
                      className="border-gray-300 hover:bg-gray-100"
                    >
                      <Link href={`/invoices/client/${invoice.id}`}>
                        <Eye className="h-4 w-4 text-gray-600" />
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      asChild
                      className="border-gray-300 hover:bg-gray-100"
                    >
                      <Link href={`/invoices/client/${invoice.id}/edit`}>
                        <Edit className="h-4 w-4 text-gray-600" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
