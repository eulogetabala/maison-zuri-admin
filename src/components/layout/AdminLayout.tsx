'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('admin_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex bg-white min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
