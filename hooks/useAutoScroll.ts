"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UseAutoScrollOptions {
  threshold?: number;
  smoothScroll?: boolean;
}

export function useAutoScroll(options: UseAutoScrollOptions = {}) {
  const { threshold = 100, smoothScroll = true } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [newMessagesCount, setNewMessagesCount] = useState(0);

  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smoothScroll ? "smooth" : "auto",
      });
      setNewMessagesCount(0);
    }
  }, [smoothScroll]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom > threshold) {
      setShouldAutoScroll(false);
    } else {
      setShouldAutoScroll(true);
      setNewMessagesCount(0);
    }
  }, [threshold]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return {
    containerRef,
    shouldAutoScroll,
    newMessagesCount,
    scrollToBottom,
    incrementNewMessages: () => {
      if (!shouldAutoScroll) {
        setNewMessagesCount((prev) => prev + 1);
      }
    },
  };
}
