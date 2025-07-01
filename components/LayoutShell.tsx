"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import AuthEnforcer from "@/components/AuthEnforcer";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/not-authorized" || pathname === "/login") {
    return <>{children}</>;
  }
  return (
    <>
      <SignedIn>
        <AuthEnforcer>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
          </div>
        </AuthEnforcer>
      </SignedIn>
      <SignedOut>
        <CustomRedirectToLogin />
      </SignedOut>
    </>
  );
}

function CustomRedirectToLogin() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login");
  }, [router]);
  return null;
} 