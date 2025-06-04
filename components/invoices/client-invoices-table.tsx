"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Eye, Download, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { InvoiceStatus } from "@/types/models"
import { format } from "date-fns"

// Mock data - would be fetched from API in real implementation
const clientInvoices = [
  {
    id: 1,
    clientName: "Acme Corporation",
    totalAmount: 2340.0,
    dateCreated: new Date("2023-11-15"),
    deliveryDate: new Date("2023-11-20"),
    status: InvoiceStatus.UNPAID,
    itemsCount: 3,
  },
  {
    id: 2,
    clientName: "Global Tech Solutions",
    totalAmount: 1875.5,
    dateCreated: new Date("2023-11-10"),
    deliveryDate: new Date("2023-11-15"),
    status: InvoiceStatus.PAID,
    itemsCount: 2,
  },
  {
    id: 3,
    clientName: "StartUp Dynamics",
    totalAmount: 4200.0,
    dateCreated: new Date("2023-11-08"),
    deliveryDate: new Date("2023-11-12"),
    status: InvoiceStatus.UNPAID,
    itemsCount: 5,
  },
  {
    id: 4,
    clientName: "Acme Corporation",
    totalAmount: 950.25,
    dateCreated: new Date("2023-11-05"),
    deliveryDate: new Date("2023-11-10"),
    status: InvoiceStatus.PAID,
    itemsCount: 1,
  },
]

export default function ClientInvoicesTable() {
  const [sortColumn, setSortColumn] = useState("dateCreated")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const sortedInvoices = [...clientInvoices].sort((a: any, b: any) => {
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]

    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === "asc" ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime()
    } else if (typeof aValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    } else {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }
  })

  const handleMarkAsPaid = (invoiceId: number) => {
    // In a real implementation, this would call the API to update the invoice status
    console.log(`Marking invoice ${invoiceId} as paid`)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("clientName")}>
              Client {sortColumn === "clientName" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead className="cursor-pointer text-right" onClick={() => handleSort("totalAmount")}>
              Amount {sortColumn === "totalAmount" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("dateCreated")}>
              Created {sortColumn === "dateCreated" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("deliveryDate")}>
              Due Date {sortColumn === "deliveryDate" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
              Status {sortColumn === "status" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedInvoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">INV-{invoice.id.toString().padStart(4, "0")}</TableCell>
              <TableCell>{invoice.clientName}</TableCell>
              <TableCell className="text-right">${invoice.totalAmount.toFixed(2)}</TableCell>
              <TableCell>{format(invoice.dateCreated, "MMM dd, yyyy")}</TableCell>
              <TableCell>{format(invoice.deliveryDate, "MMM dd, yyyy")}</TableCell>
              <TableCell>
                <Badge variant={invoice.status === InvoiceStatus.PAID ? "default" : "destructive"}>
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{invoice.itemsCount} items</Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" asChild>
                    <Link href={`/invoices/client/${invoice.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <Link href={`/invoices/client/${invoice.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                  {invoice.status === InvoiceStatus.UNPAID && (
                    <Button variant="outline" size="icon" onClick={() => handleMarkAsPaid(invoice.id)}>
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
