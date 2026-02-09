"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/hooks/useSocket";
import DashboardNav from "@/components/DashboardNav";
import ChatSidebar from "@/components/ChatSidebar";

export default function GlobalChatPage() {
  const { user, loading: authLoading } = useAuth();

  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);

  const { socket, isConnected } = useSocket();

  // Chat State
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Track online users
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  // Join personal user room on connection
  useEffect(() => {
    if (socket && isConnected && user) {
      socket.emit("join_personal_room", user.id);
      console.log(`Joined personal room: user_${user.id}`);
    }
  }, [socket, isConnected, user]);

  // Listen for user online/offline status
  useEffect(() => {
    if (socket && isConnected) {
      // Receive initial list of online users
      const handleOnlineUsersList = (userIds) => {
        console.log("📋 Received online users list:", userIds);
        setOnlineUsers(new Set(userIds));
      };

      const handleUserOnline = (userId) => {
        console.log("👤 User came online:", userId);
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          newSet.add(userId);
          console.log("Current online users:", Array.from(newSet));
          return newSet;
        });
      };

      const handleUserOffline = (userId) => {
        console.log("👤 User went offline:", userId);
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          console.log("Current online users:", Array.from(newSet));
          return newSet;
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
    }
  }, [socket, isConnected]);

  // Handle Socket Events & Room Joining for specific chat
  useEffect(() => {
    if (socket && isConnected && selectedUser && user) {
      const ids = [user.id, selectedUser._id].sort();
      const roomId = `chat_${ids[0]}_${ids[1]}`;

      socket.emit("join_chat_room", roomId);
      console.log(`Joined chat room: ${roomId}`);

      const handleNewMessage = (msg) => {
        console.log("📨 New message received:", msg);

        // Extract IDs safely
        const msgSenderId = msg.sender?._id || msg.sender;
        const msgReceiverId = msg.receiver?._id || msg.receiver;
        const selectedUserId = selectedUser._id;
        const currentUserId = user.id;

        console.log("Message details:", {
          from: msgSenderId,
          to: msgReceiverId,
          selectedUser: selectedUserId,
          currentUser: currentUserId,
          content: msg.content,
        });

        // Check if message is part of current conversation
        const isRelevantMessage =
          (msgSenderId === selectedUserId && msgReceiverId === currentUserId) ||
          (msgSenderId === currentUserId && msgReceiverId === selectedUserId);

        if (isRelevantMessage) {
          console.log("✅ Message is relevant, adding to UI");
          setMessages((prev) => {
            // Prevent duplicates
            const exists = prev.find((m) => m._id === msg._id);
            if (exists) {
              console.log("⚠️  Duplicate message, skipping");
              return prev;
            }
            return [...prev, msg];
          });
          scrollToBottom();

          // Play notification sound if from other user
          if (msgSenderId === selectedUserId) {
            console.log("🔔 New message came - ting tone");
            // Add your notification sound here
          }
        } else {
          console.log("❌ Message not relevant to current chat, ignoring");
        }
      };

      socket.on("new_message", handleNewMessage);

      return () => {
        console.log("Cleaning up new_message listener");
        socket.off("new_message", handleNewMessage);
      };
    }
  }, [socket, isConnected, selectedUser, user]);

  // Fetch Messages when User Selected
  useEffect(() => {
    if (selectedUser && user) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedUser, filter]);

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

      const activeProjectId =
        filter !== "all"
          ? filter
          : selectedUser.projects?.[0] || projects[0]?._id;

      if (filter !== "all") {
        query += `&projectId=${filter}`;
      }

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

    console.log("Project determination logic starting. Filter:", filter);

    // Determine Project ID to tag
    const activeProjectId =
      filter !== "all" ? filter : selectedUser.projects?.[0];
    if (!activeProjectId) {
      alert("No common project found context for this chat.");
      return;
    }

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
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const newMsg = data.message;
        console.log("[sendMessage] Message saved, adding to UI:", newMsg);
        setMessages((prev) => [...prev, newMsg]);
        setInput("");
        scrollToBottom();

        // Emit via Socket
        if (socket) {
          console.log("Now entered into socket");

          if (!socket.connected) {
            console.error("❌ Socket not connected, cannot send message");
            return;
          }

          console.log("✅ Socket is connected, emitting message");

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

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file);
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

  if (authLoading) return <div className="p-8">Loading...</div>;
  if (!user) return <div className="p-8">Access Denied</div>;

  // Check if selected user is online
  const isSelectedUserOnline = selectedUser
    ? onlineUsers.has(selectedUser._id)
    : false;

  console.log("Selected user online status:", {
    selectedUserId: selectedUser?._id,
    isOnline: isSelectedUserOnline,
    allOnlineUsers: Array.from(onlineUsers),
  });

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col md:flex-row bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        onSelectUser={setSelectedUser}
        selectedUser={selectedUser}
        projects={projects}
        onFilterChange={setFilter}
        currentFilter={filter}
      />

      {/* Chat Window */}
      <div className="flex-1 flex flex-col h-full bg-[#f0f2f5]">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                    {selectedUser.avatar ? (
                      <img
                        src={selectedUser.avatar}
                        className="w-full h-full"
                      />
                    ) : (
                      selectedUser.name[0]
                    )}
                  </div>
                  {/* Online indicator dot */}
                  {isSelectedUserOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-bold">{selectedUser.name}</h2>
                  <p
                    className={`text-xs ${isSelectedUserOnline ? "text-green-600" : "text-gray-500"}`}
                  >
                    {isSelectedUserOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 text-gray-500">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="md:hidden"
                >
                  Back
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('/bg-chat.png')] bg-repeat bg-contain bg-opacity-10">
              {messages.map((msg, idx) => {
                const isMe =
                  msg.sender._id === user.id || msg.sender === user.id;
                return (
                  <div
                    key={idx}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg shadow-sm text-sm 
                                         ${isMe ? "bg-[#d9fdd3]" : "bg-white"}`}
                    >
                      {msg.content && <div>{msg.content}</div>}
                      {msg.type === "file" && msg.attachments?.length > 0 && (
                        <a
                          href={msg.attachments[0]}
                          target="_blank"
                          className="block mt-1 text-blue-600"
                        >
                          📎 Attachment
                        </a>
                      )}

                      <span className="block text-[10px] text-gray-500 text-right mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-gray-100 flex items-center gap-3">
              <label className="cursor-pointer p-2 hover:bg-gray-200 rounded-full">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                📎
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Type a message"
                className="flex-1 px-4 py-2 rounded-full border border-white focus:outline-none"
              />
              <button onClick={() => sendMessage(input)} className="p-2">
                ➤
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 flex items-center justify-center text-4xl">
              💬
            </div>
            <h2 className="text-xl font-bold text-gray-700">
              Contractor Chat Web
            </h2>
            <p className="mt-2 text-sm text-center max-w-md">
              Send and receive messages. <br /> Select a user from the sidebar
              to start chatting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
