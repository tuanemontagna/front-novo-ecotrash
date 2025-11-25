"use client";
import { usePathname } from "next/navigation";
import Header from "@/components/ui/header";

export default function LayoutShell({ children }) {
  const pathname = usePathname();
  const hideHeader = pathname === '/login' || pathname === '/criar-conta' || pathname.startsWith('/empresa') || pathname.startsWith('/usuario');
  return (
    <>
      {!hideHeader && <Header />}
      <div className={hideHeader ? '' : 'pt-16'}>{children}</div>
    </>
  );
}
