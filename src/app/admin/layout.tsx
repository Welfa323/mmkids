import type { Metadata } from "next";
import { AdminShell } from "@/modules/admin/components/admin-shell";

export const metadata: Metadata = {
  title: { default: "Back-office", template: "%s · Back-office MMKids" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
