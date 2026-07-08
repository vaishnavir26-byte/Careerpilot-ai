"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712]">
      <Sidebar />
      <Navbar />
      <div className="pl-64 pt-16 min-h-screen">
        <main className="p-6 max-w-7xl mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
