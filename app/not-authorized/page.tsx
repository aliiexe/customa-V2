"use client";
import { useClerk } from "@clerk/nextjs";

export default function NotAuthorizedPage() {
  const { signOut } = useClerk();

  const handleBackToLogin = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-red-50">
      <div className="bg-white p-8 rounded shadow-md max-w-md w-full text-center border border-red-200">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Not Authorized</h1>
        <p className="mb-2">You are not authorized to access this application.</p>
        <p className="mb-4">If you are a user, please contact your manager to create an account for you.</p>
        <button
          onClick={handleBackToLogin}
          className="text-blue-600 underline"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
} 