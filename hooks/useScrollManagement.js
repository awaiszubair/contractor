import { useEffect, useState, useRef, useLayoutEffect } from "react";

export function useScrollManagement({
  messageListRef,
  messages,
  isLoadingMore,
  hasMore,
  onLoadMore,
}) {
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const loadLockRef = useRef(false);

  //   Use Layout
  useLayoutEffect(() => {
    if (!messageListRef.current) return;
    if (!isInitialLoad) return;
    if (messages.length === 0) return;

    const el = messageListRef.current;

    // Jump instantly to bottom on first load
    el.scrollTop = el.scrollHeight;
  }, [messages.length, isInitialLoad]);

  //   Use Effect
  useEffect(() => {
    if (isInitialLoad && messages.length > 0) {
      setIsInitialLoad(false);
    }
  }, [messages.length, isInitialLoad]);

  const handleScroll = () => {
    const el = messageListRef.current;
    if (!el) return;

    if (isInitialLoad || isLoadingMore || !hasMore) return;

    // Prevent repeated triggers
    if (loadLockRef.current) return;

    // No overflow → don't paginate
    if (el.scrollHeight <= el.clientHeight) return;

    if (el.scrollTop <= 80) {
      loadLockRef.current = true; // 🔒 LOCK
      setPrevScrollHeight(el.scrollHeight);
      onLoadMore();
    }
  };

  useLayoutEffect(() => {
    const el = messageListRef.current;
    if (!el || prevScrollHeight === 0) return;

    const newScrollHeight = el.scrollHeight;
    el.scrollTop = newScrollHeight - prevScrollHeight;

    // wait for browser paint to stabilize scroll
    requestAnimationFrame(() => {
      loadLockRef.current = false; // 🔓 UNLOCK
    });

    setPrevScrollHeight(0);
  }, [messages.length]);

  return { isInitialLoad, handleScroll };
}
