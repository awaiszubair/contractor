'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav'; // Using nav to keep consistent layout
import { useAuth } from '@/context/AuthContext';

export default function InvitePage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const initialRole = searchParams.get('role') || 'client';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: initialRole,
        phone: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [inviteLink, setInviteLink] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        setInviteLink('');

        try {
            const res = await fetch('/api/auth/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Invitation sent successfully!');
                setInviteLink(data.link);
                setFormData({ ...formData, name: '', email: '', phone: '', description: '' }); // Reset form but keep role
            } else {
                setError(data.error || 'Failed to send invite');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.role !== 'admin') return <div className="p-8 text-center">Access Denied</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <DashboardNav role={user.role} />

            <div className="bg-white p-8 rounded shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold mb-6">Invite New User</h1>

                {message && (
                    <div className="mb-4 p-4 bg-green-50 text-green-700 rounded border border-green-200">
                        {message}
                        {inviteLink && (
                            <p className="mt-2 text-sm text-green-900 break-all">
                                <strong>Registration Link (for testing):</strong> <br />
                                <a href={inviteLink} className="underline">{inviteLink}</a>
                            </p>
                        )}
                    </div>
                )}
                {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded border border-red-200">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* 1. Client Information or Contractor Information */}
                    <div className="bg-white p-6 rounded border border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-lg font-bold">User Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded focus:ring-black focus:border-black"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border rounded focus:ring-black focus:border-black"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border rounded focus:ring-black focus:border-black"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-3 py-2 border rounded focus:ring-black focus:border-black"
                                >
                                    <option value="client">Client</option>
                                    <option value="contractor">Contractor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description / Notes</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded focus:ring-black focus:border-black h-24"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button type="button" className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Cancel</button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                        >
                            {loading ? 'Sending Invite...' : 'Send Invite'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
