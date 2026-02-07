'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardNav from '@/components/DashboardNav';

export default function InvoicesPage() {
    const { user, loading: authLoading } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [projects, setProjects] = useState([]); // For selecting project in upload
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        file: null,
        description: '',
        project: '',
        amount: ''
    });

    useEffect(() => {
        if (user) {
            fetchInvoices();
            fetchProjects();
        }
    }, [user]);

    const fetchInvoices = async () => {
        try {
            const res = await fetch('/api/invoices');
            const data = await res.json();
            if (res.ok) setInvoices(data.invoices || []);
        } catch (e) { console.error(e); }
    };

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            const data = await res.json();
            if (res.ok) setProjects(data.projects || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            const data = new FormData();
            data.append('file', formData.file);
            data.append('description', formData.description);
            data.append('project', formData.project);
            data.append('amount', formData.amount);

            const res = await fetch('/api/invoices', {
                method: 'POST',
                body: data
            });

            if (res.ok) {
                setFormData({ file: null, description: '', project: '', amount: '' });
                setShowForm(false);
                fetchInvoices();
            } else {
                alert('Upload failed');
            }
        } catch (e) {
            alert('Error uploading');
        } finally {
            setUploading(false);
        }
    };

    if (authLoading || loading) return <div className="p-8">Loading...</div>;
    if (!user) return <div className="p-8">Access Denied</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <DashboardNav role={user.role} />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Invoices</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
                >
                    {showForm ? 'Cancel Upload' : '+ Submit Invoice'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded shadow mb-8 border border-gray-200 text-black">
                    <h2 className="text-lg font-bold mb-4">Upload Invoice</h2>
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                        <div>
                            <label className="block text-sm font-medium mb-1">Project *</label>
                            <select
                                required
                                value={formData.project}
                                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                                className="w-full border p-2 rounded"
                            >
                                <option value="">Select Project...</option>
                                {projects.map(p => (
                                    <option key={p._id} value={p._id}>{p.title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description *</label>
                            <input
                                required
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full border p-2 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Amount</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full border p-2 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">File (Image/PDF) *</label>
                            <input
                                required
                                type="file"
                                onChange={handleFileChange}
                                className="w-full border p-2 rounded"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
                        >
                            {uploading ? 'Uploading...' : 'Submit'}
                        </button>
                    </form>
                </div>
            )}

            {/* Invoices List */}
            <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-bold text-sm text-gray-600">Project</th>
                            <th className="p-4 font-bold text-sm text-gray-600">Sender</th>
                            <th className="p-4 font-bold text-sm text-gray-600">Description</th>
                            <th className="p-4 font-bold text-sm text-gray-600">Amount</th>
                            <th className="p-4 font-bold text-sm text-gray-600">Date</th>
                            <th className="p-4 font-bold text-sm text-gray-600">Status</th>
                            <th className="p-4 font-bold text-sm text-gray-600">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {invoices.length > 0 ? invoices.map(inv => (
                            <tr key={inv._id} className="hover:bg-gray-50">
                                <td className="p-4 text-sm font-bold">{inv.project?.title || 'Unknown Project'}</td>
                                <td className="p-4 text-sm text-gray-600">{inv.sender?.name} <span className="text-xs text-gray-400">({inv.sender?.role})</span></td>
                                <td className="p-4 text-sm text-gray-600">{inv.description}</td>
                                <td className="p-4 text-sm font-mono">${inv.amount}</td>
                                <td className="p-4 text-sm text-gray-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs rounded font-bold capitalize
                                 ${inv.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <a href={inv.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-bold">
                                        View File
                                    </a>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" className="p-8 text-center text-gray-500">No invoices found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
