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
  sellingPrice: number
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
  clientId: number
  clientName: string
  totalAmount: number
  dateCreated: string
  validUntil: string
  status: QuoteStatus
  notes: string
  items: QuoteItem[]
}

export default function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
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
          fetch(`/api/quotes/client/${quoteId}`),
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
            updatedItem.originalPrice = product.sellingPrice
            updatedItem.unitPrice = product.sellingPrice
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
      const response = await fetch(`/api/quotes/client/${quote.id}`, {
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
        router.push(`/quotes/client/${quote.id}`)
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

  const sendToClient = async () => {
    if (!quote || items.length === 0) {
      alert("Please add at least one item")
      return
    }

    setIsSaving(true)
    try {
      // First save the quote
      const saveResponse = await fetch(`/api/quotes/client/${quote.id}`, {
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

      // Then send to client
      const sendResponse = await fetch(`/api/quotes/client/${quote.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: QuoteStatus.PENDING }),
      })

      if (sendResponse.ok) {
        router.push(`/quotes/client/${quote.id}`)
      } else {
        alert("Failed to send quote to client")
      }
    } catch (error) {
      console.error("Error sending quote:", error)
      alert("Failed to send quote to client")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading quote...</div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Quote not found</div>
      </div>
    )
  }

  if (quote.status !== QuoteStatus.DRAFT) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Only draft quotes can be edited</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/quotes/client/${quote.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              Edit Quote #{quote.id.toString().padStart(4, "0")}
            </h1>
            <p className="text-gray-600">{quote.clientName}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quote Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Quote Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="client">Client</Label>
                <Input value={quote.clientName} readOnly className="bg-gray-50" />
              </div>

              <div>
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes for the quote..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-bold text-lg text-primary">
                    ${(parseFloat(calculateTotal().toString()) || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button 
              onClick={saveQuote} 
              disabled={isSaving}
              className="w-full bg-gray-600 hover:bg-gray-700"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
            <Button 
              onClick={sendToClient} 
              disabled={isSaving}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="mr-2 h-4 w-4" />
              Save & Send to Client
            </Button>
          </div>
        </div>

        {/* Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-primary">Quote Items</CardTitle>
                <Button onClick={addItem} size="sm" className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No items added yet. Click "Add Item" to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Item {items.indexOf(item) + 1}</h4>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <Label>Product *</Label>
                          <Select
                            value={item.productId.toString()}
                            onValueChange={(value) => updateItem(item.id, 'productId', parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id.toString()}>
                                  {product.name} ({product.reference})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>

                        <div>
                          <Label>Unit Price ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        <div>
                          <Label>Total ($)</Label>
                          <Input
                            type="number"
                            value={(parseFloat(item.totalPrice.toString()) || 0).toFixed(2)}
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}