import { useRef, useEffect, useState } from "react";
import MessageTicks from "./MessageTicks";

export default function MessageList({
  messages,
  currentUserId,
  messagesEndRef,
  hasMore,
  isLoadingMore,
  onLoadMore,
}) {
  // 🔥 Store currently playing audio
  const currentAudioRef = useRef(null);
  const messageListRef = useRef(null);
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const handleAudioPlay = (e) => {
    // If another audio is already playing → pause it
    if (currentAudioRef.current && currentAudioRef.current !== e.target) {
      currentAudioRef.current.pause();
    }

    // Set current audio as active
    currentAudioRef.current = e.target;
  };

  // Mark as not initial load after first render and scroll to bottom
  useEffect(() => {
    if (isInitialLoad && messages.length > 0) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        setIsInitialLoad(false);
      }, 300);
    }
  }, [messages.length, isInitialLoad]);

  // Handle scroll to detect when user reaches top
  const handleScroll = () => {
    if (!messageListRef.current || isLoadingMore || !hasMore) return;

    // Prevent triggering on initial load
    if (isInitialLoad) return;

    const { scrollTop } = messageListRef.current;

    // If user scrolled to top (with some threshold)
    if (scrollTop < 100) {
      setPrevScrollHeight(messageListRef.current.scrollHeight);
      onLoadMore();
    }
  };

  // Maintain scroll position after loading more messages
  useEffect(() => {
    if (messageListRef.current && prevScrollHeight > 0 && !isLoadingMore) {
      const newScrollHeight = messageListRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - prevScrollHeight;
      messageListRef.current.scrollTop = scrollDiff;
      setPrevScrollHeight(0);
    }
  }, [messages.length, isLoadingMore]);

  return (
    <div
      ref={messageListRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('/bg-chat.png')] bg-repeat bg-contain bg-opacity-10"
    >
      {/* WhatsApp-style loader at top */}
      {hasMore && (
        <div className="flex justify-center py-2">
          {isLoadingMore ? (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              <span>Loading messages...</span>
            </div>
          ) : (
            <div className="text-gray-400 text-xs">
              Scroll up for older messages
            </div>
          )}
        </div>
      )}

      {messages.map((msg, idx) => {
        const isMe =
          msg.sender._id === currentUserId || msg.sender === currentUserId;
        const status = msg.status || "sent";

        return (
          <div
            key={idx}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`${
                msg.type === "voice" ? "w-[300px]" : "max-w-[70%]"
              } p-3 rounded-lg shadow-sm text-sm ${
                isMe ? "bg-[#d9fdd3]" : "bg-white"
              }`}
            >
              {msg.content && <div>{msg.content}</div>}

              {msg.type === "voice" && msg.attachments?.length > 0 && (
                <audio
                  controls
                  className="mt-2 w-full max-w-xs"
                  onPlay={handleAudioPlay}
                >
                  <source src={msg.attachments[0]} type="audio/webm" />
                  <source src={msg.attachments[0]} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}

              {msg.type === "file" && msg.attachments?.length > 0 && (
                <a
                  href={msg.attachments[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-1 text-blue-600"
                >
                  📎 Attachment
                </a>
              )}

              <span className="block text-[10px] text-gray-500 text-right mt-1 flex items-center justify-end gap-1">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {isMe && <MessageTicks status={status} />}
              </span>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
