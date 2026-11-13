import type { Metadata } from "next";
import { CartView } from "@/modules/cart/components/cart-view";

export const metadata: Metadata = { title: "Mon panier", robots: { index: false } };

export default function CartPage() {
  return <CartView />;
}
