export type PaymentMethodId =
  | "orange_money"
  | "mtn_momo"
  | "moov_money"
  | "wave"
  | "carte"
  | "livraison"
  | "virement"
  | "acompte"
  | "plusieurs_fois";

export type PaymentStatus = "en_attente" | "confirme" | "echoue" | "rembourse" | "partiel";

export interface PaymentRequest {
  orderNumber: string;
  amount: number;
  method: PaymentMethodId;
  customer: { name: string; phone: string; email: string };
  /** numéro Mobile Money, 4 derniers chiffres de carte… */
  account?: string;
  installments?: number;
}

export interface PaymentResult {
  status: PaymentStatus;
  reference: string;
  provider: string;
  amountCaptured: number;
  message: string;
  /** étape suivante pour l'utilisateur (ex. valider sur le téléphone) */
  nextAction?: string;
}

export interface RefundResult {
  ok: boolean;
  reference: string;
  message: string;
}

/**
 * Contrat que chaque agrégateur de paiement doit implémenter.
 * Ajouter un agrégateur = écrire un adaptateur + l'enregistrer dans le registre.
 */
export interface PaymentProvider {
  id: string;
  name: string;
  supports: PaymentMethodId[];
  feePct: number;
  initiate(req: PaymentRequest): Promise<PaymentResult>;
  verify(reference: string): Promise<PaymentStatus>;
  refund(reference: string, amount: number): Promise<RefundResult>;
}
