import type { DeliveryMode } from "@/modules/delivery";
import type { PaymentMethodId } from "@/modules/payment";

export type OrderStatus =
  | "nouvelle"
  | "paiement_en_attente"
  | "payee"
  | "en_preparation"
  | "prete"
  | "expediee"
  | "en_livraison"
  | "livree"
  | "annulee"
  | "echec_paiement"
  | "retour"
  | "remboursee";

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  variant?: string;
  qty: number;
  unitPrice: number;
  unitCost: number;
  category: string;
}

export interface OrderEvent {
  status: OrderStatus;
  at: string;
  by: string;
  note?: string;
}

export type SalesChannel = "Site web" | "Application" | "WhatsApp" | "Boutique" | "Facebook";

export interface Order {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  phone: string;
  email: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  promoCode?: string;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethodId;
  paymentRef?: string;
  paidAmount: number;
  deliveryMode: DeliveryMode;
  zoneId: string;
  city: string;
  address: string;
  carrier?: string;
  trackingNumber?: string;
  status: OrderStatus;
  history: OrderEvent[];
  internalComment?: string;
  channel: SalesChannel;
  storeId: string;
  createdAt: string;
  returnRequested?: boolean;
}
