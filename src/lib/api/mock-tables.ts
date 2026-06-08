import type { DiningArea } from "./types";

/**
 * Mock tables per branch — stands in for the POS `dining_areas` + `tables`
 * tables until the public API exists. Keyed by branchId. A couple are marked
 * OCCUPIED so the "only available is selectable" behaviour is visible.
 */
export const MOCK_TABLES: Record<string, DiningArea[]> = {
  br_salmiya: [
    {
      id: "da_salmiya_main",
      name: "Main Hall",
      nameAr: "القاعة الرئيسية",
      tables: [
        { id: "t_s_1", code: "T-01", seats: 4, status: "AVAILABLE" },
        { id: "t_s_2", code: "T-02", seats: 2, status: "AVAILABLE" },
        { id: "t_s_3", code: "T-03", seats: 4, status: "OCCUPIED" },
        { id: "t_s_4", code: "T-04", seats: 6, status: "AVAILABLE" },
      ],
    },
    {
      id: "da_salmiya_terrace",
      name: "Terrace",
      nameAr: "التراس",
      tables: [
        { id: "t_s_5", code: "P-01", seats: 4, status: "AVAILABLE" },
        { id: "t_s_6", code: "P-02", seats: 4, status: "RESERVED" },
      ],
    },
  ],
  br_kuwaitcity: [
    {
      id: "da_city_main",
      name: "Main Hall",
      nameAr: "القاعة الرئيسية",
      tables: [
        { id: "t_c_1", code: "T-01", seats: 4, status: "AVAILABLE" },
        { id: "t_c_2", code: "T-02", seats: 2, status: "OCCUPIED" },
        { id: "t_c_3", code: "T-03", seats: 8, status: "AVAILABLE" },
      ],
    },
  ],
  br_jabriya: [
    {
      id: "da_jabriya_main",
      name: "Main Hall",
      nameAr: "القاعة الرئيسية",
      tables: [
        { id: "t_j_1", code: "T-01", seats: 4, status: "AVAILABLE" },
        { id: "t_j_2", code: "T-02", seats: 4, status: "AVAILABLE" },
      ],
    },
  ],
};
