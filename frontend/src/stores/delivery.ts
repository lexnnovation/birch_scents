import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Remembers the shopper's last-used delivery details so the checkout form
 * pre-fills instead of starting blank every time — still fully editable.
 * Deliberately excludes `note`, which is order-specific.
 */
export interface SavedDelivery {
  name: string;
  phone: string;
  address: string;
  city: string;
}

interface DeliveryState {
  lastUsed: SavedDelivery | null;
  save: (details: SavedDelivery) => void;
}

export const useLastDelivery = create<DeliveryState>()(
  persist(
    (set) => ({
      lastUsed: null,
      save: (details) => set({ lastUsed: details }),
    }),
    {
      name: "birchscents-last-delivery",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
