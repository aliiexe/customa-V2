"use client";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/login"
        fallbackRedirectUrl="/"
        appearance={{
          elements: {
            formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
            card: "shadow-lg border border-gray-200",
            headerTitle: "text-2xl font-bold text-gray-900",
            headerSubtitle: "text-gray-600",
            formFieldInput: "border border-gray-300 focus:border-primary focus:ring-primary/20",
            formFieldLabel: "text-gray-700 font-medium",
            footerActionLink: "text-primary hover:text-primary/80",
          },
        }}
      />
    </div>
  );
} 