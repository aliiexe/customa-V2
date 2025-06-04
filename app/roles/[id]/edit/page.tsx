import { use } from "react";
import RoleForm from "@/components/roles/role-form";

export default function EditRolePage({ params }: { params: { id: string } }) {
  const unwrappedParams = use(params);
  const roleId = parseInt(unwrappedParams.id);
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Edit Role</h1>
      <RoleForm roleId={roleId} />
    </div>
  );
}