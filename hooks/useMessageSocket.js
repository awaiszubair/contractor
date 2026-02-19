import { useEffect } from "react";

export function useMessageSocket(socket, setMessages) {
  useEffect(() => {
    if (!socket || !socket.connected) return;

    const handlePrivateMessage = (editedMessage) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id === editedMessage._id) {
            return editedMessage;
          }
          return msg;
        }),
      );
    };

    socket.on("private_message", handlePrivateMessage);

    return () => {
      socket.off("private_message");
    };
  }, [socket, socket?.connected, setMessages]);
}
