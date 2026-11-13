export * from "./types";
export * from "./status";
import { JEAN_ORDERS, ORDERS } from "./data/orders";
export { ORDERS };

export function getOrders() {
  return ORDERS;
}

export function getOrder(idOrNumber: string) {
  return ORDERS.find((o) => o.id === idOrNumber || o.number === idOrNumber);
}

export function getCustomerOrders(customerId: string) {
  return customerId === "c001" ? JEAN_ORDERS : ORDERS.filter((o) => o.customerId === customerId);
}
