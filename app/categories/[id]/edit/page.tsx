import CategoryForm from "@/components/categories/category-form";
import { use } from "react";

export default function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const unwrappedParams = use(params);
  const categoryId = parseInt(unwrappedParams.id);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
      <CategoryForm categoryId={categoryId} />
    </div>
  );
}
