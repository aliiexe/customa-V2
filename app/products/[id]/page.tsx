import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import ProductForm from "@/components/products/product-form"

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const isNewProduct = params.id === "new"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{isNewProduct ? "Add New Product" : "Edit Product"}</h1>
      </div>

      <ProductForm productId={isNewProduct ? null : Number.parseInt(params.id)} />
    </div>
  )
}
