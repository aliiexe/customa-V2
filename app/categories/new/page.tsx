import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";
import CategoryForm from "@/components/categories/category-form";
import Link from "next/link";

export default function NewCategoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              asChild
              className="shadow-sm border-gray-200 hover:bg-gray-50"
            >
              <Link href="/categories">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="h-8 w-8 text-primary" />
                Create New Category
              </h1>
              <p className="mt-2 text-gray-600">
                Add a new product category to organize your inventory
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <CategoryForm categoryId={null} />
      </div>
    </div>
  );
}
