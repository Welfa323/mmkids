import type { Metadata } from "next";
import { CheckoutFlow } from "@/modules/checkout/components/checkout-flow";

export const metadata: Metadata = { title: "Validation de la commande", robots: { index: false } };

export default function CheckoutPage() {
  return <CheckoutFlow />;
}
