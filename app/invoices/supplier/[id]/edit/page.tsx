"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface Product {
  id: number;
  name: string;
  reference: string;
  supplierPrice: number;
}

interface InvoiceItem {
  id: number;
  productId: number;
  productName: string;
  productReference: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Invoice {
  id: number;
  supplierId: number;
  supplierName: string;
  totalAmount: number;
  dateCreated: string;
  deliveryDate: string;
  payment_status: "PAID" | "UNPAID";
  delivery_status: "IN_PROCESS" | "SENDING" | "DELIVERED";
  items: InvoiceItem[];
}

export default function EditSupplierInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: invoiceId } = use(params)
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [deliveryDate, setDeliveryDate] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"PAID" | "UNPAID">("UNPAID")
  const [deliveryStatus, setDeliveryStatus] = useState<"IN_PROCESS" | "SENDING" | "DELIVERED">("IN_PROCESS")

  useEffect(() => {
    const loadData = async () => {
      try {
        const [invoiceRes, productsRes, suppliersRes] = await Promise.all([
          fetch(`/api/invoices/supplier/${invoiceId}`),
          fetch("/api/products"),
          fetch("/api/suppliers")
        ])
        
        if (invoiceRes.ok) {
          const invoiceData = await invoiceRes.json()
          setInvoice(invoiceData)
          setItems(invoiceData.items || [])
          setDeliveryDate(new Date(invoiceData.deliveryDate).toISOString().split('T')[0])
          setPaymentStatus(invoiceData.payment_status)
          setDeliveryStatus(invoiceData.delivery_status)
          setNotes(invoiceData.notes || "")
        }
        
        if (productsRes.ok) {
          const productsData = await productsRes.json()
          setProducts(productsData)
        }
        
        if (suppliersRes.ok) {
          const suppliersData = await suppliersRes.json()
          setSuppliers(suppliersData)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [invoiceId])

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now(),
      productId: 0,
      productName: "",
      productReference: "",
      unitPrice: 0,
      quantity: 1,
      totalPrice: 0
    }
    setItems([...items, newItem])
  }
  
  const removeItem = (itemId: number) => {
    setItems(items.filter(item => item.id !== itemId))
  }

  const updateItem = (itemId: number, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value }
        if (field === 'productId') {
          const product = products.find(p => p.id === value)
          if (product) {
            updatedItem.productName = product.name
            updatedItem.productReference = product.reference
            updatedItem.unitPrice = product.supplierPrice
          }
        }
        if (field === 'unitPrice' || field === 'quantity') {
          updatedItem.totalPrice = updatedItem.unitPrice * updatedItem.quantity
        }
        return updatedItem
      }
      return item
    }))
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
  }

  const saveInvoice = async () => {
    if (!invoice || items.length === 0) {
      alert("Please add at least one item")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/invoices/supplier/${invoice.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deliveryDate,
          payment_status: paymentStatus,
          delivery_status: deliveryStatus,
          notes,
          totalAmount: calculateTotal(),
          items: items.map(item => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice
          }))
        }),
      })

      if (response.ok) {
        router.push(`/invoices/supplier/${invoice.id}`)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to save invoice")
      }
    } catch (error) {
      console.error("Error saving invoice:", error)
      alert("Failed to save invoice")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading invoice data...</div>
  }

  if (!invoice) {
    return <div className="p-8 text-center text-red-500">Invoice not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="icon" 
              asChild
              className="shadow-sm border-gray-200 hover:bg-gray-50"
            >
              <Link href={`/invoices/supplier/${invoice.id}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                Edit Supplier Invoice #{invoice.id.toString().padStart(4, "0")}
              </h1>
              <p className="mt-2 text-gray-600">
                Update invoice details and items
              </p>
            </div>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label>Supplier</Label>
                <div className="font-semibold text-primary mt-1">{invoice.supplierName}</div>
              </div>
              
              <div>
                <Label>Created Date</Label>
                <div className="font-semibold mt-1">
                  {format(new Date(invoice.dateCreated), "MMMM dd, yyyy")}
                </div>
              </div>
              
              <div>
                <Label>Delivery Date</Label>
                <Input 
                  type="date" 
                  value={deliveryDate} 
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Status</Label>
                <div className="grid grid-cols-2 gap-4 mt-1">
                  <div>
                    <Label className="text-sm">Payment</Label>
                    <Select value={paymentStatus} onValueChange={(value: "PAID" | "UNPAID") => setPaymentStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UNPAID">Unpaid</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Delivery</Label>
                    <Select value={deliveryStatus} onValueChange={(value: "IN_PROCESS" | "SENDING" | "DELIVERED") => setDeliveryStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IN_PROCESS">In Process</SelectItem>
                        <SelectItem value="SENDING">Sending</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <Label>Notes</Label>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
                placeholder="Enter any notes about this invoice"
              />
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-semibold text-primary">Invoice Items</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addItem} 
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              </div>
              
              {items.map(item => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-4 border rounded-md">
                  <div>
                    <Label>Product</Label>
                    <Select
                      value={item.productId ? item.productId.toString() : ""}
                      onValueChange={val => updateItem(item.id, "productId", Number(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={e => updateItem(item.id, "quantity", Number(e.target.value) || 1)}
                    />
                  </div>
                  
                  <div>
                    <Label>Unit Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice}
                      onChange={e => updateItem(item.id, "unitPrice", Number(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div>
                    <Label>Total ($)</Label>
                    <div className="p-2 bg-gray-50 border rounded-md mt-1 font-medium">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <div className="text-lg font-bold">Total: ${calculateTotal().toFixed(2)}</div>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/invoices/supplier/${invoice.id}`)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={saveInvoice}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isSaving ? (
                    <>
                      <span className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}