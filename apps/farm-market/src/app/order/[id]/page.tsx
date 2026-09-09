import type { Metadata } from "next";
import { OrderConfirmationClient } from "./OrderConfirmationClient";

export const metadata: Metadata = {
  title: "Order Confirmation",
  robots: { index: false, follow: false },
};

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  return <OrderConfirmationClient id={params.id} />;
}
