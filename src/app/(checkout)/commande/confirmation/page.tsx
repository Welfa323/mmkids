import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmation } from "@/modules/checkout/components/order-confirmation";

export const metadata: Metadata = { title: "Commande confirmée", robots: { index: false } };

export default function ConfirmationPage() {
  return (
    <Suspense>
      <OrderConfirmation />
    </Suspense>
  );
}
