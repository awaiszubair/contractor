// import { useState, useRef, useEffect } from "react";

// /**
//  * Manages all chat state in one place
//  */
// export function useChatState() {
//   const [projects, setProjects] = useState([]);
//   const [filter, setFilter] = useState("all");
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef(null);

//   return {
//     projects,
//     setProjects,
//     filter,
//     setFilter,
//     selectedUser,
//     setSelectedUser,
//     messages,
//     setMessages,
//     input,
//     setInput,
//     isTyping,
//     setIsTyping,
//     messagesEndRef,
//   };
// }

// /**
//  * Handles all chat-related API calls and business logic
//  */
// export function useChatHandlers({
//   user,
//   selectedUser,
//   filter,
//   socket,
//   setProjects,
//   setMessages,
//   setInput,
//   handleStopTyping,
//   scrollToBottom,
// }) {
//   const fetchProjects = async () => {
//     try {
//       const res = await fetch("/api/projects");
//       const data = await res.json();
//       if (res.ok) setProjects(data.projects || []);
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   const fetchMessages = async () => {
//     try {
//       console.log(
//         "[fetchMessages] Starting fetch for:",
//         selectedUser.name,
//         selectedUser._id,
//       );
//       let query = `?receiverId=${selectedUser._id}`;
//       if (filter !== "all") query += `&projectId=${filter}`;

//       console.log("[fetchMessages] Query:", query);
//       const res = await fetch(`/api/messages${query}`);
//       const data = await res.json();
//       console.log(
//         "[fetchMessages] Response:",
//         data.messages?.length,
//         "messages",
//       );
//       if (res.ok) setMessages(data.messages || []);
//       scrollToBottom();
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   const sendMessage = async (content, type = "text", attachments = []) => {
//     console.log("Send Message Button clicked");
//     if (!content && attachments.length === 0) return;
//     if (!selectedUser) return;

//     const activeProjectId =
//       filter !== "all" ? filter : selectedUser.projects?.[0];
//     if (!activeProjectId) {
//       alert("No common project found context for this chat.");
//       return;
//     }

//     handleStopTyping();

//     try {
//       const res = await fetch("/api/messages", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           projectId: activeProjectId,
//           receiverId: selectedUser._id,
//           content,
//           type,
//           attachments,
//           status: "sent",
//         }),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         const newMsg = data.message;
//         console.log("[sendMessage] Message saved, adding to UI:", newMsg);
//         setMessages((prev) => [...prev, newMsg]);
//         setInput("");
//         scrollToBottom();

//         if (socket) {
//           if (!socket.connected) {
//             console.error("❌ Socket not connected, cannot send message");
//             return;
//           }
//           const ids = [user.id, selectedUser._id].sort();
//           const roomId = `chat_${ids[0]}_${ids[1]}`;
//           console.log("Emitting private_message:", {
//             roomId,
//             receiver: selectedUser._id,
//             content: newMsg.content,
//           });
//           socket.emit("private_message", {
//             ...newMsg,
//             roomId,
//             receiver: selectedUser._id,
//           });
//           console.log("✅ Message emitted successfully");
//         } else {
//           console.warn("⚠️  Socket not available");
//         }
//       }
//     } catch (e) {
//       console.error("Error sending message:", e);
//     }
//   };

//   const uploadFile = async (file, name, type = "file") => {
//     const formData = new FormData();
//     formData.append("file", file, name || file.name);

//     try {
//       const res = await fetch("/api/upload", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();

//       if (res.ok) await sendMessage(null, type, [data.url]);
//     } catch (e) {
//       console.error("Upload error:", e);
//     }
//   };

//   return {
//     fetchProjects,
//     fetchMessages,
//     sendMessage,
//     uploadFile,
//   };
// }

// /**
//  * Manages all side effects and lifecycle hooks
//  */
// export function useChatEffects({
//   user,
//   selectedUser,
//   filter,
//   messages,
//   fetchProjects,
//   fetchMessages,
//   setMessages,
//   setIsTyping,
//   markMessagesAsRead,
// }) {
//   // Fetch projects on mount
//   useEffect(() => {
//     if (user) fetchProjects();
//   }, [user]);

//   // Fetch messages when user or filter changes
//   useEffect(() => {
//     if (selectedUser && user) fetchMessages();
//     else setMessages([]);
//   }, [selectedUser, filter]);

//   // Reset typing when switching users
//   useEffect(() => {
//     setIsTyping(false);
//   }, [selectedUser]);

//   // Mark messages as read when opening a chat
//   useEffect(() => {
//     if (selectedUser && user && messages.length > 0) markMessagesAsRead();
//   }, [selectedUser]);
// }

import { useState, useRef, useEffect } from "react";

/**
 * Manages all chat state in one place
 */
export function useChatState() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  return {
    projects,
    setProjects,
    filter,
    setFilter,
    selectedUser,
    setSelectedUser,
    messages,
    setMessages,
    input,
    setInput,
    isTyping,
    setIsTyping,
    messagesEndRef,
  };
}

/**
 * Handles all chat-related API calls and business logic
 */
export function useChatHandlers({
  user,
  selectedUser,
  filter,
  socket,
  setProjects,
  setMessages,
  setInput,
  handleStopTyping,
  scrollToBottom, // ← Received from useChatSocket
}) {
  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (res.ok) setProjects(data.projects || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMessages = async () => {
    try {
      console.log(
        "[fetchMessages] Starting fetch for:",
        selectedUser.name,
        selectedUser._id,
      );
      let query = `?receiverId=${selectedUser._id}`;
      if (filter !== "all") query += `&projectId=${filter}`;

      console.log("[fetchMessages] Query:", query);
      const res = await fetch(`/api/messages${query}`);
      const data = await res.json();
      console.log(
        "[fetchMessages] Response:",
        data.messages?.length,
        "messages",
      );
      if (res.ok) setMessages(data.messages || []);
      scrollToBottom();
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = async (content, type = "text", attachments = []) => {
    console.log("Send Message Button clicked");
    if (!content && attachments.length === 0) return;
    if (!selectedUser) return;

    const activeProjectId =
      filter !== "all" ? filter : selectedUser.projects?.[0];
    if (!activeProjectId) {
      alert("No common project found context for this chat.");
      return;
    }

    handleStopTyping();

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: activeProjectId,
          receiverId: selectedUser._id,
          content,
          type,
          attachments,
          status: "sent",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const newMsg = data.message;
        console.log("[sendMessage] Message saved, adding to UI:", newMsg);
        setMessages((prev) => [...prev, newMsg]);
        setInput("");
        scrollToBottom();

        if (socket) {
          if (!socket.connected) {
            console.error("❌ Socket not connected, cannot send message");
            return;
          }
          const ids = [user.id, selectedUser._id].sort();
          const roomId = `chat_${ids[0]}_${ids[1]}`;
          console.log("Emitting private_message:", {
            roomId,
            receiver: selectedUser._id,
            content: newMsg.content,
          });
          socket.emit("private_message", {
            ...newMsg,
            roomId,
            receiver: selectedUser._id,
          });
          console.log("✅ Message emitted successfully");
        } else {
          console.warn("⚠️  Socket not available");
        }
      }
    } catch (e) {
      console.error("Error sending message:", e);
    }
  };

  const uploadFile = async (file, name, type = "file") => {
    const formData = new FormData();
    formData.append("file", file, name || file.name);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) await sendMessage(null, type, [data.url]);
    } catch (e) {
      console.error("Upload error:", e);
    }
  };

  return {
    fetchProjects,
    fetchMessages,
    sendMessage,
    uploadFile,
  };
}

/**
 * Manages all side effects and lifecycle hooks
 */
export function useChatEffects({
  user,
  selectedUser,
  filter,
  messages,
  fetchProjects,
  fetchMessages,
  setMessages,
  setIsTyping,
  markMessagesAsRead,
}) {
  // Fetch projects on mount
  useEffect(() => {
    if (user) fetchProjects();
  }, [user]);

  // Fetch messages when user or filter changes
  useEffect(() => {
    if (selectedUser && user) fetchMessages();
    else setMessages([]);
  }, [selectedUser, filter]);

  // Reset typing when switching users
  useEffect(() => {
    setIsTyping(false);
  }, [selectedUser]);

  // Mark messages as read when opening a chat
  useEffect(() => {
    if (selectedUser && user && messages.length > 0) markMessagesAsRead();
  }, [selectedUser]);
}
