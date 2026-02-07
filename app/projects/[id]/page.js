'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardNav from '@/components/DashboardNav';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ProjectDetailsPage() {
    const { user, loading: authLoading } = useAuth();
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [assignEmail, setAssignEmail] = useState('');
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (user && id) {
            fetchProject();
        }
    }, [user, id]);

    const [availableContractors, setAvailableContractors] = useState([]);

    useEffect(() => {
        if (user && id) {
            fetchProject();
            if (user.role === 'admin') {
                fetchContractors();
            }
        }
    }, [user, id]);

    const fetchContractors = async () => {
        try {
            const res = await fetch('/api/users?role=contractor');
            const data = await res.json();
            if (res.ok) setAvailableContractors(data.users || []);
        } catch (e) { console.error(e); }
    };

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/projects/${id}`);
            const data = await res.json();
            if (res.ok) {
                setProject(data.project);
            } else {
                setMsg(data.error || 'Failed to load project');
            }
        } catch (err) {
            console.error(err);
            setMsg('Error loading project');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        setMsg('');
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignContractorEmail: assignEmail })
            });
            const data = await res.json();
            if (res.ok) {
                setMsg('Contractor assigned successfully');
                setAssignEmail('');
                fetchProject(); // Refresh
            } else {
                setMsg(data.error || 'Failed to assign');
            }
        } catch (err) {
            setMsg('Error assigning contractor');
        }
    };

    if (authLoading || loading) return <div className="p-8">Loading...</div>;
    if (!user || !project) return <div className="p-8">Access Denied or Not Found</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <DashboardNav role={user.role} />

            {msg && <div className="mb-4 p-4 bg-gray-100 rounded border border-gray-200">{msg}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Project Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-[#0000000F] p-6 rounded-lg">
                        <div className="flex justify-between items-start">
                            <h1 className="text-3xl font-bold">{project.title}</h1>
                            <span className={`px-3 py-1 rounded text-sm font-bold 
                        ${project.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-200'}`}>
                                {project.status}
                            </span>
                        </div>
                        <div className="mt-4 space-y-2 text-gray-700">
                            <p><strong>Service Type:</strong> {project.serviceType}</p>
                            <p><strong>Due Date:</strong> {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'N/A'}</p>
                            <p><strong>Amount:</strong> ${project.amount}</p>
                        </div>

                        <div className="mt-6">
                            <h3 className="font-bold text-lg border-b border-gray-300 pb-2 mb-2">Scope of Work</h3>
                            <p className="whitespace-pre-wrap text-gray-600">{project.scopeOfWork}</p>
                        </div>

                        <div className="mt-6">
                            <h3 className="font-bold text-lg border-b border-gray-300 pb-2 mb-2">Payment Terms</h3>
                            <p className="whitespace-pre-wrap text-gray-600">{project.paymentTerms}</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar / People */}
                <div className="space-y-6">

                    {/* Client Info */}
                    <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
                        <h3 className="font-bold text-lg mb-4">Client</h3>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                                {project.client?.name?.[0]}
                            </div>
                            <div>
                                <p className="font-bold">{project.client?.name}</p>
                                <p className="text-xs text-gray-500">{project.client?.email}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{project.description}</p>
                    </div>

                    {/* Assigned Contractors */}
                    <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
                        <h3 className="font-bold text-lg mb-4">Assigned Contractors</h3>
                        {project.assignedContractors?.length > 0 ? (
                            <div className="space-y-3">
                                {project.assignedContractors.map(c => (
                                    <div key={c._id} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                                            {c.name[0]}
                                        </div>
                                        <p className="text-sm">{c.name}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">No contractors assigned.</p>
                        )}

                        {/* Assign Form (Admin Only) */}
                        {user.role === 'admin' && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <label className="block text-xs font-bold mb-1">Assign Contractor</label>
                                <div className="flex gap-2">
                                    <select
                                        value={assignEmail}
                                        onChange={(e) => setAssignEmail(e.target.value)}
                                        className="flex-1 px-2 py-1 text-sm border rounded"
                                    >
                                        <option value="">Select Contractor...</option>
                                        {availableContractors.map(c => (
                                            <option key={c._id} value={c.email}>{c.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleAssign}
                                        disabled={!assignEmail}
                                        className="bg-black text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chat Link */}
                    <div className="bg-black text-white p-4 rounded text-center">
                        <Link href={`/messages/${project._id}`} className="block w-full font-bold hover:underline">
                            Open Project Chat
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
