"use client";
import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function AuthEnforcer({ children }: { children: React.ReactNode }) {
  const { signOut } = useClerk();
  const router = useRouter();
  useEffect(() => {
    async function checkDbUser() {
      try {
        const res = await fetch("/api/users/me");
        if (res.status === 403) {
          await signOut();
          router.replace("/not-authorized");
        }
      } catch {}
    }
    checkDbUser();
  }, [signOut, router]);
  return <>{children}</>;
} 