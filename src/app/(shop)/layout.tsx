import { SiteHeader } from "@/shared/layout/shop/site-header";
import { SiteFooter } from "@/shared/layout/shop/site-footer";
import { MobileTabBar } from "@/shared/layout/shop/mobile-tab-bar";
import { CompareBar, InstallPrompt } from "@/shared/layout/shop/floating-bars";
import { CartDrawer } from "@/modules/cart/components/cart-drawer";
import { ShopChatbot } from "@/modules/ai/components/shop-chatbot";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh]">{children}</main>
      <SiteFooter />
      <MobileTabBar />
      <CartDrawer />
      <CompareBar />
      <ShopChatbot />
      <InstallPrompt />
    </>
  );
}
