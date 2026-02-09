"use client";

import { useIdleReset } from "@/hooks/use-idle-reset";

interface IdleResetProviderProps {
  children: React.ReactNode;
  /**
   * Timeout in milliseconds before triggering hard reset
   * @default 120000 (2 minutes)
   */
  timeout?: number;
}

/**
 * Client component wrapper that applies idle reset protection
 * to the entire application. Must be used in a client component context.
 */
export function IdleResetProvider({
  children,
  timeout,
}: IdleResetProviderProps) {
  useIdleReset({ timeout });

  return <>{children}</>;
}
