import { Button } from "@/components/ui/button";
import { ArrowLeft, UserCog } from "lucide-react";
import ClientForm from "@/components/clients/client-form";
import Link from "next/link";
import { use } from "react";

export default function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const clientId = parseInt(id);

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
              <Link href="/clients">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <UserCog className="h-8 w-8 text-primary" />
                Edit Client
              </h1>
              <p className="mt-2 text-gray-600">
                Update client information and contact details
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <ClientForm clientId={clientId} />
      </div>
    </div>
  );
}
