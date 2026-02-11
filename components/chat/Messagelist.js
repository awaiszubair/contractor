import { useRef } from "react";
import MessageTicks from "./MessageTicks";

export default function MessageList({
  messages,
  currentUserId,
  messagesEndRef,
}) {
  // 🔥 Store currently playing audio
  const currentAudioRef = useRef(null);

  const handleAudioPlay = (e) => {
    // If another audio is already playing → pause it
    if (currentAudioRef.current && currentAudioRef.current !== e.target) {
      currentAudioRef.current.pause();
    }

    // Set current audio as active
    currentAudioRef.current = e.target;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('/bg-chat.png')] bg-repeat bg-contain bg-opacity-10">
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
                  onPlay={handleAudioPlay} // 🔥 Added this
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
