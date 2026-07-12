import type { Product, ProductVariant, VariantLabel } from "@/types";

/**
 * Mock product catalogue. Prices are integer pesewas (GH₵ × 100). Imagery is
 * intentionally null — components render a tasteful placeholder until real
 * photography lands in Phase 11. The Phase 6 seeders reproduce this data.
 */

function variant(
  sku: string,
  label: VariantLabel,
  pricePesewas: number,
  stock: number,
  compareAtPesewas: number | null = null,
): ProductVariant {
  return {
    id: `var_${sku}`,
    label,
    sku,
    pricePesewas,
    compareAtPesewas,
    stock,
    isActive: true,
  };
}

export const products: Product[] = [
  /* --------------------------- Reed Diffusers -------------------------- */
  {
    id: "prod_snow_melon",
    categorySlug: "reed-diffusers",
    categoryName: "Reed Diffusers",
    name: "Snow Melon",
    slug: "snow-melon",
    tagline: "Our signature scent",
    description:
      "A crisp, sweet and refreshing fragrance that instantly brightens any room while creating a welcoming luxury atmosphere.",
    scentNotes: "Crisp melon, sweet citrus, clean musk",
    imageUrl: null,
    gallery: [],
    isFeatured: true,
    isActive: true,
    variants: [
      variant("BS-RD-SNM-50", "50ml", 18000, 40),
      variant("BS-RD-SNM-100", "100ml", 24500, 32, 28500),
    ],
  },
  {
    id: "prod_cotton_haze",
    categorySlug: "reed-diffusers",
    categoryName: "Reed Diffusers",
    name: "Cotton Haze",
    slug: "cotton-haze",
    tagline: "Clean and soft",
    description:
      "Fresh laundered cotton wrapped in a soft, velvety warmth — calm, clean, and quietly comforting.",
    scentNotes: "Cotton, white florals, powder",
    imageUrl: null,
    gallery: [],
    isFeatured: false,
    isActive: true,
    variants: [
      variant("BS-RD-COT-50", "50ml", 16000, 25),
      variant("BS-RD-COT-100", "100ml", 22000, 18),
    ],
  },
  {
    id: "prod_velvet_oud",
    categorySlug: "reed-diffusers",
    categoryName: "Reed Diffusers",
    name: "Velvet Oud",
    slug: "velvet-oud",
    tagline: "Warm and deep",
    description:
      "A rich, inviting oud softened with amber and spice — the scent of a warm evening indoors.",
    scentNotes: "Oud, amber, warm spice",
    imageUrl: null,
    gallery: [],
    isFeatured: true,
    isActive: true,
    variants: [
      variant("BS-RD-VEL-50", "50ml", 19000, 22),
      variant("BS-RD-VEL-100", "100ml", 26000, 15),
    ],
  },
  {
    id: "prod_white_tea_fig",
    categorySlug: "reed-diffusers",
    categoryName: "Reed Diffusers",
    name: "White Tea & Fig",
    slug: "white-tea-and-fig",
    tagline: "Fresh and green",
    description:
      "Delicate white tea meets ripe fig and a whisper of green — refined, refreshing, and effortlessly elegant.",
    scentNotes: "White tea, fig, green leaves",
    imageUrl: null,
    gallery: [],
    isFeatured: false,
    isActive: true,
    variants: [
      variant("BS-RD-WTF-50", "50ml", 17000, 30),
      variant("BS-RD-WTF-100", "100ml", 23000, 20),
    ],
  },

  /* ---------------------------- Room Sprays ---------------------------- */
  {
    id: "prod_snow_melon_mist",
    categorySlug: "room-sprays",
    categoryName: "Room Sprays",
    name: "Snow Melon Mist",
    slug: "snow-melon-mist",
    tagline: "Signature, in a spray",
    description:
      "The crisp sweetness of Snow Melon in an instant mist — a few sprays to refresh and welcome.",
    scentNotes: "Crisp melon, sweet citrus, clean musk",
    imageUrl: null,
    gallery: [],
    isFeatured: false,
    isActive: true,
    variants: [variant("BS-RS-SNM-100", "100ml", 15000, 50)],
  },
  {
    id: "prod_amber_noir",
    categorySlug: "room-sprays",
    categoryName: "Room Sprays",
    name: "Amber Noir",
    slug: "amber-noir",
    tagline: "Bold and warm",
    description:
      "Smoky amber and dark woods for a room that feels considered, warm, and quietly luxurious.",
    scentNotes: "Amber, dark woods, vanilla",
    imageUrl: null,
    gallery: [],
    isFeatured: false,
    isActive: true,
    variants: [variant("BS-RS-AMB-100", "100ml", 17000, 28)],
  },
  {
    id: "prod_citrus_grove",
    categorySlug: "room-sprays",
    categoryName: "Room Sprays",
    name: "Citrus Grove",
    slug: "citrus-grove",
    tagline: "Bright and clean",
    description:
      "Sun-ripe citrus and crushed herbs — a bright, energizing lift for kitchens and mornings.",
    scentNotes: "Orange, lemon, basil",
    imageUrl: null,
    gallery: [],
    isFeatured: false,
    isActive: true,
    variants: [
      variant("BS-RS-CIT-50", "50ml", 9000, 44),
      variant("BS-RS-CIT-100", "100ml", 15000, 33),
    ],
  },

  /* --------------------------- Fragrance Oils -------------------------- */
  {
    id: "prod_cotton_haze_oil",
    categorySlug: "fragrance-oils",
    categoryName: "Fragrance Oils",
    name: "Cotton Haze Oil",
    slug: "cotton-haze-oil",
    tagline: "Concentrated comfort",
    description:
      "The soft, clean warmth of Cotton Haze in a concentrated oil for burners and humidifiers.",
    scentNotes: "Cotton, white florals, powder",
    imageUrl: null,
    gallery: [],
    isFeatured: true,
    isActive: true,
    variants: [
      variant("BS-FO-COT-50", "50ml", 8000, 60),
      variant("BS-FO-COT-100", "100ml", 14000, 40),
    ],
  },
  {
    id: "prod_sandal_cedar_oil",
    categorySlug: "fragrance-oils",
    categoryName: "Fragrance Oils",
    name: "Sandal & Cedar Oil",
    slug: "sandal-and-cedar-oil",
    tagline: "Grounded and woody",
    description:
      "Creamy sandalwood and dry cedar — a grounding, meditative warmth that lingers beautifully.",
    scentNotes: "Sandalwood, cedar, tonka",
    imageUrl: null,
    gallery: [],
    isFeatured: false,
    isActive: true,
    variants: [
      variant("BS-FO-SAN-50", "50ml", 9000, 38),
      variant("BS-FO-SAN-100", "100ml", 16000, 24),
    ],
  },
  {
    id: "prod_rose_damask_oil",
    categorySlug: "fragrance-oils",
    categoryName: "Fragrance Oils",
    name: "Rose Damask Oil",
    slug: "rose-damask-oil",
    tagline: "Soft and floral",
    description: "Velvety Damask rose with a touch of honey — romantic without ever feeling heavy.",
    scentNotes: "Damask rose, honey, musk",
    imageUrl: null,
    gallery: [],
    isFeatured: false,
    isActive: true,
    variants: [
      variant("BS-FO-ROS-50", "50ml", 9500, 35),
      variant("BS-FO-ROS-100", "100ml", 16500, 21),
    ],
  },

  /* ---------------------------- Humidifiers ---------------------------- */
  {
    id: "prod_mist_botanica",
    categorySlug: "humidifiers",
    categoryName: "Humidifiers",
    name: "Mist Botanica",
    slug: "mist-botanica",
    tagline: "Fragrance as fine mist",
    description:
      "A quiet ultrasonic humidifier that carries your favourite oils as a cool, even mist — with a soft ambient glow.",
    scentNotes: "Pairs with any Birchscents oil",
    imageUrl: null,
    gallery: [],
    isFeatured: true,
    isActive: true,
    variants: [variant("BS-HU-BOT-STD", "Standard", 34000, 16)],
  },
  {
    id: "prod_aura_mini",
    categorySlug: "humidifiers",
    categoryName: "Humidifiers",
    name: "Aura Mini",
    slug: "aura-mini",
    tagline: "Compact and quiet",
    description:
      "A desk-sized humidifier for offices and bedside tables — gentle mist, whisper-quiet, USB-powered.",
    scentNotes: "Pairs with any Birchscents oil",
    imageUrl: null,
    gallery: [],
    isFeatured: false,
    isActive: true,
    variants: [variant("BS-HU-AUR-STD", "Standard", 21000, 27)],
  },

  /* ----------------------------- Birch Vase ----------------------------- */
  {
    id: "prod_ashwood_vase",
    categorySlug: "birch-vase",
    categoryName: "Birch Vase",
    name: "The Ashwood Vase",
    slug: "ashwood-vase",
    tagline: "A vessel worth keeping",
    description:
      "Hand-glazed stoneware in a warm ashwood finish, sized for our 100ml reed diffuser refills — as beautiful empty as it is full.",
    scentNotes: "Fits all Birchscents 100ml reed diffuser refills",
    imageUrl: null,
    gallery: [],
    isFeatured: false,
    isActive: true,
    variants: [variant("BS-BV-ASH-STD", "Standard", 12000, 24)],
  },
  {
    id: "prod_ivory_stone_vase",
    categorySlug: "birch-vase",
    categoryName: "Birch Vase",
    name: "The Ivory Stone Vase",
    slug: "ivory-stone-vase",
    tagline: "Clean and considered",
    description:
      "A matte ivory stoneware vessel with a soft, tactile finish — pairs with any Birchscents reed diffuser refill.",
    scentNotes: "Fits all Birchscents 100ml reed diffuser refills",
    imageUrl: null,
    gallery: [],
    isFeatured: false,
    isActive: true,
    variants: [variant("BS-BV-IVR-STD", "Standard", 13000, 20)],
  },

  /* --------------------------- Car Fragrance ---------------------------- */
  {
    id: "prod_aura_car_diffuser",
    categorySlug: "car-fragrance",
    categoryName: "Car Fragrance",
    name: "Aura Car Diffuser",
    slug: "aura-car-diffuser",
    tagline: "Your commute, elevated",
    description:
      "A compact ultrasonic diffuser that clips to your vent and carries a fine, even mist through the car — quiet, cordless, USB-powered.",
    scentNotes: "Pairs with any Birchscents car refill",
    imageUrl: null,
    gallery: [],
    isFeatured: true,
    isActive: true,
    variants: [variant("BS-CF-AUR-STD", "Standard", 19500, 30)],
  },
  {
    id: "prod_snow_melon_car_refill",
    categorySlug: "car-fragrance",
    categoryName: "Car Fragrance",
    name: "Snow Melon Car Refill",
    slug: "snow-melon-car-refill",
    tagline: "Signature scent, on the road",
    description:
      "The crisp sweetness of Snow Melon, concentrated into a refill cartridge built for the Aura Car Diffuser.",
    scentNotes: "Crisp melon, sweet citrus, clean musk",
    imageUrl: null,
    gallery: [],
    isFeatured: false,
    isActive: true,
    variants: [variant("BS-CF-SNM-STD", "Standard", 6500, 50)],
  },
  {
    id: "prod_citrus_grove_car_refill",
    categorySlug: "car-fragrance",
    categoryName: "Car Fragrance",
    name: "Citrus Grove Car Refill",
    slug: "citrus-grove-car-refill",
    tagline: "Bright and clean, on the road",
    description:
      "Sun-ripe citrus and crushed herbs in a refill cartridge built for the Aura Car Diffuser.",
    scentNotes: "Orange, lemon, basil",
    imageUrl: null,
    gallery: [],
    isFeatured: false,
    isActive: true,
    variants: [variant("BS-CF-CIT-STD", "Standard", 6500, 45)],
  },
];
