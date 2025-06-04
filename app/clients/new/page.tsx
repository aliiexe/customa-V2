import ClientForm from "@/components/clients/client-form";

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Create Client</h1>
      <ClientForm clientId={null} />
    </div>
  );
}
