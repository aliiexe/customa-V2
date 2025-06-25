"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus } from "lucide-react"

const formSchema = z.object({
  supplierId: z.string().min(1, "Please select a supplier"),
  validUntil: z.string().min(1, "Please select a valid date"),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, "Please select a product"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.number().min(0, "Unit price must be 0 or greater"),
  })).min(1, "Please add at least one item"),
})

type FormValues = z.infer<typeof formSchema>

export default function SupplierQuoteForm() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplierId: "",
      validUntil: "",
      notes: "",
      items: [{ productId: "", quantity: 1, unitPrice: 0 }],
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch suppliers
        const suppliersResponse = await fetch("/api/suppliers")
        if (suppliersResponse.ok) {
          const suppliersData = await suppliersResponse.json()
          setSuppliers(suppliersData)
        }

        // Fetch products
        const productsResponse = await fetch("/api/products")
        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          setProducts(productsData)
        }
      } catch (error) {
        console.error("Error fetching form data:", error)
        setError("Failed to load form data")
      }
    }

    fetchData()
  }, [])

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/quotes/supplier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          dateCreated: new Date().toISOString(),
          totalAmount: data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
          status: "DRAFT",
        }),
      })

      if (response.ok) {
        router.push("/quotes/supplier")
        router.refresh()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to create quote")
      }
    } catch (error) {
      console.error("Error creating quote:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = () => {
    const items = form.getValues("items")
    form.setValue("items", [...items, { productId: "", quantity: 1, unitPrice: 0 }])
  }

  const removeItem = (index: number) => {
    const items = form.getValues("items")
    if (items.length > 1) {
      form.setValue("items", items.filter((_, i) => i !== index))
    }
  }

  const handleProductChange = (value: string, index: number) => {
    // Find the selected product
    const product = products.find(p => p.id.toString() === value)
    if (product) {
      // Update the unit price with the supplier price
      form.setValue(`items.${index}.unitPrice`, product.supplierPrice)
    }
    // Update the product ID
    form.setValue(`items.${index}.productId`, value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Quote Request Details</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid Until</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-primary">Items</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addItem}
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {form.watch("items").map((_, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-md">
                  <FormField
                    control={form.control}
                    name={`items.${index}.productId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product</FormLabel>
                        <Select 
                          onValueChange={(value) => handleProductChange(value, index)} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.unitPrice`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Price</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => removeItem(index)}
                      disabled={form.watch("items").length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter any additional notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/quotes/supplier")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? "Creating..." : "Create Quote"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}