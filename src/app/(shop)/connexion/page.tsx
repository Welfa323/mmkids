import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/modules/customer/components/auth-forms";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

export default function Page() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
