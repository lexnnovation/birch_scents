import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartOrderSync } from "@/components/cart/CartOrderSync";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* clears the floating mobile tab bar */}
      <div className="h-20 md:hidden" />
      <MobileTabBar />
      <CartDrawer />
      <CartOrderSync />
    </>
  );
}
