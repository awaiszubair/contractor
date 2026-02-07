'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function CreateContractPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '', // Contract Title / Project Name
        scopeOfWork: '',
        clientName: '', // For now text, ideally should be a dropdown of existing clients
        clientEmail: '',
        clientPhone: '',
        clientDescription: '', // Project description mainly
        serviceType: '',
        startDate: '',
        dueDate: '',
        amount: '',
        paymentTerms: '',
        status: 'Draft',
        editorName: '', // Assigned editor?
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch users for dropdown if we want to select existing client
    // For now, adhering to user's form description: "Client information... client name, email..."
    // If user enters new client info, we might need to creating them or just link if exists.
    // The user requirement said: "Admin create the contract... Then he assign that contract to any contractor".
    // And "Contract created... Then he assign".
    // So client info here might be for creating the client account OR linking.
    // I will assume for simplicity we just store the text for now or try to match email.
    // But strictly I should link to a User ID. I'll search for user by email on backend or create one?
    // User said: "The flow is through this process the client will receive invitation platform". 
    // So creating a contract might invite the client if they don't exist.

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // First we probably need to find or create the client User to get their ID.
            // Or handle this in the API. I'll send the raw data and let API handle it or just fail if not rigorous.
            // Actually, to keep it robust, I should probably select from existing clients or have a "Create Client" separate flow, 
            // OR the API route handles "find user by email, if not exists, create invite pending user".
            // For this prototype, I'll assumme I need to pick an EXISTING client mostly, or I'll implement a simple lookup.
            // Let's just create the Project with the field "client" being the ID.
            // But the form asks for Name, Email, Phone... this implies creating/updating.
            // I'll send all this to the API.

            // Note: I'll need to modify the API to handle the "create/find client" logic if I strictly follow this form.
            // But for step 1, let's just assume we pick a client from a list or something, OR just fetch the client ID by email.

            // REALISTIC PLAN: I will fetch all clients to populate a datalist/dropdown for "Client Name" or "Email".
            // If it's a new email, the API will create a new user (invite flow).

            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    scopeOfWork: formData.scopeOfWork,
                    description: formData.clientDescription,
                    serviceType: formData.serviceType,
                    startDate: formData.startDate,
                    dueDate: formData.dueDate,
                    amount: formData.amount,
                    paymentTerms: formData.paymentTerms,
                    status: formData.status,
                    // We're sending client details to backend to handle "find or create"
                    clientDetails: {
                        name: formData.clientName,
                        email: formData.clientEmail,
                        phone: formData.clientPhone
                    }
                })
            });

            if (res.ok) {
                router.push('/projects');
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to create contract');
            }

        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.role !== 'admin') return <div className="p-8">Access Denied</div>;

    const [clients, setClients] = useState([]);

    useEffect(() => {
        // Fetch clients for dropdown
        const fetchClients = async () => {
            try {
                const res = await fetch('/api/users?role=client');
                const data = await res.json();
                if (res.ok) setClients(data.users || []);
            } catch (e) { console.error(e); }
        };
        fetchClients();
    }, []);

    const handleClientSelect = (e) => {
        const selectedId = e.target.value;
        if (!selectedId) return;

        const client = clients.find(c => c._id === selectedId);
        if (client) {
            setFormData(prev => ({
                ...prev,
                clientName: client.name,
                clientEmail: client.email,
                clientPhone: client.phone || '',
                // Preserve description if user typed it, or maybe use client description? 
                // Let's keep description manual as it tends to be project specific.
            }));
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-3xl font-bold">Create New Contract</h1>
            <p className="text-gray-600 mb-8">Fill in the details to create a new contract for photography and videography services.</p>

            {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* 1. Contact Information */}
                <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 border-b pb-2">Contact Information</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Contact Title / Project Name *</label>
                            <input name="title" required value={formData.title} onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Scope of Work *</label>
                            <textarea name="scopeOfWork" required value={formData.scopeOfWork} onChange={handleChange} className="w-full border p-2 rounded h-24" />
                        </div>
                    </div>
                </div>

                {/* 2. Client Information */}
                <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-lg font-bold">Client Information</h3>
                        {/* Dropdown for existing clients */}
                        <div className="w-1/2">
                            <select onChange={handleClientSelect} className="w-full border p-2 rounded text-sm">
                                <option value="">-- Select Existing Client --</option>
                                {clients.map(c => (
                                    <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Client Name *</label>
                            <input name="clientName" required value={formData.clientName} onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email Address *</label>
                            <input name="clientEmail" type="email" required value={formData.clientEmail} onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Phone Number *</label>
                            <input name="clientPhone" required value={formData.clientPhone} onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description *</label>
                            <input name="clientDescription" required value={formData.clientDescription} onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                    </div>
                </div>

                {/* 3. Service Details */}
                <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 border-b pb-2">Service Details</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Service Type *</label>
                            <select name="serviceType" required value={formData.serviceType} onChange={handleChange} className="w-full border p-2 rounded">
                                <option value="">Select Service...</option>
                                <option value="photographer">Photographer</option>
                                <option value="filmer">Filmer</option>
                                <option value="videographer">Videographer</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Start Date</label>
                                <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} className="w-full border p-2 rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Due Date</label>
                                <input name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} className="w-full border p-2 rounded" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Payment */}
                <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 border-b pb-2">Payment</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Amount *</label>
                            <input name="amount" type="number" required value={formData.amount} onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Payment Terms *</label>
                            <textarea name="paymentTerms" required value={formData.paymentTerms} onChange={handleChange} className="w-full border p-2 rounded h-24" />
                        </div>
                    </div>
                </div>

                {/* 5. Status */}
                <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 border-b pb-2">Status</h3>
                    <label className="block text-sm font-bold mb-2">Contract Status</label>
                    <div className="flex gap-4 flex-wrap">
                        {['Draft', 'Pending', 'Active', 'Completed'].map(status => (
                            <label key={status} className={`px-4 py-2 rounded cursor-pointer border ${formData.status === status ? 'ring-2 ring-black' : ''} 
                    ${status === 'Draft' ? 'bg-[#E5E5E5]' :
                                    status === 'Pending' ? 'bg-[#FFF4E0]' :
                                        status === 'Active' ? 'bg-[#D7F7DD]' : 'bg-[#FFD7D7]'}`}>
                                <input type="radio" name="status" value={status} checked={formData.status === status} onChange={handleChange} className="hidden" />
                                {status}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button type="submit" disabled={loading} className="bg-black text-white px-8 py-3 rounded hover:bg-gray-800 disabled:opacity-50">
                        {loading ? 'Creating...' : 'Add Contract'}
                    </button>
                    <button type="button" onClick={() => router.back()} className="text-gray-600 hover:underline">
                        Cancel
                    </button>
                </div>

            </form>
        </div>
    );
}
