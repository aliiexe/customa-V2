"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ArrowLeft, Send, CheckCircle } from "lucide-react"
import Link from "next/link"

interface InvoiceItem {
  id: number
  productId: number
  productName: string
  productReference: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Invoice {
  id: number
  supplierId: number
  supplierName: string
  supplierEmail: string
  supplierAddress: string
  totalAmount: number
  dateCreated: string
  status: "in_process" | "sent" | "received"
  items: InvoiceItem[]
}

export default function SupplierInvoicePage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoice()
  }, [])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/supplier/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setInvoice(data)
      }
    } catch (error) {
      console.error("Error fetching invoice:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/invoices/supplier/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updatedInvoice = await response.json()
        setInvoice(updatedInvoice)
      }
    } catch (error) {
      console.error("Error updating invoice status:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_process":
        return <Badge className="bg-yellow-100 text-yellow-800">In Process</Badge>
      case "sent":
        return <Badge className="bg-blue-100 text-blue-800">Sent</Badge>
      case "received":
        return <Badge className="bg-green-100 text-green-800">Received</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!invoice) {
    return <div>Invoice not found</div>
  }

  return (
    <div className="space-y-6 p-6 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/invoices/supplier">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-blue-600">
            Invoice #{invoice.id.toString().padStart(5, "0")}
          </h1>
        </div>
        <div className="flex space-x-2">
          {invoice.status === "in_process" && (
            <Button onClick={() => handleStatusUpdate("sent")} className="bg-blue-600 hover:bg-blue-700">
              <Send className="mr-2 h-4 w-4" />
              Mark as Sent
            </Button>
          )}
          {invoice.status === "sent" && (
            <Button onClick={() => handleStatusUpdate("received")} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Received
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Supplier Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-semibold">{invoice.supplierName}</p>
              <p>{invoice.supplierEmail}</p>
              <p className="whitespace-pre-line">{invoice.supplierAddress}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold">Status:</span>
                {getStatusBadge(invoice.status)}
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Date Created:</span>
                <span>{format(new Date(invoice.dateCreated), "MMM dd, yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Total Amount:</span>
                <span>${Number(invoice.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.productReference}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">${Number(item.unitPrice || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right">${Number(item.totalPrice || 0).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} className="text-right font-semibold">
                  Total:
                </TableCell>
                <TableCell className="text-right font-semibold">${Number(invoice.totalAmount || 0).toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 