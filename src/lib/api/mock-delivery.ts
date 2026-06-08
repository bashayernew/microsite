import type { DeliveryArea } from "./types";

/**
 * Mock delivery zones — stands in for the POS `delivery_areas` table until the
 * public API exists. Tenant-scoped; each carries a KWD fee (3dp string).
 */
export const MOCK_DELIVERY_AREAS: DeliveryArea[] = [
  { id: "dz_salmiya", name: "Salmiya", nameAr: "السالمية", fee: "0.750" },
  { id: "dz_hawally", name: "Hawally", nameAr: "حولي", fee: "1.000" },
  { id: "dz_city", name: "Kuwait City", nameAr: "مدينة الكويت", fee: "1.250" },
  { id: "dz_jabriya", name: "Jabriya", nameAr: "الجابرية", fee: "1.000" },
  { id: "dz_salwa", name: "Salwa", nameAr: "سلوى", fee: "1.500" },
  { id: "dz_farwaniya", name: "Farwaniya", nameAr: "الفروانية", fee: "2.000" },
];
