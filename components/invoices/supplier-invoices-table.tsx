"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Eye, Download, CheckCircle, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"

interface Invoice {
  id: number
  supplierName: string
  totalAmount: number | string
  dateCreated: string
  deliveryDate: string
  payment_status: "PAID" | "UNPAID"
  delivery_status: "IN_PROCESS" | "SENDING" | "DELIVERED"
  itemCount?: number
}

interface SupplierInvoicesTableProps {
  invoices: Invoice[]
  isLoading: boolean
  onInvoicesChange: () => void
}

export default function SupplierInvoicesTable({ 
  invoices, 
  isLoading, 
  onInvoicesChange 
}: SupplierInvoicesTableProps) {
  const router = useRouter()
  const [sortColumn, setSortColumn] = useState("dateCreated")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedInvoices = [...invoices].sort((a: any, b: any) => {
    let aValue = a[sortColumn]
    let bValue = b[sortColumn]

    // Handle totalAmount specifically
    if (sortColumn === "totalAmount") {
      aValue = parseFloat(aValue.toString()) || 0;
      bValue = parseFloat(bValue.toString()) || 0;
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === "asc"
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    } else if (typeof aValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
  });

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg">Loading invoices...</div>
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
          <p className="text-gray-600">Try adjusting your filters or create a new invoice.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="text-primary font-semibold">
              Invoice #
            </TableHead>
            <TableHead
              className="cursor-pointer text-primary font-semibold"
              onClick={() => handleSort("supplierName")}
            >
              Supplier{" "}
              {sortColumn === "supplierName" &&
                (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              className="cursor-pointer text-right text-primary font-semibold"
              onClick={() => handleSort("totalAmount")}
            >
              Amount{" "}
              {sortColumn === "totalAmount" &&
                (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              className="cursor-pointer text-primary font-semibold"
              onClick={() => handleSort("dateCreated")}
            >
              Date Created{" "}
              {sortColumn === "dateCreated" &&
                (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              className="cursor-pointer text-primary font-semibold"
              onClick={() => handleSort("deliveryDate")}
            >
              Delivery Date{" "}
              {sortColumn === "deliveryDate" &&
                (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead className="text-primary font-semibold">
              Payment Status
            </TableHead>
            <TableHead className="text-primary font-semibold">
              Delivery Status
            </TableHead>
            <TableHead className="text-primary font-semibold text-center">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedInvoices.map((invoice) => (
            <TableRow 
              key={invoice.id} 
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => router.push(`/invoices/supplier/${invoice.id}`)}
            >
              <TableCell className="font-medium text-primary">
                SUP-{invoice.id.toString().padStart(4, "0")}
              </TableCell>
              <TableCell className="text-gray-700">
                {invoice.supplierName}
              </TableCell>
              <TableCell className="text-right text-gray-700 font-medium">
                ${parseFloat(invoice.totalAmount.toString()).toFixed(2)}
              </TableCell>
              <TableCell className="text-gray-700">
                {format(new Date(invoice.dateCreated), "MMM dd, yyyy")}
              </TableCell>
              <TableCell className="text-gray-700">
                {format(new Date(invoice.deliveryDate), "MMM dd, yyyy")}
              </TableCell>
              <TableCell>
                {getPaymentStatusBadge(invoice.payment_status)}
              </TableCell>
              <TableCell>
                {getDeliveryStatusBadge(invoice.delivery_status)}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    asChild
                    className="border-gray-300 hover:bg-gray-100"
                  >
                    <Link href={`/invoices/supplier/${invoice.id}`}>
                      <Eye className="h-4 w-4 text-gray-600" />
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    asChild
                    className="border-gray-300 hover:bg-gray-100"
                  >
                    <Link href={`/invoices/supplier/${invoice.id}/edit`}>
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
  )
}