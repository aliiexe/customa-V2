import { use } from "react";
import UserForm from "@/components/users/user-form";

export default function NewUserPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Create User</h1>
      <UserForm userId={null} />
    </div>
  );
}
