import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import CategoriesTable from "@/components/categories/categories-table"
import Link from "next/link"

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Product Categories</h1>
        <Button asChild>
          <Link href="/categories/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>

      <CategoriesTable />
    </div>
  )
}
