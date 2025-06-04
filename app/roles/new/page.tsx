import RoleForm from "@/components/roles/role-form";

export default function NewRolePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Create Role</h1>
      <RoleForm roleId={null} />
    </div>
  );
}