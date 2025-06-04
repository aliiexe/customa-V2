"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"

interface Category {
  id: number
  name: string
}

interface Supplier {
  id: number
  name: string
}

export default function ProductFilters() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState("")
  const [showLowStock, setShowLowStock] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  useEffect(() => {
    fetchCategories()
    fetchSuppliers()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("/api/suppliers")
      if (response.ok) {
        const data = await response.json()
        setSuppliers(data)
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error)
    }
  }

  const handleSearch = () => {
    // In a real implementation, this would trigger an API call with the filters
    console.log({
      searchTerm,
      selectedCategory,
      selectedSupplier,
      showLowStock,
    })
  }

  const handleReset = () => {
    setSearchTerm("")
    setSelectedCategory("")
    setSelectedSupplier("")
    setShowLowStock(false)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex w-full items-center space-x-2">
          <Input placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <Button type="submit" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
          <SelectTrigger>
            <SelectValue placeholder="Select Supplier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Suppliers</SelectItem>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id.toString()}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="lowStock"
            checked={showLowStock}
            onCheckedChange={(checked) => setShowLowStock(checked as boolean)}
          />
          <Label htmlFor="lowStock">Show Low Stock Only</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleReset}>
          Reset Filters
        </Button>
        <Button onClick={handleSearch}>Apply Filters</Button>
      </div>
    </div>
  )
}
