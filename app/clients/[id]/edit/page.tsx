import ClientForm from "@/components/clients/client-form";

export default function EditClientPage({ params }: { params: { id: string } }) {
  const clientId = parseInt(params.id);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Edit Client</h1>
      <ClientForm clientId={clientId} />
    </div>
  );
}
