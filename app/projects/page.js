'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardNav from '@/components/DashboardNav';
import Link from 'next/link';

export default function ProjectsPage() {
    const { user, loading: authLoading } = useAuth();
    const [projects, setProjects] = useState([]);
    const [filter, setFilter] = useState('All Projects');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchProjects();
        }
    }, [user]);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            const data = await res.json();
            if (res.ok) {
                setProjects(data.projects || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = filter === 'All Projects'
        ? projects
        : projects.filter(p => p.status === filter);

    if (authLoading || loading) return <div className="p-8">Loading...</div>;
    if (!user) return <div className="p-8">Access Denied</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <DashboardNav role={user.role} />

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setFilter('All Projects')}
                    className={`px-4 py-2 rounded border ${filter === 'All Projects' ? 'bg-black text-white' : 'bg-transparent border-gray-300'}`}
                >
                    All Projects
                </button>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 rounded border border-gray-300 bg-transparent"
                >
                    <option value="All Projects">Status: All</option>
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(project => (
                    <Link key={project._id} href={`/projects/${project._id}`} className="block bg-[#0000000F] p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg">{project.title}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium 
                        ${project.status === 'Active' ? 'bg-green-100 text-green-800' :
                                    project.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                        project.status === 'Completed' ? 'bg-red-100 text-red-800' : 'bg-gray-200'}`}>
                                {project.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                        <div className="flex justify-between items-end text-xs text-gray-500">
                            <div>
                                <p>Assigned to: {project.assignedContractors?.map(c => c.name).join(', ') || 'Unassigned'}</p>
                                {project.editorName && <p>Editor: {project.editorName}</p>}
                            </div>
                            <div>
                                <p>Due: {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {filteredProjects.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No projects found.
                </div>
            )}
        </div>
    );
}
