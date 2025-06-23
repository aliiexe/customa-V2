"use client";

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Eye, FileText, CheckCircle, XCircle, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { QuoteStatus } from "@/types/quote-models"
import { format } from "date-fns"

interface Quote {
  id: number
  clientName: string
  totalAmount: number
  dateCreated: string
  validUntil: string
  status: QuoteStatus
  itemsCount: number
  notes?: string
  convertedInvoiceId?: number
}

export default function ClientQuotesTable() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [sortColumn, setSortColumn] = useState("dateCreated")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    try {
      const response = await fetch("/api/quotes/client")
      if (response.ok) {
        const data = await response.json()
        setQuotes(data)
      } else {
        const errorData = await response.json()
        console.error("Failed to fetch quotes:", response.status, errorData)
        alert(`Failed to fetch quotes: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error("Error fetching quotes:", error)
      alert(`Network error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedQuotes = [...quotes].sort((a: any, b: any) => {
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]

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

  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case QuoteStatus.DRAFT:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Draft
          </Badge>
        )
      case QuoteStatus.PENDING:
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        )
      case QuoteStatus.CONFIRMED:
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Confirmed
          </Badge>
        )
      case QuoteStatus.APPROVED:
        return (
          <Badge variant="secondary" className="bg-primary text-green-800">
            Approved
          </Badge>
        );
      case QuoteStatus.REJECTED:
        return <Badge variant="destructive">Rejected</Badge>;
      case QuoteStatus.CONVERTED:
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            Converted
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSendToClient = async (quoteId: number) => {
    try {
      const response = await fetch(`/api/quotes/client/${quoteId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: QuoteStatus.PENDING }),
      })

      if (response.ok) {
        fetchQuotes() // Refresh the list
      } else {
        alert("Failed to send quote to client")
      }
    } catch (error) {
      console.error("Error sending quote:", error)
      alert("Failed to send quote to client")
    }
  }

  const handleConfirmQuote = async (quoteId: number) => {
    try {
      const response = await fetch(`/api/quotes/client/${quoteId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: QuoteStatus.CONFIRMED }),
      })

      if (response.ok) {
        fetchQuotes() // Refresh the list
      } else {
        alert("Failed to confirm quote")
      }
    } catch (error) {
      console.error("Error confirming quote:", error)
      alert("Failed to confirm quote")
    }
  }

  const handleConvertToInvoice = async (quoteId: number) => {
    try {
      const response = await fetch(`/api/quotes/client/${quoteId}/convert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deliveryDate: new Date().toISOString().split('T')[0] }),
      })

      if (response.ok) {
        const result = await response.json()
        window.location.href = `/invoices/client/${result.invoiceId}`
      } else {
        alert("Failed to convert quote to invoice")
      }
    } catch (error) {
      console.error("Error converting quote:", error)
      alert("Failed to convert quote to invoice")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg">Loading quotes...</div>
      </div>
    )
  }

  return (
    <div className="rounded-md border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="text-primary font-semibold">
              Quote #
            </TableHead>
            <TableHead
              className="cursor-pointer text-primary font-semibold"
              onClick={() => handleSort("clientName")}
            >
              Client{" "}
              {sortColumn === "clientName" &&
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
              Created{" "}
              {sortColumn === "dateCreated" &&
                (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              className="cursor-pointer text-primary font-semibold"
              onClick={() => handleSort("validUntil")}
            >
              Valid Until{" "}
              {sortColumn === "validUntil" &&
                (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              className="cursor-pointer text-primary font-semibold"
              onClick={() => handleSort("status")}
            >
              Status{" "}
              {sortColumn === "status" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead className="text-primary font-semibold">Items</TableHead>
            <TableHead className="text-primary font-semibold">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedQuotes.map((quote) => (
            <TableRow key={quote.id} className="hover:bg-gray-50">
              <TableCell className="font-medium text-green-600">QUO-{quote.id.toString().padStart(4, "0")}</TableCell>
              <TableCell className="text-gray-700">{quote.clientName}</TableCell>
              <TableCell className="text-right text-gray-700">${Number(quote.totalAmount).toFixed(2)}</TableCell>
              <TableCell className="text-gray-700">{format(new Date(quote.dateCreated), "MMM dd, yyyy")}</TableCell>
              <TableCell className="text-gray-700">{format(new Date(quote.validUntil), "MMM dd, yyyy")}</TableCell>
              <TableCell>{getStatusBadge(quote.status)}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-gray-600">
                  {quote.itemsCount} items
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    asChild
                    className="border-gray-300 hover:bg-gray-100"
                  >
                    <Link href={`/quotes/client/${quote.id}`}>
                      <Eye className="h-4 w-4 text-gray-600" />
                    </Link>
                  </Button>

                  {quote.status === QuoteStatus.DRAFT && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                        className="border-gray-300 hover:bg-gray-100"
                      >
                        <Link href={`/quotes/client/${quote.id}/edit`}>
                          <Edit className="h-4 w-4 text-gray-600" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleSendToClient(quote.id)}
                        className="border-green-300 hover:bg-green-50"
                      >
                        <Send className="h-4 w-4 text-green-600" />
                      </Button>
                    </>
                  )}

                  {quote.status === QuoteStatus.PENDING && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleConfirmQuote(quote.id)}
                      className="border-blue-300 hover:bg-blue-50"
                    >
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    </Button>
                  )}

                  {(quote.status === QuoteStatus.CONFIRMED || quote.status === QuoteStatus.APPROVED) && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleConvertToInvoice(quote.id)}
                      className="border-purple-300 hover:bg-purple-50"
                    >
                      <FileText className="h-4 w-4 text-purple-600" />
                    </Button>
                  )}

                  {quote.status === QuoteStatus.CONVERTED &&
                    quote.convertedInvoiceId && (
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                        className="border-blue-300 hover:bg-blue-50"
                      >
                        <Link
                          href={`/invoices/client/${quote.convertedInvoiceId}`}
                        >
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
  );
}
