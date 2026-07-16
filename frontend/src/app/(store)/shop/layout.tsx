import { getCategories } from "@/lib/api";
import { ShopChrome } from "@/components/product/ShopChrome";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();
  return <ShopChrome categories={categories}>{children}</ShopChrome>;
}
