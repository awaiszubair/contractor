'use client';

import { useAuth } from '@/context/AuthContext';
import DashboardNav from '@/components/DashboardNav';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({
        openProjects: 0,
        dueSoon: 0,
        active: 0,
        pending: 0
    });
    const [recentProjects, setRecentProjects] = useState([]);
    const [recentMessages, setRecentMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/dashboard/stats');
            const data = await res.json();
            if (res.ok) {
                setStats({
                    openProjects: data.stats.total, // Or active + pending? Let's use total for "Open Projects" card title context or clarify
                    // User's mock said "Open Projects" -> 3. "Active".
                    // Let's use 'active' count for "Open Projects" card value?
                    // Or Total? let's use Total of non-completed.
                    // Actually API returns: total, active, pending, dueSoon.

                    // Mapping to UI:
                    openProjects: data.stats.active + data.stats.pending,
                    dueSoon: data.stats.dueSoon,
                    active: data.stats.active,
                    pending: data.stats.pending
                });
                setRecentProjects(data.recentProjects || []);
                setRecentMessages(data.recentMessages || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) return <div className="p-8">Loading Dashboard...</div>;
    if (!user) return <div className="p-8">Access Denied</div>;

    return (
        <div className="max-w-7xl mx-auto">
            {/* 1. Navigation Row */}
            <DashboardNav role={user.role} />

            {/* 2. Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Left Column (Main Content) */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Welcome Row */}
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
                        {user.role === 'admin' && (
                            <Link href="/contracts/create" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 text-sm">
                                + Create Contract
                            </Link>
                        )}
                    </div>

                    {/* Stats Cards Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-[#0000000F] p-6 rounded-lg">
                            <h3 className="text-gray-600 font-medium">Active Projects</h3>
                            <p className="text-3xl font-bold mt-2">{stats.active}</p>
                            <p className="text-sm text-green-600 mt-1">In Progress</p>
                        </div>
                        <div className="bg-[#0000000F] p-6 rounded-lg">
                            <h3 className="text-gray-600 font-medium">Pending</h3>
                            <p className="text-3xl font-bold mt-2">{stats.pending}</p>
                            <p className="text-sm text-yellow-600 mt-1">Waiting Approval</p>
                        </div>
                        <div className="bg-[#0000000F] p-6 rounded-lg">
                            <h3 className="text-gray-600 font-medium">Due Soon</h3>
                            <p className="text-3xl font-bold mt-2">{stats.dueSoon}</p>
                            <p className="text-sm text-red-600 mt-1">Next 7 days</p>
                        </div>
                    </div>

                    {/* Projects List Container */}
                    <div className="bg-[#0000000F] p-6 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Recent Projects</h2>
                            <Link href="/projects" className="text-sm font-semibold hover:underline">View All...</Link>
                        </div>

                        {recentProjects.length > 0 ? (
                            <div className="space-y-3">
                                {recentProjects.map(project => (
                                    <Link key={project._id} href={`/projects/${project._id}`} className="block bg-white p-4 rounded shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between">
                                            <span className="font-bold">{project.title}</span>
                                            <div className="text-sm text-gray-500 space-x-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold
                                                    ${project.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                        project.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            project.status === 'Completed' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100'}`}>
                                                    {project.status}
                                                </span>
                                                {project.dueDate && <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2 line-clamp-1">{project.description}</p>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No recent projects found.</p>
                        )}
                    </div>

                    {/* Messages Container */}
                    <div className="bg-[#0000000F] p-6 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Recent Messages</h2>
                            <Link href="/messages" className="text-sm font-semibold hover:underline">View All...</Link>
                        </div>

                        {recentMessages.length > 0 ? (
                            <div className="space-y-3">
                                {recentMessages.map(msg => (
                                    <div key={msg._id} className="bg-white p-4 rounded shadow-sm">
                                        <div className="flex justify-between">
                                            <span className="font-bold text-sm">{msg.sender?.name || 'Unknown User'}</span>
                                            <span className="text-xs text-gray-500">{msg.project?.title}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1 truncate">
                                            {msg.type === 'text' ? msg.content : `[${msg.type}] Attachment`}
                                        </p>
                                        <div className="text-[10px] text-gray-400 text-right mt-1">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No recent messages.</p>
                        )}
                    </div>

                </div>

                {/* Right Column (Sidebar) */}
                <div className="lg:col-span-1 space-y-6">

                    {/* Quick Actions */}
                    <div className="bg-[#0000000F] p-6 rounded-lg">
                        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
                        <Link href="/invoices" className="block bg-white p-4 rounded shadow-sm hover:shadow-md transition-shadow text-center font-medium mb-2">
                            View Invoices
                        </Link>
                        <Link href="/messages" className="block bg-white p-4 rounded shadow-sm hover:shadow-md transition-shadow text-center font-medium">
                            Messages
                        </Link>
                    </div>

                    {/* Directory (Admin Only) */}
                    {user.role === 'admin' && (
                        <div className="bg-[#0000000F] p-6 rounded-lg space-y-4">
                            <h2 className="text-lg font-bold mb-2">Directory</h2>
                            <Link href="/directory?tab=clients" className="block bg-white p-4 rounded shadow-sm hover:shadow-md transition-shadow">
                                <span className="block font-bold">Clients</span>
                                <span className="text-xs text-gray-500">View all clients</span>
                            </Link>
                            <Link href="/directory?tab=contractors" className="block bg-white p-4 rounded shadow-sm hover:shadow-md transition-shadow">
                                <span className="block font-bold">Contractors</span>
                                <span className="text-xs text-gray-500">View all contractors</span>
                            </Link>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}
