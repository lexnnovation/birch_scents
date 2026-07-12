<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

/**
 * Mirrors frontend/src/mocks/products.ts exactly — same products, variants,
 * SKUs, pesewa prices, stock, isFeatured and compareAt values — so the Phase 10
 * API swap is visually invisible (CLAUDE.md §5, PROJECT_TODO 6.6). Imagery is
 * intentionally null until real photography lands in Phase 11.
 */
class ProductSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->products() as $data) {
            $variants = $data['variants'];
            unset($data['variants']);

            $categoryId = Category::where('slug', $data['categorySlug'])->value('id');
            unset($data['categorySlug']);

            $product = Product::updateOrCreate(
                ['slug' => $data['slug']],
                [...$data, 'category_id' => $categoryId],
            );

            foreach ($variants as $variant) {
                $product->variants()->updateOrCreate(['sku' => $variant['sku']], $variant);
            }
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function products(): array
    {
        return [
            // --------------------------- Reed Diffusers ---------------------------
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Snow Melon',
                'slug' => 'snow-melon',
                'tagline' => 'Our signature scent',
                'description' => 'A crisp, sweet and refreshing fragrance that instantly brightens any room while creating a welcoming luxury atmosphere.',
                'scent_notes' => 'Crisp melon, sweet citrus, clean musk',
                'gallery' => [],
                'is_featured' => true,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-SNM-50', 'label' => '50ml', 'price_pesewas' => 18000, 'compare_at_pesewas' => null, 'stock' => 40, 'is_active' => true],
                    ['sku' => 'BS-RD-SNM-100', 'label' => '100ml', 'price_pesewas' => 24500, 'compare_at_pesewas' => 28500, 'stock' => 32, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Cotton Haze',
                'slug' => 'cotton-haze',
                'tagline' => 'Clean and soft',
                'description' => 'Fresh laundered cotton wrapped in a soft, velvety warmth — calm, clean, and quietly comforting.',
                'scent_notes' => 'Cotton, white florals, powder',
                'gallery' => [],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-COT-50', 'label' => '50ml', 'price_pesewas' => 16000, 'compare_at_pesewas' => null, 'stock' => 25, 'is_active' => true],
                    ['sku' => 'BS-RD-COT-100', 'label' => '100ml', 'price_pesewas' => 22000, 'compare_at_pesewas' => null, 'stock' => 18, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Velvet Oud',
                'slug' => 'velvet-oud',
                'tagline' => 'Warm and deep',
                'description' => 'A rich, inviting oud softened with amber and spice — the scent of a warm evening indoors.',
                'scent_notes' => 'Oud, amber, warm spice',
                'gallery' => [],
                'is_featured' => true,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-VEL-50', 'label' => '50ml', 'price_pesewas' => 19000, 'compare_at_pesewas' => null, 'stock' => 22, 'is_active' => true],
                    ['sku' => 'BS-RD-VEL-100', 'label' => '100ml', 'price_pesewas' => 26000, 'compare_at_pesewas' => null, 'stock' => 15, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'White Tea & Fig',
                'slug' => 'white-tea-and-fig',
                'tagline' => 'Fresh and green',
                'description' => 'Delicate white tea meets ripe fig and a whisper of green — refined, refreshing, and effortlessly elegant.',
                'scent_notes' => 'White tea, fig, green leaves',
                'gallery' => [],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-WTF-50', 'label' => '50ml', 'price_pesewas' => 17000, 'compare_at_pesewas' => null, 'stock' => 30, 'is_active' => true],
                    ['sku' => 'BS-RD-WTF-100', 'label' => '100ml', 'price_pesewas' => 23000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],

            // ---------------------------- Room Sprays -----------------------------
            [
                'categorySlug' => 'room-sprays',
                'name' => 'Snow Melon Mist',
                'slug' => 'snow-melon-mist',
                'tagline' => 'Signature, in a spray',
                'description' => 'The crisp sweetness of Snow Melon in an instant mist — a few sprays to refresh and welcome.',
                'scent_notes' => 'Crisp melon, sweet citrus, clean musk',
                'gallery' => [],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RS-SNM-100', 'label' => '100ml', 'price_pesewas' => 15000, 'compare_at_pesewas' => null, 'stock' => 50, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'room-sprays',
                'name' => 'Amber Noir',
                'slug' => 'amber-noir',
                'tagline' => 'Bold and warm',
                'description' => 'Smoky amber and dark woods for a room that feels considered, warm, and quietly luxurious.',
                'scent_notes' => 'Amber, dark woods, vanilla',
                'gallery' => [],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RS-AMB-100', 'label' => '100ml', 'price_pesewas' => 17000, 'compare_at_pesewas' => null, 'stock' => 28, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'room-sprays',
                'name' => 'Citrus Grove',
                'slug' => 'citrus-grove',
                'tagline' => 'Bright and clean',
                'description' => 'Sun-ripe citrus and crushed herbs — a bright, energizing lift for kitchens and mornings.',
                'scent_notes' => 'Orange, lemon, basil',
                'gallery' => [],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RS-CIT-50', 'label' => '50ml', 'price_pesewas' => 9000, 'compare_at_pesewas' => null, 'stock' => 44, 'is_active' => true],
                    ['sku' => 'BS-RS-CIT-100', 'label' => '100ml', 'price_pesewas' => 15000, 'compare_at_pesewas' => null, 'stock' => 33, 'is_active' => true],
                ],
            ],

            // --------------------------- Fragrance Oils ---------------------------
            [
                'categorySlug' => 'fragrance-oils',
                'name' => 'Cotton Haze Oil',
                'slug' => 'cotton-haze-oil',
                'tagline' => 'Concentrated comfort',
                'description' => 'The soft, clean warmth of Cotton Haze in a concentrated oil for burners and humidifiers.',
                'scent_notes' => 'Cotton, white florals, powder',
                'gallery' => [],
                'is_featured' => true,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-FO-COT-50', 'label' => '50ml', 'price_pesewas' => 8000, 'compare_at_pesewas' => null, 'stock' => 60, 'is_active' => true],
                    ['sku' => 'BS-FO-COT-100', 'label' => '100ml', 'price_pesewas' => 14000, 'compare_at_pesewas' => null, 'stock' => 40, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'fragrance-oils',
                'name' => 'Sandal & Cedar Oil',
                'slug' => 'sandal-and-cedar-oil',
                'tagline' => 'Grounded and woody',
                'description' => 'Creamy sandalwood and dry cedar — a grounding, meditative warmth that lingers beautifully.',
                'scent_notes' => 'Sandalwood, cedar, tonka',
                'gallery' => [],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-FO-SAN-50', 'label' => '50ml', 'price_pesewas' => 9000, 'compare_at_pesewas' => null, 'stock' => 38, 'is_active' => true],
                    ['sku' => 'BS-FO-SAN-100', 'label' => '100ml', 'price_pesewas' => 16000, 'compare_at_pesewas' => null, 'stock' => 24, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'fragrance-oils',
                'name' => 'Rose Damask Oil',
                'slug' => 'rose-damask-oil',
                'tagline' => 'Soft and floral',
                'description' => 'Velvety Damask rose with a touch of honey — romantic without ever feeling heavy.',
                'scent_notes' => 'Damask rose, honey, musk',
                'gallery' => [],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-FO-ROS-50', 'label' => '50ml', 'price_pesewas' => 9500, 'compare_at_pesewas' => null, 'stock' => 35, 'is_active' => true],
                    ['sku' => 'BS-FO-ROS-100', 'label' => '100ml', 'price_pesewas' => 16500, 'compare_at_pesewas' => null, 'stock' => 21, 'is_active' => true],
                ],
            ],

            // ---------------------------- Humidifiers -----------------------------
            [
                'categorySlug' => 'humidifiers',
                'name' => 'Mist Botanica',
                'slug' => 'mist-botanica',
                'tagline' => 'Fragrance as fine mist',
                'description' => 'A quiet ultrasonic humidifier that carries your favourite oils as a cool, even mist — with a soft ambient glow.',
                'scent_notes' => 'Pairs with any Birchscents oil',
                'gallery' => [],
                'is_featured' => true,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-HU-BOT-STD', 'label' => 'Standard', 'price_pesewas' => 34000, 'compare_at_pesewas' => null, 'stock' => 16, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'humidifiers',
                'name' => 'Aura Mini',
                'slug' => 'aura-mini',
                'tagline' => 'Compact and quiet',
                'description' => 'A desk-sized humidifier for offices and bedside tables — gentle mist, whisper-quiet, USB-powered.',
                'scent_notes' => 'Pairs with any Birchscents oil',
                'gallery' => [],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-HU-AUR-STD', 'label' => 'Standard', 'price_pesewas' => 21000, 'compare_at_pesewas' => null, 'stock' => 27, 'is_active' => true],
                ],
            ],

            // ----------------------------- Birch Vase ------------------------------
            [
                'categorySlug' => 'birch-vase',
                'name' => 'The Ashwood Vase',
                'slug' => 'ashwood-vase',
                'tagline' => 'A vessel worth keeping',
                'description' => 'Hand-glazed stoneware in a warm ashwood finish, sized for our 100ml reed diffuser refills — as beautiful empty as it is full.',
                'scent_notes' => 'Fits all Birchscents 100ml reed diffuser refills',
                'gallery' => [],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-BV-ASH-STD', 'label' => 'Standard', 'price_pesewas' => 12000, 'compare_at_pesewas' => null, 'stock' => 24, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'birch-vase',
                'name' => 'The Ivory Stone Vase',
                'slug' => 'ivory-stone-vase',
                'tagline' => 'Clean and considered',
                'description' => 'A matte ivory stoneware vessel with a soft, tactile finish — pairs with any Birchscents reed diffuser refill.',
                'scent_notes' => 'Fits all Birchscents 100ml reed diffuser refills',
                'gallery' => [],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-BV-IVR-STD', 'label' => 'Standard', 'price_pesewas' => 13000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],

            // --------------------------- Car Fragrance -----------------------------
            [
                'categorySlug' => 'car-fragrance',
                'name' => 'Aura Car Diffuser',
                'slug' => 'aura-car-diffuser',
                'tagline' => 'Your commute, elevated',
                'description' => 'A compact ultrasonic diffuser that clips to your vent and carries a fine, even mist through the car — quiet, cordless, USB-powered.',
                'scent_notes' => 'Pairs with any Birchscents car refill',
                'gallery' => [],
                'is_featured' => true,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-CF-AUR-STD', 'label' => 'Standard', 'price_pesewas' => 19500, 'compare_at_pesewas' => null, 'stock' => 30, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'car-fragrance',
                'name' => 'Snow Melon Car Refill',
                'slug' => 'snow-melon-car-refill',
                'tagline' => 'Signature scent, on the road',
                'description' => 'The crisp sweetness of Snow Melon, concentrated into a refill cartridge built for the Aura Car Diffuser.',
                'scent_notes' => 'Crisp melon, sweet citrus, clean musk',
                'gallery' => [],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-CF-SNM-STD', 'label' => 'Standard', 'price_pesewas' => 6500, 'compare_at_pesewas' => null, 'stock' => 50, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'car-fragrance',
                'name' => 'Citrus Grove Car Refill',
                'slug' => 'citrus-grove-car-refill',
                'tagline' => 'Bright and clean, on the road',
                'description' => 'Sun-ripe citrus and crushed herbs in a refill cartridge built for the Aura Car Diffuser.',
                'scent_notes' => 'Orange, lemon, basil',
                'gallery' => [],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-CF-CIT-STD', 'label' => 'Standard', 'price_pesewas' => 6500, 'compare_at_pesewas' => null, 'stock' => 45, 'is_active' => true],
                ],
            ],
        ];
    }
}
