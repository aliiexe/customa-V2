"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Save, Send, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { QuoteStatus } from "@/types/quote-models"

interface Product {
  id: number
  name: string
  reference: string
  supplierPrice: number
  stockQuantity: number
}

interface QuoteItem {
  id: number
  productId: number
  productName: string
  productReference: string
  originalPrice: number
  unitPrice: number
  quantity: number
  totalPrice: number
}

interface Quote {
  id: number
  supplierId: number
  supplierName: string
  totalAmount: number
  dateCreated: string
  validUntil: string
  status: QuoteStatus
  notes: string
  items: QuoteItem[]
}

export default function EditSupplierQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: quoteId } = use(params)
  const router = useRouter()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [validUntil, setValidUntil] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [items, setItems] = useState<QuoteItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [quoteRes, productsRes] = await Promise.all([
          fetch(`/api/quotes/supplier/${quoteId}`),
          fetch("/api/products")
        ])
        
        if (quoteRes.ok) {
          const quoteData = await quoteRes.json()
          setQuote(quoteData)
          setValidUntil(quoteData.validUntil ? new Date(quoteData.validUntil).toISOString().split('T')[0] : "")
          setNotes(quoteData.notes || "")
          setItems(quoteData.items || [])
        }
        
        if (productsRes.ok) {
          const productsData = await productsRes.json()
          setProducts(productsData)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [quoteId])

  const addItem = () => {
    const newItem: QuoteItem = {
      id: Date.now(),
      productId: 0,
      productName: "",
      productReference: "",
      originalPrice: 0,
      unitPrice: 0,
      quantity: 1,
      totalPrice: 0
    }
    setItems([...items, newItem])
  }

  const removeItem = (itemId: number) => {
    setItems(items.filter(item => item.id !== itemId))
  }

  const updateItem = (itemId: number, field: keyof QuoteItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value }
        if (field === 'productId') {
          const product = products.find(p => p.id === value)
          if (product) {
            updatedItem.productName = product.name
            updatedItem.productReference = product.reference
            updatedItem.originalPrice = product.supplierPrice
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
    const total = items.reduce((sum, item) => sum + (parseFloat(item.totalPrice.toString()) || 0), 0)
    return isNaN(total) ? 0 : total
  }

  const saveQuote = async () => {
    if (!quote || items.length === 0) {
      alert("Please add at least one item")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/quotes/supplier/${quote.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          validUntil: validUntil ? new Date(validUntil) : null,
          notes,
          items: items.map(item => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }))
        }),
      })

      if (response.ok) {
        router.push(`/quotes/supplier/${quote.id}`)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to save quote")
      }
    } catch (error) {
      console.error("Error saving quote:", error)
      alert("Failed to save quote")
    } finally {
      setIsSaving(false)
    }
  }

  const sendToSupplier = async () => {
    if (!quote || items.length === 0) {
      alert("Please add at least one item")
      return
    }

    setIsSaving(true)
    try {
      // First save the quote
      const saveResponse = await fetch(`/api/quotes/supplier/${quote.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          validUntil: validUntil ? new Date(validUntil) : null,
          notes,
          items: items.map(item => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }))
        }),
      })

      if (!saveResponse.ok) {
        throw new Error("Failed to save quote")
      }

      // Then update status
      const statusResponse = await fetch(`/api/quotes/supplier/${quote.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: QuoteStatus.PENDING }),
      })

      if (statusResponse.ok) {
        router.push(`/quotes/supplier/${quote.id}`)
      } else {
        const error = await statusResponse.json()
        alert(error.error || "Failed to send quote to supplier")
      }
    } catch (error) {
      console.error("Error sending quote:", error)
      alert("Failed to send quote to supplier")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>
  }

  if (!quote) {
    return <div className="p-8 text-center text-red-500">Quote not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Supplier Quote</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <Label>Supplier</Label>
              <div className="font-semibold text-green-700">{quote.supplierName}</div>
            </div>
            <Button asChild variant="outline">
              <Link href="/quotes/supplier">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Link>
            </Button>
          </div>

          <div className="mb-4">
            <Label>Valid Until</Label>
            <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
          </div>

          <div className="mb-4">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Items</Label>
              <Button type="button" variant="outline" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </div>
            {items.map(item => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-2 p-2 border rounded-md">
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
                    onChange={e => updateItem(item.id, "quantity", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unitPrice}
                    onChange={e => updateItem(item.id, "unitPrice", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Total</Label>
                  <div className="font-semibold">${(item.unitPrice * item.quantity).toFixed(2)}</div>
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

          <div className="mb-4 flex justify-end">
            <div className="text-lg font-bold">Total: ${calculateTotal().toFixed(2)}</div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={saveQuote}
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
            <Button
              type="button"
              onClick={sendToSupplier}
              disabled={isSaving}
            >
              <Send className="mr-2 h-4 w-4" /> Send to Supplier
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 