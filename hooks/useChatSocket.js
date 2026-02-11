// import { useState, useEffect, useRef } from "react";

// export function useChatSocket({
//   socket,
//   isConnected,
//   user,
//   selectedUser,
//   messages,
//   setMessages,
//   setIsTyping,
//   scrollToBottom,
// }) {
//   const processedReadRef = useRef(new Set());
//   const [onlineUsers, setOnlineUsers] = useState(new Set());

//   const scrollToBottom = () => {
//     setTimeout(
//       () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
//       100,
//     );
//   };

//   // Join personal room on connect
//   useEffect(() => {
//     if (socket && isConnected && user) {
//       socket.emit("join_personal_room", user.id);
//       console.log(`Joined personal room: user_${user.id}`);
//     }
//   }, [socket, isConnected, user]);

//   // Online / offline presence
//   useEffect(() => {
//     if (!socket || !isConnected) return;

//     const handleOnlineUsersList = (userIds) => {
//       console.log("📋 Received online users list:", userIds);
//       setOnlineUsers(new Set(userIds));
//     };
//     const handleUserOnline = (userId) => {
//       console.log("👤 User came online:", userId);
//       setOnlineUsers((prev) => {
//         const s = new Set(prev);
//         s.add(userId);
//         return s;
//       });
//     };
//     const handleUserOffline = (userId) => {
//       console.log("👤 User went offline:", userId);
//       setOnlineUsers((prev) => {
//         const s = new Set(prev);
//         s.delete(userId);
//         return s;
//       });
//     };

//     socket.on("online_users_list", handleOnlineUsersList);
//     socket.on("user_online", handleUserOnline);
//     socket.on("user_offline", handleUserOffline);

//     return () => {
//       socket.off("online_users_list", handleOnlineUsersList);
//       socket.off("user_online", handleUserOnline);
//       socket.off("user_offline", handleUserOffline);
//     };
//   }, [socket, isConnected]);

//   // Typing indicator
//   useEffect(() => {
//     if (!socket || !isConnected || !selectedUser || !user) return;

//     const handleUserTyping = ({ userId, receiverId }) => {
//       console.log("⌨️  User typing event:", userId, receiverId);
//       if (userId === selectedUser._id && receiverId === user.id) {
//         console.log("✅ Showing typing indicator");
//         setIsTyping(true);
//       }
//     };
//     const handleUserStoppedTyping = ({ userId, receiverId }) => {
//       console.log("⌨️  User stopped typing:", userId, receiverId);
//       if (userId === selectedUser._id && receiverId === user.id) {
//         console.log("✅ Hiding typing indicator");
//         setIsTyping(false);
//       }
//     };

//     socket.on("user_typing", handleUserTyping);
//     socket.on("user_stopped_typing", handleUserStoppedTyping);

//     return () => {
//       socket.off("user_typing", handleUserTyping);
//       socket.off("user_stopped_typing", handleUserStoppedTyping);
//     };
//   }, [socket, isConnected, selectedUser, user]);

//   // Message delivery / read receipts
//   useEffect(() => {
//     if (!socket || !isConnected) return;

//     const handleMessageDelivered = ({ messageId }) => {
//       console.log("✅ Message delivered:", messageId);
//       setMessages((prev) =>
//         prev.map((msg) =>
//           msg._id === messageId ? { ...msg, status: "delivered" } : msg,
//         ),
//       );
//     };
//     const handleMessageRead = ({ messageId }) => {
//       console.log("👁️ Message read:", messageId);
//       setMessages((prev) =>
//         prev.map((msg) =>
//           msg._id === messageId ? { ...msg, status: "read" } : msg,
//         ),
//       );
//     };

//     socket.on("message_delivered", handleMessageDelivered);
//     socket.on("message_read", handleMessageRead);

//     return () => {
//       socket.off("message_delivered", handleMessageDelivered);
//       socket.off("message_read", handleMessageRead);
//     };
//   }, [socket, isConnected]);

//   // Join chat room + handle incoming messages
//   useEffect(() => {
//     if (!socket || !isConnected || !selectedUser || !user) return;

//     const ids = [user.id, selectedUser._id].sort();
//     const roomId = `chat_${ids[0]}_${ids[1]}`;
//     socket.emit("join_chat_room", roomId);
//     console.log(`Joined chat room: ${roomId}`);

//     const handleNewMessage = (msg) => {
//       console.log("📨 New message received:", msg);
//       const msgSenderId = msg.sender?._id || msg.sender;
//       const msgReceiverId = msg.receiver?._id || msg.receiver;
//       const selectedUserId = selectedUser._id;
//       const currentUserId = user.id;

//       const isRelevantMessage =
//         (msgSenderId === selectedUserId && msgReceiverId === currentUserId) ||
//         (msgSenderId === currentUserId && msgReceiverId === selectedUserId);

//       if (!isRelevantMessage) {
//         console.log("❌ Message not relevant to current chat, ignoring");
//         return;
//       }

//       console.log("✅ Message is relevant, adding to UI");
//       setMessages((prev) => {
//         const exists = prev.find((m) => m._id === msg._id);
//         if (exists) {
//           console.log("⚠️  Duplicate message, skipping");
//           return prev;
//         }
//         return [...prev, msg];
//       });
//       scrollToBottom();
//       setIsTyping(false);

//       if (msgSenderId === selectedUserId) {
//         console.log("🔔 New message came - ting tone");
//         if (socket && msg._id) {
//           socket.emit("message_delivered", {
//             messageId: msg._id,
//             senderId: msgSenderId,
//           });
//           console.log("📬 Emitted delivered status for:", msg._id);
//         }
//         setTimeout(() => markMessageAsRead(msg._id, msgSenderId), 500);
//       }
//     };

//     socket.on("new_message", handleNewMessage);
//     return () => {
//       console.log("Cleaning up new_message listener");
//       socket.off("new_message", handleNewMessage);
//     };
//   }, [socket, isConnected, selectedUser, user]);

//   // Clear processed read tracker when switching users
//   //   useEffect(() => {
//   //     processedReadRef.current.clear();
//   //   }, [selectedUser]);

//   const markMessageAsRead = async (messageId, senderId) => {
//     if (!messageId) return;
//     if (processedReadRef.current.has(messageId)) return;
//     processedReadRef.current.add(messageId);

//     try {
//       const res = await fetch("/api/messages/read", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ messageId }),
//       });
//       if (res.ok) {
//         setMessages((prev) =>
//           prev.map((msg) =>
//             msg._id === messageId ? { ...msg, status: "read" } : msg,
//           ),
//         );
//         if (socket)
//           socket.emit("message_read", { messageId, senderId: senderId });
//       } else {
//         processedReadRef.current.delete(messageId);
//       }
//     } catch (err) {
//       console.error(err);
//       processedReadRef.current.delete(messageId);
//     }
//   };

//   const markMessagesAsRead = async () => {
//     if (!selectedUser || !user) return;
//     const unreadMessages = messages.filter((msg) => {
//       const msgSenderId = msg.sender?._id || msg.sender;
//       return msgSenderId === selectedUser._id && msg.status !== "read";
//     });
//     if (unreadMessages.length === 0) return;
//     console.log("📖 Marking messages as read:", unreadMessages.length);
//     for (const msg of unreadMessages) {
//       await markMessageAsRead(msg._id, selectedUser._id);
//     }
//   };

//   return { onlineUsers, markMessagesAsRead, markMessageAsRead };
// }

import { useState, useEffect, useRef } from "react";

export function useChatSocket({
  socket,
  isConnected,
  user,
  selectedUser,
  messages,
  setMessages,
  setIsTyping,
  messagesEndRef, // ← Now receiving this as a parameter
}) {
  const processedReadRef = useRef(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Scroll to bottom utility
  const scrollToBottom = () => {
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };

  // Join personal room on connect
  useEffect(() => {
    if (socket && isConnected && user) {
      socket.emit("join_personal_room", user.id);
      console.log(`Joined personal room: user_${user.id}`);
    }
  }, [socket, isConnected, user]);

  // Online / offline presence
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleOnlineUsersList = (userIds) => {
      console.log("📋 Received online users list:", userIds);
      setOnlineUsers(new Set(userIds));
    };
    const handleUserOnline = (userId) => {
      console.log("👤 User came online:", userId);
      setOnlineUsers((prev) => {
        const s = new Set(prev);
        s.add(userId);
        return s;
      });
    };
    const handleUserOffline = (userId) => {
      console.log("👤 User went offline:", userId);
      setOnlineUsers((prev) => {
        const s = new Set(prev);
        s.delete(userId);
        return s;
      });
    };

    socket.on("online_users_list", handleOnlineUsersList);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);

    return () => {
      socket.off("online_users_list", handleOnlineUsersList);
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
    };
  }, [socket, isConnected]);

  // Typing indicator
  useEffect(() => {
    if (!socket || !isConnected || !selectedUser || !user) return;

    const handleUserTyping = ({ userId, receiverId }) => {
      console.log("⌨️  User typing event:", userId, receiverId);
      if (userId === selectedUser._id && receiverId === user.id) {
        console.log("✅ Showing typing indicator");
        setIsTyping(true);
      }
    };
    const handleUserStoppedTyping = ({ userId, receiverId }) => {
      console.log("⌨️  User stopped typing:", userId, receiverId);
      if (userId === selectedUser._id && receiverId === user.id) {
        console.log("✅ Hiding typing indicator");
        setIsTyping(false);
      }
    };

    socket.on("user_typing", handleUserTyping);
    socket.on("user_stopped_typing", handleUserStoppedTyping);

    return () => {
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stopped_typing", handleUserStoppedTyping);
    };
  }, [socket, isConnected, selectedUser, user]);

  // Message delivery / read receipts
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleMessageDelivered = ({ messageId }) => {
      console.log("✅ Message delivered:", messageId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, status: "delivered" } : msg,
        ),
      );
    };
    const handleMessageRead = ({ messageId }) => {
      console.log("👁️ Message read:", messageId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, status: "read" } : msg,
        ),
      );
    };

    socket.on("message_delivered", handleMessageDelivered);
    socket.on("message_read", handleMessageRead);

    return () => {
      socket.off("message_delivered", handleMessageDelivered);
      socket.off("message_read", handleMessageRead);
    };
  }, [socket, isConnected]);

  // Join chat room + handle incoming messages
  useEffect(() => {
    if (!socket || !isConnected || !selectedUser || !user) return;

    const ids = [user.id, selectedUser._id].sort();
    const roomId = `chat_${ids[0]}_${ids[1]}`;
    socket.emit("join_chat_room", roomId);
    console.log(`Joined chat room: ${roomId}`);

    const handleNewMessage = (msg) => {
      console.log("📨 New message received:", msg);
      const msgSenderId = msg.sender?._id || msg.sender;
      const msgReceiverId = msg.receiver?._id || msg.receiver;
      const selectedUserId = selectedUser._id;
      const currentUserId = user.id;

      const isRelevantMessage =
        (msgSenderId === selectedUserId && msgReceiverId === currentUserId) ||
        (msgSenderId === currentUserId && msgReceiverId === selectedUserId);

      if (!isRelevantMessage) {
        console.log("❌ Message not relevant to current chat, ignoring");
        return;
      }

      console.log("✅ Message is relevant, adding to UI");
      setMessages((prev) => {
        const exists = prev.find((m) => m._id === msg._id);
        if (exists) {
          console.log("⚠️  Duplicate message, skipping");
          return prev;
        }
        return [...prev, msg];
      });
      scrollToBottom();
      setIsTyping(false);

      if (msgSenderId === selectedUserId) {
        console.log("🔔 New message came - ting tone");
        if (socket && msg._id) {
          socket.emit("message_delivered", {
            messageId: msg._id,
            senderId: msgSenderId,
          });
          console.log("📬 Emitted delivered status for:", msg._id);
        }
        setTimeout(() => markMessageAsRead(msg._id, msgSenderId), 500);
      }
    };

    socket.on("new_message", handleNewMessage);
    return () => {
      console.log("Cleaning up new_message listener");
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, isConnected, selectedUser, user]);

  const markMessageAsRead = async (messageId, senderId) => {
    if (!messageId) return;
    if (processedReadRef.current.has(messageId)) return;
    processedReadRef.current.add(messageId);

    try {
      const res = await fetch("/api/messages/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, status: "read" } : msg,
          ),
        );
        if (socket)
          socket.emit("message_read", { messageId, senderId: senderId });
      } else {
        processedReadRef.current.delete(messageId);
      }
    } catch (err) {
      console.error(err);
      processedReadRef.current.delete(messageId);
    }
  };

  const markMessagesAsRead = async () => {
    if (!selectedUser || !user) return;
    const unreadMessages = messages.filter((msg) => {
      const msgSenderId = msg.sender?._id || msg.sender;
      return msgSenderId === selectedUser._id && msg.status !== "read";
    });
    if (unreadMessages.length === 0) return;
    console.log("📖 Marking messages as read:", unreadMessages.length);
    for (const msg of unreadMessages) {
      await markMessageAsRead(msg._id, selectedUser._id);
    }
  };

  return {
    onlineUsers,
    markMessagesAsRead,
    markMessageAsRead,
    scrollToBottom, // ← Return this so useChatHandlers can use it
  };
}
