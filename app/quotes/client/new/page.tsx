"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

interface Client {
  id: number
  name: string
  email: string
}

interface QuoteItem {
  id: string
  productId: number
  productName: string
  productReference: string
  originalPrice: number
  unitPrice: number
  quantity: number
  totalPrice: number
}

export default function NewClientQuotePage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [validUntil, setValidUntil] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [items, setItems] = useState<QuoteItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load clients and products on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsRes, productsRes] = await Promise.all([
          fetch("/api/clients"),
          fetch("/api/products")
        ])
        
        if (clientsRes.ok) {
          const clientsData = await clientsRes.json()
          setClients(clientsData)
        }
        
        if (productsRes.ok) {
          const productsData = await productsRes.json()
          setProducts(productsData)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }
    
    loadData()
  }, [])

  // Set default valid until date (30 days from now)
  useEffect(() => {
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    setValidUntil(thirtyDaysFromNow.toISOString().split('T')[0])
  }, [])

  const addItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
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

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId))
  }

  const updateItem = (itemId: string, field: keyof QuoteItem, value: any) => {
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
    return items.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  const saveAsDraft = async () => {
    if (!selectedClient || items.length === 0) {
      alert("Please select a client and add at least one item")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/quotes/client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: parseInt(selectedClient),
          validUntil: validUntil ? new Date(validUntil) : null,
          notes,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }))
        }),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/quotes/client/${result.id}`)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to save quote")
      }
    } catch (error) {
      console.error("Error saving quote:", error)
      alert("Failed to save quote")
    } finally {
      setIsLoading(false)
    }
  }

  const sendToClient = async () => {
    if (!selectedClient || items.length === 0) {
      alert("Please select a client and add at least one item")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/quotes/client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: parseInt(selectedClient),
          validUntil: validUntil ? new Date(validUntil) : null,
          notes,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          })),
          status: QuoteStatus.PENDING
        }),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/quotes/client/${result.id}`)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to send quote")
      }
    } catch (error) {
      console.error("Error sending quote:", error)
      alert("Failed to send quote")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/quotes/client">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-green-600">Create New Quote</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quote Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Quote Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="client">Client *</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <CardTitle className="text-green-600">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-bold text-lg text-green-600">
                    ${(parseFloat(calculateTotal().toString()) || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button 
              onClick={saveAsDraft} 
              disabled={isLoading}
              className="w-full bg-gray-600 hover:bg-gray-700"
            >
              <Save className="mr-2 h-4 w-4" />
              Save as Draft
            </Button>
            <Button 
              onClick={sendToClient} 
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Send className="mr-2 h-4 w-4" />
              Send to Client
            </Button>
          </div>
        </div>

        {/* Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-600">Quote Items</CardTitle>
                <Button onClick={addItem} size="sm">
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