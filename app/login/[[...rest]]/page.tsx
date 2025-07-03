"use client";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center flex-col">
      <SignIn path="/login" routing="path" signUpUrl="/sign-up" />
    </div>
  );
}
