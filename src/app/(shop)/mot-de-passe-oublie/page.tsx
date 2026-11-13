import type { Metadata } from "next";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/modules/customer/components/auth-forms";

export const metadata: Metadata = { title: "Mot de passe oublié", robots: { index: false } };

export default function Page() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
