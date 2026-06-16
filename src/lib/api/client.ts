import type {
  DeliveryArea,
  DiningArea,
  Menu,
  NewOrder,
  OrderConfirmation,
  OrderProgress,
  Tenant,
} from "./types";
import { MOCK_MENU, MOCK_TENANT } from "./mock";
import { MOCK_TABLES } from "./mock-tables";
import { MOCK_DELIVERY_AREAS } from "./mock-delivery";

/**
 * The single seam between the microsite and the POS.
 *
 * Right now every function returns mock data. When the team leader ships the
 * public POS API, replace the bodies here with `fetch()` calls — the return
 * types (lib/api/types.ts) are the contract and nothing else in the app needs
 * to change.
 *
 * IMPORTANT for whoever wires the real API:
 *  - The POS identifies a store by `tenantId` from a JWT. A public storefront
 *    has no JWT, so the API must accept a PUBLIC identifier. We assume a
 *    `slug` here (e.g. noor.recety.com -> "noor"). The Tenant model has no
 *    `slug` column yet — flag this to the backend.
 *  - Keep all money as strings (KWD, 3dp). Never JSON.parse into a number.
 *  - Order creation maps to POS `POST /api/orders` (CreateOrderDto). The order
 *    lands as status NEW / PAYMENT_PENDING for staff to fire to the kitchen.
 *    Payment is intentionally out of scope here.
 */

// const API_BASE = process.env.NEXT_PUBLIC_POS_API_URL;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Demo only: remembers when each order was fired so getOrderStatus can simulate
// the kitchen advancing it. The real endpoint reads the actual status instead.
const ORDER_STARTS = new Map<string, number>();

export async function getTenant(slug: string): Promise<Tenant | null> {
  // return fetch(`${API_BASE}/public/stores/${slug}`).then(r => r.json());
  if (slug !== MOCK_TENANT.slug) return MOCK_TENANT; // demo: any slug resolves to Noor
  return MOCK_TENANT;
}

export async function getMenu(slug: string): Promise<Menu> {
  // return fetch(`${API_BASE}/public/stores/${slug}/menu`).then(r => r.json());
  void slug;
  return MOCK_MENU;
}

export async function getTables(branchId: string): Promise<DiningArea[]> {
  // return fetch(`${API_BASE}/public/branches/${branchId}/tables`).then(r => r.json());
  return MOCK_TABLES[branchId] ?? [];
}

export async function getDeliveryAreas(slug: string): Promise<DeliveryArea[]> {
  // return fetch(`${API_BASE}/public/stores/${slug}/delivery-areas`).then(r => r.json());
  void slug;
  return MOCK_DELIVERY_AREAS;
}

export async function createOrder(
  slug: string,
  order: NewOrder,
): Promise<OrderConfirmation> {
  // return fetch(`${API_BASE}/public/stores/${slug}/orders`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(order),
  // }).then(r => r.json());
  void slug;
  await delay(1100); // simulate the round-trip
  const n = Math.floor(1000 + Math.random() * 9000);
  const branchCode = order.branchId.replace("br_", "").slice(0, 3).toUpperCase();
  const orderNumber = `ORD-${branchCode}-${n}`;
  ORDER_STARTS.set(orderNumber, Date.now());
  return {
    orderNumber,
    status: "NEW",
    estimatedMinutes:
      order.orderType === "DINE_IN" ? 20 : order.orderType === "DELIVERY" ? 40 : 25,
  };
}

/**
 * Live order progress, polled by the tracking screen so the chef's marks
 * (received → preparing → ready → served) flow through to the customer.
 *
 * Wire-up: replace the body with a poll of the POS order-status endpoint (or a
 * websocket). The POS computes `step` from OrderStatus + KitchenStatus.
 * Demo: advances by elapsed time since the order was fired.
 */
export async function getOrderStatus(orderNumber: string): Promise<OrderProgress> {
  // return fetch(`${API_BASE}/public/orders/${orderNumber}/status`).then(r => r.json());
  const started = ORDER_STARTS.get(orderNumber) ?? Date.now();
  const elapsed = Date.now() - started;
  const step = elapsed < 4000 ? 0 : elapsed < 11000 ? 1 : elapsed < 18000 ? 2 : 3;
  return { step };
}
