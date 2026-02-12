"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ChatSidebar({
  onSelectUser,
  selectedUser,
  projects,
  onFilterChange,
  currentFilter,
  socket,
}) {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (user) {
      fetchUsers(currentFilter);
    }
  }, [user, currentFilter]);

  // ✅ Listen for real-time updates
  useEffect(() => {
    if (!socket || !socket.connected) {
      console.log("[ChatSidebar] Socket not available or not connected");
      return;
    }

    console.log("[ChatSidebar] 🔌 Setting up socket listeners");

    // ✅ 1. Handle incoming private messages (for sidebar last message update)
    const handlePrivateMessage = (message) => {
      console.log("[ChatSidebar] 📩 Received private_message:", message);

      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.map((u) => {
          // Get sender and receiver IDs
          const senderId =
            typeof message.sender === "object"
              ? message.sender._id
              : message.sender;
          const receiverId = message.receiver;

          // Check if this message involves this user
          const isFromThisUser = senderId === u._id;
          const isToThisUser = receiverId === u._id;

          if (isFromThisUser || isToThisUser) {
            console.log("[ChatSidebar] ✅ Updating last message for:", u.name);
            return {
              ...u,
              lastMessage: {
                content:
                  message.content ||
                  (message.type === "voice"
                    ? "🎤 Voice message"
                    : "📎 Attachment"),
                createdAt: message.createdAt || new Date(),
                sender: senderId,
              },
            };
          }
          return u;
        });

        // Sort by most recent message
        return updatedUsers.sort((a, b) => {
          const aTime = a.lastMessage?.createdAt
            ? new Date(a.lastMessage.createdAt)
            : new Date(0);
          const bTime = b.lastMessage?.createdAt
            ? new Date(b.lastMessage.createdAt)
            : new Date(0);
          return bTime - aTime;
        });
      });
    };

    // ✅ 2. Handle new_message (alternative event for messages)
    const handleNewMessage = (message) => {
      console.log("[ChatSidebar] 📨 Received new_message:", message);
      // Use the same handler as private_message
      handlePrivateMessage(message);
    };

    // ✅ 3. Handle initial online users list
    const handleOnlineUsersList = (userIds) => {
      console.log("[ChatSidebar] 📋 Received online_users_list:", userIds);
      setOnlineUsers(new Set(userIds));
    };

    // ✅ 4. Handle user coming online
    const handleUserOnline = (userId) => {
      console.log("[ChatSidebar] 🟢 User came online:", userId);
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.add(userId);
        console.log("[ChatSidebar] Updated online users:", Array.from(newSet));
        return newSet;
      });
    };

    // ✅ 5. Handle user going offline
    const handleUserOffline = (userId) => {
      console.log("[ChatSidebar] 🔴 User went offline:", userId);
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        console.log("[ChatSidebar] Updated online users:", Array.from(newSet));
        return newSet;
      });
    };

    // Register all socket listeners
    socket.on("private_message", handlePrivateMessage);
    socket.on("new_message", handleNewMessage);
    socket.on("online_users_list", handleOnlineUsersList);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);

    console.log("[ChatSidebar] ✅ Socket listeners registered");

    // Cleanup listeners
    return () => {
      console.log("[ChatSidebar] 🧹 Cleaning up socket listeners");
      socket.off("private_message", handlePrivateMessage);
      socket.off("new_message", handleNewMessage);
      socket.off("online_users_list", handleOnlineUsersList);
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
    };
  }, [socket, socket?.connected]);

  const fetchUsers = async (projectId) => {
    setLoading(true);
    try {
      const query = projectId ? `?projectId=${projectId}` : "?projectId=all";
      const res = await fetch(`/api/chat/users${query}`);
      const data = await res.json();
      if (res.ok) {
        // Sort users by most recent message
        const sortedUsers = (data.users || []).sort((a, b) => {
          const aTime = a.lastMessage?.createdAt
            ? new Date(a.lastMessage.createdAt)
            : new Date(0);
          const bTime = b.lastMessage?.createdAt
            ? new Date(b.lastMessage.createdAt)
            : new Date(0);
          return bTime - aTime;
        });
        setUsers(sortedUsers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header / Filter */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <select
            value={currentFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="font-bold text-lg bg-transparent border-none focus:ring-0 cursor-pointer"
          >
            <option value="all">All Messages</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title}
              </option>
            ))}
          </select>
          <button className="text-gray-500">⋮</button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search or start a new chat"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-100 rounded-full px-4 py-2 pl-10 text-sm focus:outline-none"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            Loading contacts...
          </div>
        ) : (
          filteredUsers.map((u) => {
            const isOnline = onlineUsers.has(u._id);

            return (
              <div
                key={u._id}
                onClick={() => onSelectUser(u)}
                className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 
                                ${selectedUser?._id === u._id ? "bg-gray-100" : ""}`}
              >
                {/* Avatar with online indicator */}
                <div className="relative w-12 h-12 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {u.avatar ? (
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="font-bold text-gray-600 text-lg">
                      {u.name[0]}
                    </div>
                  )}
                  {/* Online status indicator */}
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-gray-900 truncate">
                      {u.name}
                    </h3>
                    {u.lastMessage && (
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {new Date(u.lastMessage.createdAt).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {u.lastMessage?.content || "Click to start chat"}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">
            No users found. <br /> Try changing the filter.
          </div>
        )}
      </div>
    </div>
  );
}
