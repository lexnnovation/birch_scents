import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `Order ${orderNumber}` };
}

export default function OrderConfirmationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
