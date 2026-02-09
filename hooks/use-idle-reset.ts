"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseIdleResetOptions {
  /**
   * Timeout in milliseconds before triggering hard reset
   * @default 120000 (2 minutes)
   */
  timeout?: number;
}

/**
 * Custom hook that detects user inactivity and performs a hard reset
 * when no activity is detected for the specified timeout period.
 * 
 * Hard reset includes:
 * - Clearing localStorage
 * - Clearing sessionStorage
 * - Forcing browser reload
 * 
 * Activity events monitored:
 * - mousemove
 * - mousedown
 * - keypress
 * - scroll
 * - touchstart
 */
export function useIdleReset(options: UseIdleResetOptions = {}) {
  const { timeout = 120000 } = options; // Default 2 minutes
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const performHardReset = useCallback(() => {
    // Clear all storage
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error("Error clearing storage:", error);
    }

    // Force browser reload
    window.location.reload();
  }, []);

  const resetTimer = useCallback(() => {
    // Clear existing timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timer
    timeoutRef.current = setTimeout(() => {
      performHardReset();
    }, timeout);
  }, [timeout, performHardReset]);

  useEffect(() => {
    // List of events to monitor for user activity
    const activityEvents: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keypress",
      "scroll",
      "touchstart",
    ];

    // Add event listeners
    const handleActivity = () => {
      resetTimer();
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initialize timer on mount
    resetTimer();

    // Cleanup function
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimer]);
}
