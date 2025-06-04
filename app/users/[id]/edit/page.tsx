import { use } from "react";
import UserForm from "@/components/users/user-form";

export default function EditUserPage({ params }: { params: { id: string } }) {
  const unwrappedParams = use(params);
  const userId = parseInt(unwrappedParams.id);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
      <UserForm userId={userId} />
    </div>
  );
}
