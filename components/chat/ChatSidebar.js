'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function ChatSidebar({ onSelectUser, selectedUser, projects, onFilterChange, currentFilter }) {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchUsers(currentFilter);
        }
    }, [user, currentFilter]);

    const fetchUsers = async (projectId) => {
        setLoading(true);
        try {
            // If projectId is 'all' or empty, fetch all
            const query = projectId ? `?projectId=${projectId}` : '?projectId=all';
            const res = await fetch(`/api/chat/users${query}`);
            const data = await res.json();
            if (res.ok) {
                setUsers(data.users || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase())
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
                        {projects.map(p => (
                            <option key={p._id} value={p._id}>{p.title}</option>
                        ))}
                    </select>
                    {/* Menu dots placeholder */}
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
                    <div className="p-4 text-center text-gray-500">Loading contacts...</div>
                ) : (
                    filteredUsers.map(u => (
                        <div
                            key={u._id}
                            onClick={() => onSelectUser(u)}
                            className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 
                                ${selectedUser?._id === u._id ? 'bg-gray-100' : ''}`}
                        >
                            <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                {u.avatar ? (
                                    <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="font-bold text-gray-600 text-lg">{u.name[0]}</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-gray-900 truncate">{u.name}</h3>
                                    {u.lastMessage && (
                                        <span className="text-xs text-gray-500 flex-shrink-0">
                                            {new Date(u.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 truncate">
                                    {u.lastMessage?.content || 'Click to start chat'}
                                </p>
                            </div>
                        </div>
                    ))
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
