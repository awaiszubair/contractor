'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/hooks/useSocket';
import DashboardNav from '@/components/DashboardNav';
import ChatSidebar from '@/components/ChatSidebar';

export default function GlobalChatPage() {
    const { user, loading: authLoading } = useAuth();
    const { socket, isConnected } = useSocket();

    const [projects, setProjects] = useState([]);
    const [filter, setFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);

    // Chat State
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        if (user) {
            fetchProjects();
        }
    }, [user]);

    // Join personal user room on connection (to receive messages even when not viewing specific chat)
    useEffect(() => {
        if (socket && isConnected && user) {
            socket.emit('join_project', `user_${user.id}`);
            console.log(`Joined personal room: user_${user.id}`);
        }
    }, [socket, isConnected, user]);

    // Handle Socket Events & Room Joining for specific chat
    useEffect(() => {
        if (socket && isConnected && selectedUser && user) {
            const ids = [user.id, selectedUser._id].sort();
            const roomId = `chat_${ids[0]}_${ids[1]}`;

            socket.emit('join_project', roomId);
            console.log(`Joined chat room: ${roomId}`);

            const handleNewMessage = (msg) => {
                console.log('[Socket] New message received:', msg);
                // Only add message if it's part of the current conversation
                const msgSenderId = msg.sender._id || msg.sender;
                const msgReceiverId = msg.receiver?._id || msg.receiver;

                const isFromSelectedUser = msgSenderId === selectedUser._id;
                const isToSelectedUser = msgReceiverId === selectedUser._id;
                const isFromMe = msgSenderId === user.id;
                const isToMe = msgReceiverId === user.id;

                if ((isFromSelectedUser && isToMe) || (isFromMe && isToSelectedUser)) {
                    console.log('[Socket] Message is for this conversation, adding');
                    setMessages((prev) => {
                        if (prev.find(m => m._id === msg._id)) {
                            console.log('[Socket] Duplicate message, skipping');
                            return prev;
                        }
                        return [...prev, msg];
                    });
                    scrollToBottom();
                }
            };

            socket.on('new_message', handleNewMessage);
            socket.on('receive_message', handleNewMessage);

            return () => {
                socket.off('new_message', handleNewMessage);
                socket.off('receive_message', handleNewMessage);
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
    }, [selectedUser, filter]); // Re-fetch if filter changes? Maybe if we want to filter history by project.
    // Current user wants "filter chat members". 
    // If I pick UserX, I probably want to see our history. 
    // But if I selected 'Project A', should I ONLY see Project A messages?
    // Let's pass `projectId` in API call if filter is not 'all'.

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            const data = await res.json();
            if (res.ok) setProjects(data.projects || []);
        } catch (e) { console.error(e); }
    };

    const fetchMessages = async () => {
        try {
            console.log('[fetchMessages] Starting fetch for:', selectedUser.name, selectedUser._id);
            let query = `?receiverId=${selectedUser._id}`;
            // Since we need projectId to fetch messages (mandatory in schema), we MUST know which project this conversation is about.
            // Problem: 1-on-1 chat might span multiple projects.
            // Schema says `project` is required.
            // If filter is 'all', which project ID do we use to send?
            // We need to pick one "active" project for the conversation context.
            // OR we fetch ALL messages between these 2 users across ALL projects.
            // But when SENDING, we need a projectId.
            // Solution: If filter is specific project, use it.
            // If filter is 'all', use the `lastMessage.project` OR the first common project from `selectedUser.projects`.

            const activeProjectId = (filter !== 'all') ? filter : (selectedUser.projects?.[0] || projects[0]?._id);

            // Actually, fetching might return messages from ALL projects if we don't filter.
            // If we want to show history, let's fetch all.
            // But sending needs a specific ID.

            // Let's modify GET /api/messages to NOT require projectId if receiverId is present?
            // The API I wrote: "if receiverId present... query.$or = [...]". It respected `query = { project: projectId }`.
            // So currently strict on Project.
            // I should allow `projectId` to be optional in GET if receiverId is there, to show full history?

            // For now, let's strictly follow "Filter by ID" logic.
            // If 'all', we might just pick the most recent project they share.

            if (filter !== 'all') {
                query += `&projectId=${filter}`;
            }
            // If filter is 'all', DO NOT force a project ID.
            // Let the API return all messages between users across any project.

            console.log('[fetchMessages] Query:', query);
            const res = await fetch(`/api/messages${query}`);
            const data = await res.json();
            console.log('[fetchMessages] Response:', data.messages?.length, 'messages');
            if (res.ok) setMessages(data.messages || []);
            scrollToBottom();
        } catch (e) { console.error(e); }
    };

    const sendMessage = async (content, type = 'text', attachments = []) => {
        if (!content && attachments.length === 0) return;
        if (!selectedUser) return;

        // Determine Project ID to tag
        const activeProjectId = (filter !== 'all') ? filter : (selectedUser.projects?.[0]);
        if (!activeProjectId) {
            alert("No common project found context for this chat.");
            return;
        }

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: activeProjectId,
                    receiverId: selectedUser._id,
                    content,
                    type,
                    attachments
                })
            });
            const data = await res.json();
            if (res.ok) {
                const newMsg = data.message;
                console.log('[sendMessage] Message saved, adding to UI:', newMsg);
                setMessages((prev) => [...prev, newMsg]);
                setInput('');
                scrollToBottom();

                if (socket) {
                    // Emit to the 1-on-1 room
                    const ids = [user.id, selectedUser._id].sort();
                    const roomId = `chat_${ids[0]}_${ids[1]}`;
                    // We need to update server to support broadcasting to this room label 
                    // OR client just broadcasts to it if we joined it.
                    // My simple server just joins `project` room.
                    // I need to ensure server joins `roomId` if I emit to it?
                    // Actually, I can just emit 'new_message' to the socket, and other client listens. 
                    // But without Server support for distinct rooms, everyone might get it?
                    // "socket.on('join_project')" -> "socket.join(projectId)".
                    // So if I pass `roomId` as `projectId` to 'join_project', it effectively joins that room.
                    // And if I broadcast to that room, it works.

                    // BUT, `sendMessage` API doesn't emit. Client does.
                    socket.emit('send_message', { ...newMsg, roomId }); // Client-side relay needed?
                    // Wait, standard socket.io: `socket.to(room).emit`.
                    // Client cannot `to(room)`. Server must.
                    // Since my API doesn't emit, and my Server code `io.on('send_message')` does nothing?
                    // Re-read `pages/api/socket/io.js`.
                    // "socket.on('send_message', ...)" -> "try { ... }". Empty!
                    // I need to fix Server to broadcast.

                    // TEMPORARY FIX: I will trigger a 'client_message' event that Server relays to room.
                    // I need to update `pages/api/socket/io.js` quickly.

                    // For now, assume polling or fix server. 
                    // Let's assume I fix server in next step.
                    socket.emit('private_message', { ...newMsg, roomId, receiver: selectedUser._id });
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // ... File/Voice handlers (reused) ...
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) uploadFile(file);
    };
    const uploadFile = async (file, name, type = 'file') => {
        const formData = new FormData();
        formData.append('file', file, name || file.name);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (res.ok) await sendMessage(null, type, [data.url]);
        } catch (e) { }
    };

    if (authLoading) return <div className="p-8">Loading...</div>;
    if (!user) return <div className="p-8">Access Denied</div>;

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
                                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                                    {selectedUser.avatar ? <img src={selectedUser.avatar} className="w-full h-full" /> : selectedUser.name[0]}
                                </div>
                                <div>
                                    <h2 className="font-bold">{selectedUser.name}</h2>
                                    <p className="text-xs text-green-600">{isConnected ? '' : 'Offline'}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 text-gray-500">
                                <button onClick={() => setSelectedUser(null)} className="md:hidden">Back</button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('/bg-chat.png')] bg-repeat bg-contain bg-opacity-10">
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender._id === user.id || msg.sender === user.id;
                                return (
                                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-3 rounded-lg shadow-sm text-sm 
                                         ${isMe ? 'bg-[#d9fdd3]' : 'bg-white'}`}>
                                            {msg.content}
                                            {msg.type === 'file' && <a href={msg.attachments[0]} target="_blank" className="block mt-1 text-blue-600">Attachment</a>}
                                            <span className="block text-[10px] text-gray-500 text-right mt-1">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                                <input type="file" className="hidden" onChange={handleFileUpload} />
                                📎
                            </label>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
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
                        <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 flex items-center justify-center text-4xl">💬</div>
                        <h2 className="text-xl font-bold text-gray-700">Contractor Chat Web</h2>
                        <p className="mt-2 text-sm text-center max-w-md">Send and receive messages. <br /> Select a user from the sidebar to start chatting.</p>
                    </div>
                )}
            </div>

        </div>
    );
}
