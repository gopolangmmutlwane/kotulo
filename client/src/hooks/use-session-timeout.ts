import { useEffect, useCallback, useRef } from "react";
import { useAuth } from "./use-auth";

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIMEOUT = 5 * 60 * 1000; // 5 minutes before timeout

export function useSessionTimeout() {
  const { logout, isAuthenticated } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();
  const warningShownRef = useRef(false);

  const resetTimeout = useCallback(() => {
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }
    warningShownRef.current = false;

    if (!isAuthenticated) return;

    // Set warning timeout
    warningRef.current = setTimeout(() => {
      if (!warningShownRef.current) {
        warningShownRef.current = true;
        showSessionWarning();
      }
    }, SESSION_TIMEOUT - WARNING_TIMEOUT);

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      logout();
      showSessionExpired();
    }, SESSION_TIMEOUT);
  }, [isAuthenticated, logout]);

  const showSessionWarning = useCallback(() => {
    const message = "Your session will expire in 5 minutes. Do you want to extend it?";
    if (window.confirm(message)) {
      resetTimeout();
    }
  }, [resetTimeout]);

  const showSessionExpired = useCallback(() => {
    alert("Your session has expired due to inactivity. Please log in again.");
  }, []);

  // Setup activity listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const activities = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleActivity = () => {
      resetTimeout();
    };

    // Add event listeners
    activities.forEach((event) => {
      window.addEventListener(event, handleActivity, true);
    });

    // Initial timeout setup
    resetTimeout();

    // Cleanup
    return () => {
      activities.forEach((event) => {
        window.removeEventListener(event, handleActivity, true);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
    };
  }, [isAuthenticated, resetTimeout]);

  return {
    resetTimeout,
    timeRemaining: SESSION_TIMEOUT,
  };
}
