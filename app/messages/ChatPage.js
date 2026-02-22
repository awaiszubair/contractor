"use client";
import { useSearchParams } from "next/navigation"; 
import Loading from "@/components/Loading";
import { useEffect, useState } from "react";

import {
  useAuth,
  useSocket,
  DashboardNav,
  ChatSidebar,
  useChatSocket,
  useTyping,
  useVoiceRecording,
  ChatHeader,
  MessageList,
  ChatInput,
  ChatEmptyState,
  VoiceRecorder,
} from "./index";

import {
  useChatState,
  useChatEffects,
  useChatHandlers,
} from "@/hooks/useChatLogic";

export default function GlobalChatPage() {
  const { user, loading: authLoading } = useAuth();
  const { socket, isConnected } = useSocket();
   // ADD THIS - Get URL parameters
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatId"); // project ID
  const userId = searchParams.get("userId"); // other user ID
  const messageId = searchParams.get("messageId"); // specific message to scroll to



  // Inside GlobalChatPage
  const editMessageApi = async (msgId, content) => {
    const res = await fetch(`/api/messages/${msgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "edit", content }),
    });
    const data = await res.json();
    if (data.message) {
      setMessages((prev) =>
        prev.map((m) => (m._id === msgId ? data.message : m)),
      );
      // Socket emit
      const ids = [user.id, selectedUser._id].sort();
      const roomId = `chat_${ids[0]}_${ids[1]}`;
      socket.emit("private_message", { ...data.message, roomId });
    }
  };

  const deleteMessageApi = async (msgId) => {
    const res = await fetch(`/api/messages/${msgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete" }),
    });
    const data = await res.json();
    if (data.message) {
      setMessages((prev) =>
        prev.map((m) => (m._id === msgId ? data.message : m)),
      );
      // Socket emit
      const ids = [user.id, selectedUser._id].sort();
      const roomId = `chat_${ids[0]}_${ids[1]}`;
      socket.emit("private_message", { ...data.message, roomId });
    }
  };

  // State management
  const {
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
    setHasMore,
    hasMore,
    setIsLoadingMore,
    isLoadingMore,
    setPage,
    page,
    pendingFile,
    setPendingFile,
  } = useChatState();

  // Socket events, presence, read receipts
  const { onlineUsers, markMessagesAsRead, scrollToBottom } = useChatSocket({
    socket,
    isConnected,
    user,
    selectedUser,
    messages,
    setMessages,
    setIsTyping,
    messagesEndRef, // ← Pass the ref here
  });

  // Typing emit logic
  const { handleTyping, handleStopTyping } = useTyping({
    socket,
    user,
    selectedUser,
  });

  // Voice recording
  const {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecording({
    onRecordingComplete: (audioFile) => {
      uploadFile(audioFile, audioFile.name, "voice");
    },
  });

  // Message and project handlers
  const {
    fetchProjects,
    fetchMessages,
    sendMessage,
    uploadFile,
    loadMoreMessages,
  } = useChatHandlers({
    user,
    selectedUser,
    filter,
    socket,
    setHasMore,
    setProjects,
    setPage,
    setIsLoadingMore,
    setMessages,
    setInput,
    hasMore,
    isLoadingMore,
    pendingFile,
    setPendingFile,
    handleStopTyping,
    scrollToBottom,
  });

  // Effects for data fetching and lifecycle
  useChatEffects({
    user,
    selectedUser,
    filter,
    messages,
    setHasMore,
    fetchProjects,
    fetchMessages,
    setMessages,
    setIsTyping,
    setPage,
    markMessagesAsRead,
  });

  // Input handlers
  const handleInputChange = (e) => {
    setInput(e.target.value);
    handleTyping();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Abhi file ko turant send mat karo
    // Instead, set a "pendingFile" state
    setPendingFile(file);
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
  const autoSelectChat = async () => {
    if (!user || !chatId || !userId) return;
    
    console.log("🔍 Auto-selecting chat:", { chatId, userId });
    
    try {
      // Fetch the specific user data
      const res = await fetch(`/api/users/${userId}`);
      
      if (!res.ok) {
        console.error("❌ Failed to fetch user");
        return;
      }
      
      const userData = await res.json();
      console.log("✅ Fetched user:", userData);
      
      // Only set if different from current selected user
      if (!selectedUser || selectedUser._id !== userData._id) {
        setSelectedUser(userData);
      }
    } catch (error) {
      console.error("❌ Error fetching user:", error);
    }
  };

  autoSelectChat();
}, [user, chatId, userId]); // Remove projects and selectedUser from dependencies

  // Loading and auth checks
  if (authLoading) return <Loading message="Loading Messages..." />;
  if (!user) return <div className="p-8">Access Denied</div>;

  const isSelectedUserOnline = selectedUser
    ? onlineUsers.has(selectedUser._id)
    : false;

  console.log("Selected user online status:", {
    selectedUserId: selectedUser?._id,
    isOnline: isSelectedUserOnline,
    allOnlineUsers: Array.from(onlineUsers),
  });

    // ADD THIS - Auto-select chat from URL params
  // In GlobalChatPage.js




  return (
    <div className="max-w-7xl mx-auto">
      <DashboardNav role={user.role} />
      <div className={`w-full flex flex-col overflow-hidden ${selectedUser ? 'h-[calc(100vh-100px)]' : 'h-[100vh]'} md:flex-row bg-white rounded-lg shadow border border-gray-200 `}>
        <ChatSidebar
          onSelectUser={setSelectedUser}
          selectedUser={selectedUser}
          projects={projects}
          onlineUsers={onlineUsers}
          onFilterChange={setFilter}
          currentFilter={filter}
          socket={socket}
        />

        <div className="flex-1 flex flex-col  h-full bg-[#f0f2f5]">
          {selectedUser ? (
            <>
              <ChatHeader
                selectedUser={selectedUser}
                isOnline={isSelectedUserOnline}
                isTyping={isTyping}
                onBack={() => setSelectedUser(null)}
              />
              <MessageList
                messages={messages}
                setMessages={setMessages}
                currentUserId={user.id}
                messagesEndRef={messagesEndRef}
                hasMore={hasMore} // ← Add this
                isLoadingMore={isLoadingMore} // ← Add this
                onLoadMore={loadMoreMessages} // ← Add this
                socket={socket}
                editMessageApi={editMessageApi}
                deleteMessageApi={deleteMessageApi}
                highlightMessageId={messageId}
              />
              <div className="relative">
                <ChatInput
                  input={input}
                  onChange={handleInputChange}
                  onSend={sendMessage}
                  onStopTyping={handleStopTyping}
                  onFileChange={handleFileUpload}
                  onMicClick={handleMicClick}
                  isRecording={isRecording}
                  pendingFile={pendingFile}
                  setPendingFile={setPendingFile}
                />
                {isRecording && (
                  <VoiceRecorder
                    recordingTime={recordingTime}
                    onStop={stopRecording}
                    onCancel={cancelRecording}
                  />
                )}
              </div>
            </>
          ) : (
            <ChatEmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
