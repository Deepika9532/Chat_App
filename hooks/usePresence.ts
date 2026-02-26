"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function usePresence() {
  const { userId } = useAuth();
  const updateUserStatus = useMutation(api.users.updateUserOnlineStatus);

  useEffect(() => {
    if (!userId) return;

    // Set user as online when component mounts
    const setOnline = async () => {
      try {
        await updateUserStatus({ userId, isOnline: true });
      } catch (error) {
        console.error("Failed to set user online:", error);
      }
    };

    setOnline();

    // Set user as offline when component unmounts or page is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateUserStatus({ userId, isOnline: false }).catch(console.error);
      } else {
        updateUserStatus({ userId, isOnline: true }).catch(console.error);
      }
    };

    const handleBeforeUnload = () => {
      updateUserStatus({ userId, isOnline: false }).catch(console.error);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      updateUserStatus({ userId, isOnline: false }).catch(console.error);
    };
  }, [userId, updateUserStatus]);
}