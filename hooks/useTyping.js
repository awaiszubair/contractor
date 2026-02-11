import { useRef } from "react";

export function useTyping({ socket, user, selectedUser }) {
  const typingTimeoutRef = useRef(null);

  const handleTyping = () => {
    if (!socket || !selectedUser || !user) return;

    socket.emit("typing", { userId: user.id, receiverId: selectedUser._id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  };

  const handleStopTyping = () => {
    if (!socket || !selectedUser || !user) return;

    socket.emit("stop_typing", {
      userId: user.id,
      receiverId: selectedUser._id,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  return { handleTyping, handleStopTyping };
}
