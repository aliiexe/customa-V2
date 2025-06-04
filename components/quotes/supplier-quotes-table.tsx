"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Eye, FileText, CheckCircle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { QuoteStatus } from "@/types/quote-models"
import { format } from "date-fns"

// Mock data - would be fetched from API in real implementation
const supplierQuotes = [
  {
    id: 1,
    supplierName: "TechSupplier Inc.",
    totalAmount: 1200.0,
    dateCreated: new Date("2023-11-20"),
    validUntil: new Date("2023-12-20"),
    status: QuoteStatus.PENDING,
    itemsCount: 2,
    notes: "Bulk purchase request",
  },
  {
    id: 2,
    supplierName: "DisplayTech Ltd.",
    totalAmount: 850.5,
    dateCreated: new Date("2023-11-18"),
    validUntil: new Date("2023-12-18"),
    status: QuoteStatus.APPROVED,
    itemsCount: 1,
    notes: "Standard supplier pricing",
  },
  {
    id: 3,
    supplierName: "SoundWave Co.",
    totalAmount: 2100.0,
    dateCreated: new Date("2023-11-15"),
    validUntil: new Date("2023-12-15"),
    status: QuoteStatus.CONVERTED,
    itemsCount: 3,
    notes: "Converted to Purchase Order #PO-0003",
    convertedInvoiceId: 3,
  },
]

export default function SupplierQuotesTable() {
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

  const sortedQuotes = [...supplierQuotes].sort((a: any, b: any) => {
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

  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case QuoteStatus.PENDING:
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        )
      case QuoteStatus.APPROVED:
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        )
      case QuoteStatus.REJECTED:
        return <Badge variant="destructive">Rejected</Badge>
      case QuoteStatus.CONVERTED:
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Converted
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleConvertToInvoice = (quoteId: number) => {
    console.log(`Converting supplier quote ${quoteId} to purchase order`)
  }

  const handleApproveQuote = (quoteId: number) => {
    console.log(`Approving supplier quote ${quoteId}`)
  }

  const handleRejectQuote = (quoteId: number) => {
    console.log(`Rejecting supplier quote ${quoteId}`)
  }

  return (
    <div className="rounded-md border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="text-green-600 font-semibold">Quote #</TableHead>
            <TableHead
              className="cursor-pointer text-green-600 font-semibold"
              onClick={() => handleSort("supplierName")}
            >
              Supplier {sortColumn === "supplierName" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              className="cursor-pointer text-right text-green-600 font-semibold"
              onClick={() => handleSort("totalAmount")}
            >
              Amount {sortColumn === "totalAmount" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              className="cursor-pointer text-green-600 font-semibold"
              onClick={() => handleSort("dateCreated")}
            >
              Created {sortColumn === "dateCreated" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead className="cursor-pointer text-green-600 font-semibold" onClick={() => handleSort("validUntil")}>
              Valid Until {sortColumn === "validUntil" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead className="cursor-pointer text-green-600 font-semibold" onClick={() => handleSort("status")}>
              Status {sortColumn === "status" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead className="text-green-600 font-semibold">Items</TableHead>
            <TableHead className="text-green-600 font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedQuotes.map((quote) => (
            <TableRow key={quote.id} className="hover:bg-gray-50">
              <TableCell className="font-medium text-green-600">SQU-{quote.id.toString().padStart(4, "0")}</TableCell>
              <TableCell className="text-gray-700">{quote.supplierName}</TableCell>
              <TableCell className="text-right text-gray-700">${quote.totalAmount.toFixed(2)}</TableCell>
              <TableCell className="text-gray-700">{format(quote.dateCreated, "MMM dd, yyyy")}</TableCell>
              <TableCell className="text-gray-700">{format(quote.validUntil, "MMM dd, yyyy")}</TableCell>
              <TableCell>{getStatusBadge(quote.status)}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-gray-600">
                  {quote.itemsCount} items
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" asChild className="border-gray-300 hover:bg-gray-100">
                    <Link href={`/quotes/supplier/${quote.id}`}>
                      <Eye className="h-4 w-4 text-gray-600" />
                    </Link>
                  </Button>

                  {quote.status === QuoteStatus.PENDING && (
                    <>
                      <Button variant="outline" size="icon" asChild className="border-gray-300 hover:bg-gray-100">
                        <Link href={`/quotes/supplier/${quote.id}/edit`}>
                          <Edit className="h-4 w-4 text-gray-600" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleApproveQuote(quote.id)}
                        className="border-green-300 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRejectQuote(quote.id)}
                        className="border-red-300 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 text-red-600" />
                      </Button>
                    </>
                  )}

                  {quote.status === QuoteStatus.APPROVED && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleConvertToInvoice(quote.id)}
                      className="border-blue-300 hover:bg-blue-50"
                    >
                      <FileText className="h-4 w-4 text-blue-600" />
                    </Button>
                  )}

                  {quote.status === QuoteStatus.CONVERTED && quote.convertedInvoiceId && (
                    <Button variant="outline" size="icon" asChild className="border-blue-300 hover:bg-blue-50">
                      <Link href={`/invoices/supplier/${quote.convertedInvoiceId}`}>
                        <FileText className="h-4 w-4 text-blue-600" />
                      </Link>
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
