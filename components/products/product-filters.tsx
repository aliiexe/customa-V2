"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  RotateCcw,
  Filter,
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Building2,
  Tag,
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  productCount?: number;
}

interface Supplier {
  id: number;
  name: string;
  productCount?: number;
}

interface ProductFiltersProps {
  onFiltersChange: (filters: {
    search: string;
    category: string;
    supplier: string;
    stockLevel: string;
    priceRange: string;
  }) => void;
}

export default function ProductFilters({ onFiltersChange }: ProductFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [stockLevel, setStockLevel] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilterData();
  }, []);

  // Use useCallback to memoize the filter emission
  const emitFilters = useCallback(() => {
    onFiltersChange({
      search: searchTerm,
      category: selectedCategory,
      supplier: selectedSupplier,
      stockLevel,
      priceRange,
    });
  }, [searchTerm, selectedCategory, selectedSupplier, stockLevel, priceRange, onFiltersChange]);

  // Only emit filters when the actual filter values change
  useEffect(() => {
    emitFilters();
  }, [emitFilters]);

  const fetchFilterData = async () => {
    setLoading(true);
    try {
      const [categoriesResponse, suppliersResponse] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/suppliers"),
      ]);

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      }

      if (suppliersResponse.ok) {
        const suppliersData = await suppliersResponse.json();
        setSuppliers(suppliersData);
      }
    } catch (error) {
      console.error("Error fetching filter data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedSupplier("all");
    setStockLevel("all");
    setPriceRange("all");
  };

  const hasActiveFilters = 
    searchTerm || 
    selectedCategory !== "all" || 
    selectedSupplier !== "all" || 
    stockLevel !== "all" ||
    priceRange !== "all";

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="mr-2 h-5 w-5 text-primary" />
          Filter Products
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Use the filters below to find specific products in your inventory
        </p>
      </div>

      {/* Filter Content */}
      <div className="p-6">
        {/* Primary Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Search */}
          <div className="lg:col-span-2">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Search Products
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, reference, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 border-gray-300 focus:border-primary focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Category
            </Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-10 border-gray-300 focus:border-primary">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-400" />
                    All Categories
                  </div>
                </SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>{category.name}</span>
                      {category.productCount !== undefined && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {category.productCount}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Supplier Filter */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Supplier
            </Label>
            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger className="h-10 border-gray-300 focus:border-primary">
                <SelectValue placeholder="All Suppliers" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    All Suppliers
                  </div>
                </SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>{supplier.name}</span>
                      {supplier.productCount !== undefined && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {supplier.productCount}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Secondary Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Stock Level Filter */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Stock Level
            </Label>
            <Select value={stockLevel} onValueChange={setStockLevel}>
              <SelectTrigger className="h-10 border-gray-300 focus:border-primary">
                <SelectValue placeholder="All Stock Levels" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    All Stock Levels
                  </div>
                </SelectItem>
                <SelectItem value="out">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Out of Stock
                  </div>
                </SelectItem>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Low Stock (≤10)
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    Medium Stock (11-50)
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    High Stock ({'>'}50)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range Filter */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Price Range
            </Label>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="h-10 border-gray-300 focus:border-primary">
                <SelectValue placeholder="All Prices" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    All Prices
                  </div>
                </SelectItem>
                <SelectItem value="0-25">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    $0 - $25
                  </div>
                </SelectItem>
                <SelectItem value="25-100">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-500" />
                    $25 - $100
                  </div>
                </SelectItem>
                <SelectItem value="100-500">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-purple-500" />
                    $100 - $500
                  </div>
                </SelectItem>
                <SelectItem value="500+">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-red-500" />
                    $500+
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Spacer columns */}
          <div className="hidden lg:block"></div>

          {/* Reset Button */}
          <div className="flex items-end">
            <Button
              onClick={handleReset}
              variant="outline"
              disabled={!hasActiveFilters}
              className="w-full h-10 border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  Search: {searchTerm}
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  Category: {categories.find(c => c.id.toString() === selectedCategory)?.name || selectedCategory}
                </Badge>
              )}
              {selectedSupplier !== "all" && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  Supplier: {suppliers.find(s => s.id.toString() === selectedSupplier)?.name || selectedSupplier}
                </Badge>
              )}
              {stockLevel !== "all" && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  Stock: {stockLevel}
                </Badge>
              )}
              {priceRange !== "all" && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  Price: ${priceRange}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
            <span className="text-sm text-gray-600">Loading filter options...</span>
          </div>
        </div>
      )}
    </div>
  );
}
