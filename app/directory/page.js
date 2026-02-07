'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardNav from '@/components/DashboardNav';
import UserCard from '@/components/UserCard';
import Link from 'next/link';
import ProfileModal from '@/components/ProfileModal'; // Will create next

export default function DirectoryPage() {
    const { user, loading } = useAuth();
    const [clients, setClients] = useState([]);
    const [contractors, setContractors] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // Parallel fetch
            const [clientsRes, contractorsRes] = await Promise.all([
                fetch('/api/users?role=client'),
                fetch('/api/users?role=contractor')
            ]);

            if (clientsRes.ok) {
                const data = await clientsRes.json();
                setClients(data.users || []);
            }

            if (contractorsRes.ok) {
                const data = await contractorsRes.json();
                setContractors(data.users || []);
            }

        } catch (e) {
            console.error('Failed to fetch users', e);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!user || user.role !== 'admin') return <div className="text-center mt-10">Access Denied</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <DashboardNav role={user.role} />

            {/* Clients Section */}
            <div className="mb-12">
                <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-2">
                    <h2 className="text-2xl font-bold">Clients</h2>
                    <Link href="/directory?role=client" className="text-sm font-semibold hover:underline">View All...</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Map clients here */}
                    {clients.length > 0 ? clients.slice(0, 2).map(c => (
                        <UserCard key={c.id} user={c} onViewProfile={setSelectedUser} />
                    )) : (
                        <p className="text-gray-500 col-span-2">No clients found.</p>
                    )}
                </div>
                <div className="mt-4">
                    <Link href="/invite?role=client" className="inline-block bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800">
                        + Add Client
                    </Link>
                </div>
            </div>

            {/* Contractors Section */}
            <div>
                <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-2">
                    <h2 className="text-2xl font-bold">Contractors</h2>
                    <Link href="/directory?role=contractor" className="text-sm font-semibold hover:underline">View All...</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Map contractors here */}
                    {contractors.length > 0 ? contractors.slice(0, 2).map(c => (
                        <UserCard key={c.id} user={c} onViewProfile={setSelectedUser} />
                    )) : (
                        <p className="text-gray-500 col-span-2">No contractors found.</p>
                    )}
                </div>
                <div className="mt-4">
                    <Link href="/invite?role=contractor" className="inline-block bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800">
                        + Add Contractor
                    </Link>
                </div>
            </div>

            {/* Profile Modal */}
            {selectedUser && (
                <ProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
            )}

        </div>
    );
}
