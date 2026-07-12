import type { Category } from "@/types";

/**
 * Mock categories — mirror the MVP product categories (CLAUDE.md brand
 * profile). The Phase 6 seeders reproduce these exactly so the live API is a
 * drop-in replacement for the mock data layer.
 */
export const categories: Category[] = [
  {
    id: "cat_reed_diffusers",
    name: "Reed Diffusers",
    slug: "reed-diffusers",
    description:
      "Slow, steady fragrance that fills a room without a flame — our most-loved way to scent a home.",
    imageUrl: null,
    sortOrder: 1,
  },
  {
    id: "cat_room_sprays",
    name: "Room Sprays",
    slug: "room-sprays",
    description:
      "An instant lift for any space — a few mists to refresh, welcome, and set the mood.",
    imageUrl: null,
    sortOrder: 2,
  },
  {
    id: "cat_fragrance_oils",
    name: "Fragrance Oils",
    slug: "fragrance-oils",
    description:
      "Concentrated oils for burners, diffusers, and humidifiers — rich, long-lasting scent throw.",
    imageUrl: null,
    sortOrder: 3,
  },
  {
    id: "cat_humidifiers",
    name: "Humidifiers",
    slug: "humidifiers",
    description:
      "Quiet ultrasonic humidifiers that carry fragrance as a fine, cool mist through the air.",
    imageUrl: null,
    sortOrder: 4,
  },
  {
    id: "cat_birch_vase",
    name: "Birch Vase",
    slug: "birch-vase",
    description:
      "Hand-finished vessels for our reed diffusers — as considered empty as they are full.",
    imageUrl: null,
    sortOrder: 5,
  },
  {
    id: "cat_car_fragrance",
    name: "Car Fragrance",
    slug: "car-fragrance",
    description:
      "A quiet ultrasonic diffuser and refill cartridges built for the commute — the Birchscents atmosphere, on the road.",
    imageUrl: null,
    sortOrder: 6,
  },
];
