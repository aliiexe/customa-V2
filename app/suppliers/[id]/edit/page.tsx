import SupplierForm from "@/components/suppliers/supplier-form";

export default function EditSupplierPage({
  params,
}: {
  params: { id: string };
}) {
  const supplierId = parseInt(params.id);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Edit Supplier</h1>
      <SupplierForm supplierId={supplierId} />
    </div>
  );
}
