import type { Metadata } from "next";
import { AccountShell } from "@/modules/customer/components/account-shell";

export const metadata: Metadata = { title: { default: "Mon compte", template: "%s | Mon compte" }, robots: { index: false } };

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
