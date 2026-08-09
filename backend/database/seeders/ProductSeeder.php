<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

/**
 * The real Birchscents catalog: 16 fragrance oils (30ml), 14 reed diffuser
 * scents (100ml) + 10 reed diffuser scents (150ml, a near-entirely separate
 * scent line from the 100ml line), and 5 room & fabric spray scents (500ml).
 * Snow Melon is the one scent carried over from the old placeholder catalog
 * (it's the flagship and appears in the real 100ml list); every other old
 * placeholder scent (Cotton Haze, Velvet Oud, White Tea & Fig, Cotton Haze
 * Oil, Sandal & Cedar Oil, Rose Damask Oil, Snow Melon Mist, Amber Noir,
 * Citrus Grove) is deactivated by deactivateDroppedScents() below rather
 * than deleted, so any existing order history stays intact.
 *
 * Prices are flat placeholders per size tier pending real business pricing —
 * edit per-scent via the admin product UI once that's decided. Imagery
 * (image_url + gallery) points at frontend/public/products/<slug>/*.webp.
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

            // Retires any variant no longer declared below (e.g. a size dropped
            // from a product's lineup) — updateOrCreate above only adds/updates,
            // never removes, so without this a relabeled/collapsed product would
            // leave orphaned rows behind.
            $product->variants()->whereNotIn('sku', collect($variants)->pluck('sku'))->delete();
        }

        $this->deactivateDroppedScents();
    }

    /**
     * Any product in these three categories that isn't in the real catalog
     * above (i.e. the old placeholder scents) gets hidden from the storefront
     * rather than deleted — safer if any test orders already reference them.
     */
    private function deactivateDroppedScents(): void
    {
        $categoryIds = Category::whereIn('slug', ['reed-diffusers', 'room-sprays', 'fragrance-oils'])
            ->pluck('id');

        $keepSlugs = collect($this->products())->pluck('slug');

        $dropped = Product::whereIn('category_id', $categoryIds)
            ->whereNotIn('slug', $keepSlugs)
            ->get();

        foreach ($dropped as $product) {
            $product->update(['is_active' => false]);
            $product->variants()->update(['is_active' => false]);
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function products(): array
    {
        return [
            // --------------------------- Reed Diffusers — 100ml ---------------------------
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Snow Melon',
                'slug' => 'snow-melon',
                'tagline' => 'Our signature scent',
                'description' => 'A crisp, sweet and refreshing fragrance that instantly brightens any room while creating a welcoming luxury atmosphere.',
                'scent_notes' => 'Crisp melon, sweet citrus, clean musk',
                'image_url' => '/products/snow-melon/1.webp',
                'gallery' => [
                    '/products/snow-melon/2.webp',
                    '/products/snow-melon/3.webp',
                    '/products/snow-melon/4.webp',
                ],
                'is_featured' => true,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-SNM-100', 'label' => '100ml', 'price_pesewas' => 24500, 'compare_at_pesewas' => 28500, 'stock' => 32, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Bubble Gum',
                'slug' => 'bubble-gum',
                'tagline' => 'Playful and sweet',
                'description' => 'A nostalgic, candy-bright bubblegum accord — sweet, fun, and unapologetically joyful.',
                'scent_notes' => 'Bubblegum, sugared fruit, soft musk',
                'image_url' => '/products/bubble-gum/1.webp',
                'gallery' => [
                    '/products/bubble-gum/2.webp',
                    '/products/bubble-gum/3.webp',
                    '/products/bubble-gum/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-BGM-100', 'label' => '100ml', 'price_pesewas' => 25000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Citrus Noir',
                'slug' => 'citrus-noir',
                'tagline' => 'Dark and citrus-forward',
                'description' => 'Bright citrus grounded in dark woods and amber — bold enough for a statement room.',
                'scent_notes' => 'Bergamot, dark woods, amber',
                'image_url' => '/products/citrus-noir/1.webp',
                'gallery' => [
                    '/products/citrus-noir/2.webp',
                    '/products/citrus-noir/3.webp',
                    '/products/citrus-noir/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-CTN-100', 'label' => '100ml', 'price_pesewas' => 25000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Bloom Strawberry',
                'slug' => 'bloom-strawberry',
                'tagline' => 'Fresh and floral',
                'description' => 'Ripe strawberry woven through soft florals — bright, feminine, and full of bloom.',
                'scent_notes' => 'Strawberry, white florals, soft musk',
                'image_url' => '/products/bloom-strawberry/1.webp',
                'gallery' => [
                    '/products/bloom-strawberry/2.webp',
                    '/products/bloom-strawberry/3.webp',
                    '/products/bloom-strawberry/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-BLS-100', 'label' => '100ml', 'price_pesewas' => 25000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Cloud 9',
                'slug' => 'cloud-9',
                'tagline' => 'Airy and weightless',
                'description' => 'A soft, powdery musk with a barely-there sweetness — calm, clean, and effortless.',
                'scent_notes' => 'Soft musk, powder, white florals',
                'image_url' => '/products/cloud-9/1.webp',
                'gallery' => [
                    '/products/cloud-9/2.webp',
                    '/products/cloud-9/3.webp',
                    '/products/cloud-9/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-CL9-100', 'label' => '100ml', 'price_pesewas' => 25000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Cherry Blossom',
                'slug' => 'cherry-blossom',
                'tagline' => 'Delicate and floral',
                'description' => 'Pale cherry blossom in full, fleeting bloom — light, romantic, and quietly elegant.',
                'scent_notes' => 'Cherry blossom, soft petals, light musk',
                'image_url' => '/products/cherry-blossom/1.webp',
                'gallery' => [
                    '/products/cherry-blossom/2.webp',
                    '/products/cherry-blossom/3.webp',
                    '/products/cherry-blossom/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-CHB-100', 'label' => '100ml', 'price_pesewas' => 25000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Lavender & Citrus',
                'slug' => 'lavender-and-citrus',
                'tagline' => 'Calm meets bright',
                'description' => 'Soothing lavender lifted by fresh citrus — grounding and energizing in equal measure.',
                'scent_notes' => 'Lavender, bergamot, citrus zest',
                'image_url' => '/products/lavender-and-citrus/1.webp',
                'gallery' => [
                    '/products/lavender-and-citrus/2.webp',
                    '/products/lavender-and-citrus/3.webp',
                    '/products/lavender-and-citrus/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-LVC-100', 'label' => '100ml', 'price_pesewas' => 25000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Tarim Peach',
                'slug' => 'tarim-peach',
                'tagline' => 'Juicy and warm',
                'description' => 'A fuller, warmer peach than the everyday kind — sun-ripened and generously sweet.',
                'scent_notes' => 'Peach, apricot, warm florals',
                'image_url' => '/products/tarim-peach/1.webp',
                'gallery' => [
                    '/products/tarim-peach/2.webp',
                    '/products/tarim-peach/3.webp',
                    '/products/tarim-peach/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-TRP-100', 'label' => '100ml', 'price_pesewas' => 25000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Garden Mango',
                'slug' => 'garden-mango',
                'tagline' => 'Ripe and sunlit',
                'description' => 'Garden-ripe mango with a green, leafy edge — tropical without tipping into candy-sweet.',
                'scent_notes' => 'Mango, green leaves, soft citrus',
                'image_url' => '/products/garden-mango/1.webp',
                'gallery' => [
                    '/products/garden-mango/2.webp',
                    '/products/garden-mango/3.webp',
                    '/products/garden-mango/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-GDM-100', 'label' => '100ml', 'price_pesewas' => 25000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Tropical Nectar',
                'slug' => 'tropical-nectar',
                'tagline' => 'Bright and juicy',
                'description' => 'A layered tropical fruit accord — nectar-sweet, sun-warmed, and instantly transporting.',
                'scent_notes' => 'Tropical fruit, nectar, light citrus',
                'image_url' => '/products/tropical-nectar/1.webp',
                'gallery' => [
                    '/products/tropical-nectar/2.webp',
                    '/products/tropical-nectar/3.webp',
                    '/products/tropical-nectar/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-TRN-100', 'label' => '100ml', 'price_pesewas' => 25000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Caramel Muse',
                'slug' => 'caramel-muse',
                'tagline' => 'Rich and inviting',
                'description' => 'Deep caramel softened with vanilla and a touch of warm spice — indulgent without heaviness.',
                'scent_notes' => 'Caramel, vanilla, warm spice',
                'image_url' => '/products/caramel-muse/1.webp',
                'gallery' => [
                    '/products/caramel-muse/2.webp',
                    '/products/caramel-muse/3.webp',
                    '/products/caramel-muse/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-CRM-100', 'label' => '100ml', 'price_pesewas' => 25000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Fruity Cherry',
                'slug' => 'fruity-cherry',
                'tagline' => 'Bold and juicy',
                'description' => 'True, dark cherry at full ripeness — bold, juicy, and a little daring.',
                'scent_notes' => 'Cherry, dark berries, light musk',
                'image_url' => '/products/fruity-cherry/1.webp',
                'gallery' => [
                    '/products/fruity-cherry/2.webp',
                    '/products/fruity-cherry/3.webp',
                    '/products/fruity-cherry/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-FRC-100', 'label' => '100ml', 'price_pesewas' => 25000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Mixed Berries',
                'slug' => 'mixed-berries',
                'tagline' => 'Rich and layered',
                'description' => 'A jammy blend of dark berries — layered, rich, and generously fruity.',
                'scent_notes' => 'Blackberry, blueberry, red currant',
                'image_url' => '/products/mixed-berries/1.webp',
                'gallery' => [
                    '/products/mixed-berries/2.webp',
                    '/products/mixed-berries/3.webp',
                    '/products/mixed-berries/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-MXB-100', 'label' => '100ml', 'price_pesewas' => 25000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Coffee Latte',
                'slug' => 'coffee-latte',
                'tagline' => 'Warm and roasted',
                'description' => 'Freshly steamed coffee softened with warm milk — the scent of a slow morning ritual.',
                'scent_notes' => 'Coffee, steamed milk, vanilla',
                'image_url' => '/products/coffee-latte/1.webp',
                'gallery' => [
                    '/products/coffee-latte/2.webp',
                    '/products/coffee-latte/3.webp',
                    '/products/coffee-latte/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-CFL-100', 'label' => '100ml', 'price_pesewas' => 25000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],

            // --------------------------- Reed Diffusers — 150ml ---------------------------
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Ambusk',
                'slug' => 'ambusk',
                'tagline' => 'Warm and musky',
                'description' => 'A warm amber softened with musk — quiet, grounded, and long-lasting.',
                'scent_notes' => 'Amber, musk, warm woods',
                'image_url' => '/products/ambusk/1.webp',
                'gallery' => [
                    '/products/ambusk/2.webp',
                    '/products/ambusk/3.webp',
                    '/products/ambusk/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-AMB-150', 'label' => '150ml', 'price_pesewas' => 32000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Cingamot',
                'slug' => 'cingamot',
                'tagline' => 'Spiced and citrus-bright',
                'description' => 'Warm cinnamon meets fresh bergamot — a spiced citrus accord with real depth.',
                'scent_notes' => 'Cinnamon, bergamot, warm spice',
                'image_url' => '/products/cingamot/1.webp',
                'gallery' => [
                    '/products/cingamot/2.webp',
                    '/products/cingamot/3.webp',
                    '/products/cingamot/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-CIN-150', 'label' => '150ml', 'price_pesewas' => 32000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Sweet Caramel',
                'slug' => 'sweet-caramel',
                'tagline' => 'Buttery and warm',
                'description' => 'Slow-cooked caramel, buttery and warm — an indulgent scent for cooler evenings.',
                'scent_notes' => 'Caramel, brown butter, vanilla',
                'image_url' => '/products/sweet-caramel/1.webp',
                'gallery' => [
                    '/products/sweet-caramel/2.webp',
                    '/products/sweet-caramel/3.webp',
                    '/products/sweet-caramel/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-SWC-150', 'label' => '150ml', 'price_pesewas' => 32000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Mango Delight',
                'slug' => 'mango-delight',
                'tagline' => 'Sweet and tropical',
                'description' => 'Full, ripe mango rendered generously sweet — a bright, tropical centerpiece for any room.',
                'scent_notes' => 'Mango, tropical fruit, light florals',
                'image_url' => '/products/mango-delight/1.webp',
                'gallery' => [
                    '/products/mango-delight/2.webp',
                    '/products/mango-delight/3.webp',
                    '/products/mango-delight/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-MGD-150', 'label' => '150ml', 'price_pesewas' => 32000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Hami Melon',
                'slug' => 'hami-melon',
                'tagline' => 'Crisp and sweet',
                'description' => 'A pale, honeyed melon with a crisp, watery freshness — light and refreshing.',
                'scent_notes' => 'Hami melon, light citrus, clean musk',
                'image_url' => '/products/hami-melon/1.webp',
                'gallery' => [
                    '/products/hami-melon/2.webp',
                    '/products/hami-melon/3.webp',
                    '/products/hami-melon/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-HAM-150', 'label' => '150ml', 'price_pesewas' => 32000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Oud Blanc',
                'slug' => 'oud-blanc',
                'tagline' => 'Refined and pale',
                'description' => 'A lighter, whiter take on oud — smooth, refined, and far softer than traditional oud.',
                'scent_notes' => 'White oud, soft musk, light amber',
                'image_url' => '/products/oud-blanc/1.webp',
                'gallery' => [
                    '/products/oud-blanc/2.webp',
                    '/products/oud-blanc/3.webp',
                    '/products/oud-blanc/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-OUB-150', 'label' => '150ml', 'price_pesewas' => 32000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Velvet',
                'slug' => 'velvet',
                'tagline' => 'Deep and plush',
                'description' => 'A rich, layered accord of dark fruit and soft musk — plush, deep, and enveloping.',
                'scent_notes' => 'Dark fruit, soft musk, warm amber',
                'image_url' => '/products/velvet/1.webp',
                'gallery' => [
                    '/products/velvet/2.webp',
                    '/products/velvet/3.webp',
                    '/products/velvet/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-VLV-150', 'label' => '150ml', 'price_pesewas' => 32000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Zest',
                'slug' => 'zest',
                'tagline' => 'Bright and energizing',
                'description' => 'A vivid citrus burst with a green herbal edge — sharp, clean, and instantly uplifting.',
                'scent_notes' => 'Citrus zest, green herbs, light musk',
                'image_url' => '/products/zest/1.webp',
                'gallery' => [
                    '/products/zest/2.webp',
                    '/products/zest/3.webp',
                    '/products/zest/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-ZST-150', 'label' => '150ml', 'price_pesewas' => 32000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Fresh Linen',
                'slug' => 'fresh-linen',
                'tagline' => 'Clean and crisp',
                'description' => 'The scent of line-dried linen on a clear day — clean, soft, and quietly comforting.',
                'scent_notes' => 'Clean linen, white musk, soft powder',
                'image_url' => '/products/fresh-linen/1.webp',
                'gallery' => [
                    '/products/fresh-linen/2.webp',
                    '/products/fresh-linen/3.webp',
                    '/products/fresh-linen/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-FRL-150', 'label' => '150ml', 'price_pesewas' => 32000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'reed-diffusers',
                'name' => 'Oasis',
                'slug' => 'oasis',
                'tagline' => 'Cool and green',
                'description' => 'A cool, watery green accord with a soft floral heart — the scent of shade on a warm day.',
                'scent_notes' => 'Green leaves, water lily, soft musk',
                'image_url' => '/products/oasis/1.webp',
                'gallery' => [
                    '/products/oasis/2.webp',
                    '/products/oasis/3.webp',
                    '/products/oasis/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RD-OAS-150', 'label' => '150ml', 'price_pesewas' => 32000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],

            // ------------------------- Luxe Room & Fabric Spray — 500ml -------------------------
            [
                'categorySlug' => 'room-sprays',
                'name' => 'Juve',
                'slug' => 'juve',
                'tagline' => 'Fresh and youthful',
                'description' => 'A crisp, clean fragrance with a soft aquatic edge — bright and effortlessly fresh.',
                'scent_notes' => 'Aquatic notes, light citrus, clean musk',
                'image_url' => '/products/juve/1.webp',
                'gallery' => [
                    '/products/juve/2.webp',
                    '/products/juve/3.webp',
                    '/products/juve/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RS-JUV-500', 'label' => '500ml', 'price_pesewas' => 32000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'room-sprays',
                'name' => 'Colate',
                'slug' => 'colate',
                'tagline' => 'Rich and warm',
                'description' => 'Deep, warm cocoa softened with vanilla — a comforting fragrance for cooler rooms and evenings.',
                'scent_notes' => 'Cocoa, vanilla, warm sugar',
                'image_url' => '/products/colate/1.webp',
                'gallery' => [
                    '/products/colate/2.webp',
                    '/products/colate/3.webp',
                    '/products/colate/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RS-COL-500', 'label' => '500ml', 'price_pesewas' => 32000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'room-sprays',
                'name' => 'Orchid',
                'slug' => 'orchid',
                'tagline' => 'Soft and exotic',
                'description' => 'Delicate orchid with a soft, powdery finish — elegant, floral, and quietly luxurious.',
                'scent_notes' => 'Orchid, soft powder, white musk',
                'image_url' => '/products/orchid/1.webp',
                'gallery' => [
                    '/products/orchid/2.webp',
                    '/products/orchid/3.webp',
                    '/products/orchid/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RS-ORC-500', 'label' => '500ml', 'price_pesewas' => 32000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'room-sprays',
                'name' => 'Spring',
                'slug' => 'spring',
                'tagline' => 'Fresh and blooming',
                'description' => 'New grass and blooming petals — the scent of the first warm day of the season.',
                'scent_notes' => 'Green florals, fresh grass, light citrus',
                'image_url' => '/products/spring/1.webp',
                'gallery' => [
                    '/products/spring/2.webp',
                    '/products/spring/3.webp',
                    '/products/spring/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RS-SPR-500', 'label' => '500ml', 'price_pesewas' => 32000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'room-sprays',
                'name' => 'Lumineer',
                'slug' => 'lumineer',
                'tagline' => 'Bright and radiant',
                'description' => 'A luminous, sparkling fragrance with a soft musk base — polished and quietly radiant.',
                'scent_notes' => 'Sparkling citrus, white florals, soft musk',
                'image_url' => '/products/lumineer/1.webp',
                'gallery' => [
                    '/products/lumineer/2.webp',
                    '/products/lumineer/3.webp',
                    '/products/lumineer/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-RS-LUM-500', 'label' => '500ml', 'price_pesewas' => 32000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],

            // --------------------------- Fragrance Oils — 30ml ---------------------------
            [
                'categorySlug' => 'fragrance-oils',
                'name' => 'Peppermint',
                'slug' => 'peppermint',
                'tagline' => 'Crisp and invigorating',
                'description' => 'A sharp, cooling peppermint that clears the air and sharpens focus — ideal for study spaces and morning routines.',
                'scent_notes' => 'Peppermint, cool menthol, green herbs',
                'image_url' => '/products/peppermint/1.webp',
                'gallery' => [
                    '/products/peppermint/2.webp',
                    '/products/peppermint/3.webp',
                    '/products/peppermint/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-FO-PEP-30', 'label' => '30ml', 'price_pesewas' => 6500, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'fragrance-oils',
                'name' => 'Eucalyptus',
                'slug' => 'eucalyptus',
                'tagline' => 'Clear and grounding',
                'description' => 'A steam-room hush of eucalyptus leaf, calming and restorative — the scent of a slow exhale.',
                'scent_notes' => 'Eucalyptus leaf, camphor, green herbs',
                'image_url' => '/products/eucalyptus/1.webp',
                'gallery' => [
                    '/products/eucalyptus/2.webp',
                    '/products/eucalyptus/3.webp',
                    '/products/eucalyptus/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-FO-EUC-30', 'label' => '30ml', 'price_pesewas' => 6500, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'fragrance-oils',
                'name' => 'Sweet Orange',
                'slug' => 'sweet-orange',
                'tagline' => 'Bright and juicy',
                'description' => 'Sun-warmed orange peel, effortlessly cheerful — a lift for kitchens and mornings.',
                'scent_notes' => 'Orange peel, citrus zest, light sugar',
                'image_url' => '/products/sweet-orange/1.webp',
                'gallery' => [
                    '/products/sweet-orange/2.webp',
                    '/products/sweet-orange/3.webp',
                    '/products/sweet-orange/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-FO-SOR-30', 'label' => '30ml', 'price_pesewas' => 6500, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'fragrance-oils',
                'name' => 'Sandalwood',
                'slug' => 'sandalwood',
                'tagline' => 'Warm and grounded',
                'description' => 'Creamy sandalwood with a soft, milky warmth — a quiet, meditative base note worn alone.',
                'scent_notes' => 'Sandalwood, cream, soft musk',
                'image_url' => '/products/sandalwood/1.webp',
                'gallery' => [
                    '/products/sandalwood/2.webp',
                    '/products/sandalwood/3.webp',
                    '/products/sandalwood/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-FO-SDW-30', 'label' => '30ml', 'price_pesewas' => 6500, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'fragrance-oils',
                'name' => 'Caramel',
                'slug' => 'caramel',
                'tagline' => 'Rich and comforting',
                'description' => 'Deep, buttery caramel without the sweetness turning cloying — the scent of a slow afternoon indoors.',
                'scent_notes' => 'Caramel, brown sugar, warm vanilla',
                'image_url' => '/products/caramel/1.webp',
                'gallery' => [
                    '/products/caramel/2.webp',
                    '/products/caramel/3.webp',
                    '/products/caramel/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-FO-CAR-30', 'label' => '30ml', 'price_pesewas' => 6500, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'fragrance-oils',
                'name' => "Fleur De L'homme",
                'slug' => 'fleur-de-lhomme',
                'tagline' => 'Refined and woody',
                'description' => 'A composed, masculine floral built on soft woods and a whisper of spice — understated and self-assured.',
                'scent_notes' => 'White florals, cedar, black pepper',
                'image_url' => '/products/fleur-de-lhomme/1.webp',
                'gallery' => [
                    '/products/fleur-de-lhomme/2.webp',
                    '/products/fleur-de-lhomme/3.webp',
                    '/products/fleur-de-lhomme/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-FO-FDH-30', 'label' => '30ml', 'price_pesewas' => 6500, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'fragrance-oils',
                'name' => 'Rosa Bianca',
                'slug' => 'rosa-bianca',
                'tagline' => 'Soft and luminous',
                'description' => 'White rose at its most delicate — powdery, pale, and quietly romantic.',
                'scent_notes' => 'White rose, powder, soft musk',
                'image_url' => '/products/rosa-bianca/1.webp',
                'gallery' => [
                    '/products/rosa-bianca/2.webp',
                    '/products/rosa-bianca/3.webp',
                    '/products/rosa-bianca/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-FO-ROB-30', 'label' => '30ml', 'price_pesewas' => 6500, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'fragrance-oils',
                'name' => 'Lavender',
                'slug' => 'lavender',
                'tagline' => 'Calm and grounding',
                'description' => "Classic lavender fields rendered soft and true — the scent of a settled mind at day's end.",
                'scent_notes' => 'Lavender, herbal green, soft powder',
                'image_url' => '/products/lavender/1.webp',
                'gallery' => [
                    '/products/lavender/2.webp',
                    '/products/lavender/3.webp',
                    '/products/lavender/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-FO-LAV-30', 'label' => '30ml', 'price_pesewas' => 6500, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'fragrance-oils',
                'name' => 'Orange Mint',
                'slug' => 'orange-mint',
                'tagline' => 'Zesty and cool',
                'description' => 'Sweet orange brightened with fresh mint — an energizing pairing for kitchens and bathrooms alike.',
                'scent_notes' => 'Orange, spearmint, green leaves',
                'image_url' => '/products/orange-mint/1.webp',
                'gallery' => [
                    '/products/orange-mint/2.webp',
                    '/products/orange-mint/3.webp',
                    '/products/orange-mint/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-FO-ORM-30', 'label' => '30ml', 'price_pesewas' => 6500, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'fragrance-oils',
                'name' => 'Passion Fruit',
                'slug' => 'passion-fruit',
                'tagline' => 'Tropical and tart',
                'description' => 'Vivid, tangy passion fruit with a sun-ripe sweetness — an instant transport to warmer places.',
                'scent_notes' => 'Passion fruit, tropical citrus, light florals',
                'image_url' => '/products/passion-fruit/1.webp',
                'gallery' => [
                    '/products/passion-fruit/2.webp',
                    '/products/passion-fruit/3.webp',
                    '/products/passion-fruit/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-FO-PSF-30', 'label' => '30ml', 'price_pesewas' => 6500, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'fragrance-oils',
                'name' => 'Peach',
                'slug' => 'peach',
                'tagline' => 'Soft and sun-ripened',
                'description' => 'A blushing, velvety peach — sweet without excess, gentle on entry and lingering softly.',
                'scent_notes' => 'Peach, soft florals, light musk',
                'image_url' => '/products/peach/1.webp',
                'gallery' => [
                    '/products/peach/2.webp',
                    '/products/peach/3.webp',
                    '/products/peach/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-FO-PCH-30', 'label' => '30ml', 'price_pesewas' => 6500, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'fragrance-oils',
                'name' => 'Tahitian Gardenia',
                'slug' => 'tahitian-gardenia',
                'tagline' => 'Lush and exotic',
                'description' => 'Full-bloom gardenia with a creamy, tropical richness — elegant and unmistakably lush.',
                'scent_notes' => 'Gardenia, tiare flower, soft cream',
                'image_url' => '/products/tahitian-gardenia/1.webp',
                'gallery' => [
                    '/products/tahitian-gardenia/2.webp',
                    '/products/tahitian-gardenia/3.webp',
                    '/products/tahitian-gardenia/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-FO-TAG-30', 'label' => '30ml', 'price_pesewas' => 6500, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'fragrance-oils',
                'name' => 'Mango & Pawpaw',
                'slug' => 'mango-and-pawpaw',
                'tagline' => 'Sweet and tropical',
                'description' => 'Ripe mango and pawpaw layered into a juicy, sun-drenched fruit accord.',
                'scent_notes' => 'Mango, pawpaw, tropical nectar',
                'image_url' => '/products/mango-and-pawpaw/1.webp',
                'gallery' => [
                    '/products/mango-and-pawpaw/2.webp',
                    '/products/mango-and-pawpaw/3.webp',
                    '/products/mango-and-pawpaw/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-FO-MPW-30', 'label' => '30ml', 'price_pesewas' => 6500, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'fragrance-oils',
                'name' => 'Strawberry',
                'slug' => 'strawberry',
                'tagline' => 'Sweet and familiar',
                'description' => 'Ripe strawberry rendered true, not candied — bright, juicy, and quietly nostalgic.',
                'scent_notes' => 'Strawberry, red berries, light musk',
                'image_url' => '/products/strawberry/1.webp',
                'gallery' => [
                    '/products/strawberry/2.webp',
                    '/products/strawberry/3.webp',
                    '/products/strawberry/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-FO-STR-30', 'label' => '30ml', 'price_pesewas' => 6500, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'fragrance-oils',
                'name' => 'Latte Vanille',
                'slug' => 'latte-vanille',
                'tagline' => 'Creamy and warm',
                'description' => 'Steamed milk and vanilla bean — the scent of a slow morning coffee ritual.',
                'scent_notes' => 'Vanilla bean, steamed milk, warm coffee',
                'image_url' => '/products/latte-vanille/1.webp',
                'gallery' => [
                    '/products/latte-vanille/2.webp',
                    '/products/latte-vanille/3.webp',
                    '/products/latte-vanille/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-FO-LTV-30', 'label' => '30ml', 'price_pesewas' => 6500, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'fragrance-oils',
                'name' => 'Grape Blueberry',
                'slug' => 'grape-blueberry',
                'tagline' => 'Deep and fruity',
                'description' => 'Dark grape and blueberry layered into a rich, jammy fruit accord with a soft finish.',
                'scent_notes' => 'Grape, blueberry, dark berries',
                'image_url' => '/products/grape-blueberry/1.webp',
                'gallery' => [
                    '/products/grape-blueberry/2.webp',
                    '/products/grape-blueberry/3.webp',
                    '/products/grape-blueberry/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-FO-GRB-30', 'label' => '30ml', 'price_pesewas' => 6500, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],

            // ---------------------------- Humidifiers -----------------------------
            [
                'categorySlug' => 'humidifiers',
                'name' => 'Birch Humidifier',
                'slug' => 'birch-humidifier',
                'tagline' => 'Fragrance as fine mist',
                'description' => 'A quiet ultrasonic humidifier that carries your favourite oils as a cool, even mist — with a soft ambient glow.',
                'scent_notes' => 'Pairs with any Birchscents oil',
                'image_url' => '/products/birch-humidifier/1.webp',
                'gallery' => [
                    '/products/birch-humidifier/2.webp',
                    '/products/birch-humidifier/3.webp',
                    '/products/birch-humidifier/4.webp',
                ],
                'is_featured' => true,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-HU-BIR-STD', 'label' => 'Standard', 'price_pesewas' => 34000, 'compare_at_pesewas' => null, 'stock' => 20, 'is_active' => true],
                ],
            ],

            // ----------------------------- Birch Vase ------------------------------
            [
                'categorySlug' => 'birch-vase',
                'name' => 'Birch Vase',
                'slug' => 'birch-vase-standard',
                'tagline' => 'A vessel worth keeping',
                'description' => 'Hand-glazed stoneware sized for our 100ml reed diffuser refills — as beautiful empty as it is full.',
                'scent_notes' => 'Fits all Birchscents 100ml reed diffuser refills',
                'image_url' => '/products/birch-vase-standard/1.webp',
                'gallery' => [
                    '/products/birch-vase-standard/2.webp',
                    '/products/birch-vase-standard/3.webp',
                    '/products/birch-vase-standard/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-BV-VAS-STD', 'label' => 'Standard', 'price_pesewas' => 12000, 'compare_at_pesewas' => null, 'stock' => 24, 'is_active' => true],
                ],
            ],

            // --------------------------- Car Diffuser -------------------------------
            [
                'categorySlug' => 'car-diffuser',
                'name' => 'Ultrasonic Car Diffuser',
                'slug' => 'ultrasonic-car-diffuser',
                'tagline' => 'Your commute, elevated',
                'description' => 'A compact ultrasonic diffuser that clips to your vent and carries a fine, even mist through the car — quiet, cordless, USB-powered.',
                'scent_notes' => 'Pairs with the Car Diffuser Refill',
                'image_url' => '/products/ultrasonic-car-diffuser/1.webp',
                'gallery' => [
                    '/products/ultrasonic-car-diffuser/2.webp',
                    '/products/ultrasonic-car-diffuser/3.webp',
                    '/products/ultrasonic-car-diffuser/4.webp',
                    '/products/ultrasonic-car-diffuser/5.webp',
                    '/products/ultrasonic-car-diffuser/6.webp',
                ],
                'is_featured' => true,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-CD-ULT-STD', 'label' => 'Standard', 'price_pesewas' => 19500, 'compare_at_pesewas' => null, 'stock' => 30, 'is_active' => true],
                ],
            ],
            [
                'categorySlug' => 'car-diffuser',
                'name' => 'Car Diffuser Refill',
                'slug' => 'car-diffuser-refill',
                'tagline' => 'Keep the atmosphere going',
                'description' => 'A refill box for the Ultrasonic Car Diffuser, stocked with an assortment of Birchscents signature scents — swap in a fresh cartridge as each one runs out.',
                'scent_notes' => 'An assortment of Birchscents signature scents',
                'image_url' => '/products/car-diffuser-refill/1.webp',
                'gallery' => [
                    '/products/car-diffuser-refill/2.webp',
                    '/products/car-diffuser-refill/3.webp',
                    '/products/car-diffuser-refill/4.webp',
                ],
                'is_featured' => false,
                'is_active' => true,
                'variants' => [
                    ['sku' => 'BS-CD-REF-STD', 'label' => 'Standard', 'price_pesewas' => 6500, 'compare_at_pesewas' => null, 'stock' => 50, 'is_active' => true],
                ],
            ],
        ];
    }
}
