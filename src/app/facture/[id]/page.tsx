import type { Metadata } from "next";
import { Suspense } from "react";
import { InvoiceDocument } from "@/modules/billing/components/invoice-document";

export const metadata: Metadata = { title: "Document de facturation", robots: { index: false } };

export default async function InvoicePage(props: PageProps<"/facture/[id]">) {
  const { id } = await props.params;
  return (
    <div className="min-h-dvh bg-ink-100 print:bg-white">
      <Suspense>
        <InvoiceDocument orderNumber={decodeURIComponent(id)} />
      </Suspense>
    </div>
  );
}
