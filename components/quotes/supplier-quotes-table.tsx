"use client";

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Eye, FileText, CheckCircle, XCircle, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { QuoteStatus } from "@/types/quote-models"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

export default function SupplierQuotesTable() {
  const router = useRouter()
  const [quotes, setQuotes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortColumn, setSortColumn] = useState("dateCreated")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    try {
      const response = await fetch("/api/quotes/supplier")
      if (!response.ok) {
        throw new Error("Failed to fetch quotes")
      }
      const data = await response.json()
      setQuotes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching quotes")
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
      case QuoteStatus.PENDING:
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
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
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Converted
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleConvertToInvoice = async (quoteId: number) => {
    try {
      const response = await fetch(`/api/quotes/supplier/${quoteId}/convert`, {
        method: "POST",
      })
      
      if (!response.ok) {
        throw new Error("Failed to convert quote to invoice")
      }
      
      // Refresh the quotes list and router
      fetchQuotes()
      router.refresh()
    } catch (err) {
      console.error("Error converting quote to invoice:", err)
      // You might want to show an error toast here
    }
  }

  const handleApproveQuote = async (quoteId: number) => {
    try {
      const response = await fetch(`/api/quotes/supplier/${quoteId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: QuoteStatus.APPROVED }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to approve quote")
      }
      
      // Refresh the quotes list and router
      fetchQuotes()
      router.refresh()
    } catch (err) {
      console.error("Error approving quote:", err)
      // You might want to show an error toast here
    }
  }

  const handleRejectQuote = async (quoteId: number) => {
    try {
      const response = await fetch(`/api/quotes/supplier/${quoteId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: QuoteStatus.REJECTED }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to reject quote")
      }
      
      // Refresh the quotes list and router
      fetchQuotes()
      router.refresh()
    } catch (err) {
      console.error("Error rejecting quote:", err)
      // You might want to show an error toast here
    }
  }

  const handleSendToSupplier = async (quoteId: number) => {
    try {
      const response = await fetch(`/api/quotes/supplier/${quoteId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: QuoteStatus.PENDING }),
      })
      if (response.ok) {
        fetchQuotes()
      } else {
        // Optionally show error
      }
    } catch (error) {
      // Optionally show error
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-md border bg-white p-8 text-center">
        <div className="text-gray-500">Loading quotes...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border bg-white p-8">
        <div className="text-red-500">{error}</div>
        <Button onClick={fetchQuotes} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  if (quotes.length === 0) {
    return (
      <div className="rounded-md border bg-white p-8 text-center">
        <div className="text-gray-500">No supplier quotes found</div>
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
              <TableCell className="font-medium text-green-600">SQU-{quote.id.toString().padStart(4, "0")}</TableCell>
              <TableCell className="text-gray-700">{quote.supplierName}</TableCell>
              <TableCell className="text-right text-gray-700">
                ${(Number(quote.totalAmount) || 0).toFixed(2)}
              </TableCell>
              <TableCell className="text-gray-700">{format(new Date(quote.dateCreated), "MMM dd, yyyy")}</TableCell>
              <TableCell className="text-gray-700">{format(new Date(quote.validUntil), "MMM dd, yyyy")}</TableCell>
              <TableCell>{getStatusBadge(quote.status)}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-gray-600">
                  {quote.itemsCount || 0} items
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
                    <Link href={`/quotes/supplier/${quote.id}`}>
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
                        <Link href={`/quotes/supplier/${quote.id}/edit`}>
                          <Edit className="h-4 w-4 text-gray-600" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleSendToSupplier(quote.id)}
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
                      onClick={() => handleApproveQuote(quote.id)}
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
                          href={`/invoices/supplier/${quote.convertedInvoiceId}`}
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
