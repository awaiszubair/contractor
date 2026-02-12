"use client";

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
    if (file) uploadFile(file);
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Loading and auth checks
  if (authLoading) return <div className="p-8">Loading...</div>;
  if (!user) return <div className="p-8">Access Denied</div>;

  const isSelectedUserOnline = selectedUser
    ? onlineUsers.has(selectedUser._id)
    : false;

  console.log("Selected user online status:", {
    selectedUserId: selectedUser?._id,
    isOnline: isSelectedUserOnline,
    allOnlineUsers: Array.from(onlineUsers),
  });

  return (
    <div className="max-w-7xl mx-auto">
      <DashboardNav role={user.role} />
      <div className="w-full flex flex-col h-[calc(100vh-100px)] md:flex-row bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <ChatSidebar
          onSelectUser={setSelectedUser}
          selectedUser={selectedUser}
          projects={projects}
          onFilterChange={setFilter}
          currentFilter={filter}
          socket={socket}
        />

        <div className="flex-1 flex flex-col h-full bg-[#f0f2f5]">
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
                currentUserId={user.id}
                messagesEndRef={messagesEndRef}
                hasMore={hasMore} // ← Add this
                isLoadingMore={isLoadingMore} // ← Add this
                onLoadMore={loadMoreMessages} // ← Add thi
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
