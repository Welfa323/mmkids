export * from "./data/customers";
import { CUSTOMERS, type CustomerSegment } from "./data/customers";

export function customersBySegment(segment: CustomerSegment) {
  return CUSTOMERS.filter((c) => c.segment === segment);
}

export function topCustomers(limit = 10) {
  return [...CUSTOMERS].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, limit);
}

export function segmentCounts() {
  const counts: Record<CustomerSegment, number> = { vip: 0, fidele: 0, a_risque: 0, inactif: 0, nouveau: 0, occasionnel: 0 };
  CUSTOMERS.forEach((c) => counts[c.segment]++);
  return counts;
}
