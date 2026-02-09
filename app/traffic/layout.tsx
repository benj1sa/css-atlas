import { IdleResetProvider } from "@/components/idle-reset-provider";

/**
 * Traffic route layout.
 * This layout wraps all pages under the /traffic route.
 */
export default function TrafficLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <IdleResetProvider>
      {children}
    </IdleResetProvider>
  );
}