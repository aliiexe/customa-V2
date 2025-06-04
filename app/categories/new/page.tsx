import CategoryForm from "@/components/categories/category-form";

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Create Category</h1>
      <CategoryForm categoryId={null} />
    </div>
  );
}
