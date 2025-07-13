"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Trash2, DollarSign, Calendar, User, FileText } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Client {
  id: number
  name: string
  email: string
  address: string
}

interface Product {
  id: number
  name: string
  reference: string
  sellingPrice: number
  stockQuantity: number
}

interface InvoiceItem {
  productId: number
  productName: string
  productReference: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export default function NewClientInvoicePage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [deliveryDate, setDeliveryDate] = useState<string>("")
  const [items, setItems] = useState<InvoiceItem[]>([])
  
  // New item form
  const [selectedProductId, setSelectedProductId] = useState<string>("")
  const [itemQuantity, setItemQuantity] = useState<number>(1)
  const [itemUnitPrice, setItemUnitPrice] = useState<number>(0)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch clients
        const clientsResponse = await fetch("/api/clients")
        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json()
          setClients(clientsData)
        }

        // Fetch products
        const productsResponse = await fetch("/api/products")
        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          setProducts(productsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Update unit price when product is selected
  useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p.id.toString() === selectedProductId)
      if (product) {
        setItemUnitPrice(product.sellingPrice)
      }
    }
  }, [selectedProductId, products])

  const handleAddItem = () => {
    if (!selectedProductId || itemQuantity <= 0 || itemUnitPrice <= 0) {
      alert("Please select a product and enter valid quantity and unit price")
      return
    }

    const product = products.find(p => p.id.toString() === selectedProductId)
    if (!product) return

    const newItem: InvoiceItem = {
      productId: product.id,
      productName: product.name,
      productReference: product.reference,
      quantity: itemQuantity,
      unitPrice: itemUnitPrice,
      totalPrice: itemQuantity * itemUnitPrice
    }

    setItems([...items, newItem])
    
    // Reset form
    setSelectedProductId("")
    setItemQuantity(1)
    setItemUnitPrice(0)
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleQuantityChange = (index: number, newQuantity: number) => {
    const updatedItems = [...items]
    updatedItems[index].quantity = newQuantity
    updatedItems[index].totalPrice = newQuantity * updatedItems[index].unitPrice
    setItems(updatedItems)
  }

  const handleUnitPriceChange = (index: number, newUnitPrice: number) => {
    const updatedItems = [...items]
    updatedItems[index].unitPrice = newUnitPrice
    updatedItems[index].totalPrice = updatedItems[index].quantity * newUnitPrice
    setItems(updatedItems)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  const handleSubmit = async () => {
    if (!selectedClientId) {
      alert("Please select a client")
      return
    }

    if (items.length === 0) {
      alert("Please add at least one item")
      return
    }

    if (!deliveryDate) {
      alert("Please select a delivery date")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/invoices/client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: parseInt(selectedClientId),
          totalAmount: calculateTotal(),
          deliveryDate: deliveryDate,
          items: items,
          payment_status: "UNPAID",
          delivery_status: "IN_PROCESS"
        }),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/invoices/client/${result.id}`)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create invoice")
      }
    } catch (error) {
      console.error("Error creating invoice:", error)
      alert("Failed to create invoice")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
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
              <Link href="/invoices/client">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Create New Invoice</h1>
              <p className="mt-2 text-gray-600">Create a new client invoice</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invoice Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Client Selection */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="bg-primary/5 border-b border-gray-100">
                <CardTitle className="text-primary flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label htmlFor="client">Client *</Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
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
                  <Label htmlFor="deliveryDate">Delivery Date *</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Add Item Form */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-100">
                <CardTitle className="text-gray-700">Add Item</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label htmlFor="product">Product *</Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name} ({product.reference}) - Stock: {product.stockQuantity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitPrice">Unit Price *</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemUnitPrice}
                      onChange={(e) => setItemUnitPrice(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddItem}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </CardContent>
            </Card>

            {/* Total */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-100">
                <CardTitle className="text-gray-700 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Total Amount
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(calculateTotal())}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Card className="shadow-sm border-gray-200">
              <CardContent className="pt-6">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || items.length === 0 || !selectedClientId || !deliveryDate}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isSubmitting ? "Creating Invoice..." : "Create Invoice"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Items */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="bg-primary/5 border-b border-gray-100">
                <CardTitle className="text-primary flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Invoice Items ({items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {items.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No items added yet. Add items using the form on the left.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 border-b border-gray-200">
                          <TableHead className="font-semibold text-gray-700">Product</TableHead>
                          <TableHead className="font-semibold text-gray-700">Reference</TableHead>
                          <TableHead className="text-right font-semibold text-gray-700">Quantity</TableHead>
                          <TableHead className="text-right font-semibold text-gray-700">Unit Price</TableHead>
                          <TableHead className="text-right font-semibold text-gray-700">Total</TableHead>
                          <TableHead className="text-center font-semibold text-gray-700">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item, index) => (
                          <TableRow key={index} className="border-b border-gray-100 hover:bg-gray-50/50">
                            <TableCell className="font-medium text-gray-900">
                              {item.productName}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {item.productReference}
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                                className="w-20 text-right"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => handleUnitPriceChange(index, parseFloat(e.target.value) || 0)}
                                className="w-24 text-right"
                              />
                            </TableCell>
                            <TableCell className="text-right font-semibold text-gray-900">
                              {formatCurrency(item.totalPrice)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveItem(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* Total Row */}
                        <TableRow className="bg-primary/5 border-t-2 border-primary/20">
                          <TableCell colSpan={4} className="text-right font-bold text-gray-900">
                            Total Amount:
                          </TableCell>
                                                  <TableCell className="text-right font-bold text-xl text-primary">
                          {formatCurrency(calculateTotal())}
                        </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 