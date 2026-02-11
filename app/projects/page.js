// 'use client';

// import { useState, useEffect } from 'react';
// import { useAuth } from '@/context/AuthContext';
// import DashboardNav from '@/components/DashboardNav';
// import Link from 'next/link';

// export default function ProjectsPage() {
//     const { user, loading: authLoading } = useAuth();
//     const [projects, setProjects] = useState([]);
//     const [filter, setFilter] = useState('All Projects');
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         if (user) {
//             fetchProjects();
//         }
//     }, [user]);

//     const fetchProjects = async () => {
//         try {
//             const res = await fetch('/api/projects');
//             const data = await res.json();
//             if (res.ok) {
//                 setProjects(data.projects || []);
//             }
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const filteredProjects = filter === 'All Projects'
//         ? projects
//         : projects.filter(p => p.status === filter);

//     if (authLoading || loading) return <div className="p-8">Loading...</div>;
//     if (!user) return <div className="p-8">Access Denied</div>;

//     return (
//         <div className="max-w-7xl mx-auto">
//             <DashboardNav role={user.role} />

//             {/* Filters */}
//             <div className="flex gap-4 mb-6">
//                 <button
//                     onClick={() => setFilter('All Projects')}
//                     className={`px-4 py-2 rounded border ${filter === 'All Projects' ? 'bg-black text-white' : 'bg-transparent border-gray-300'}`}
//                 >
//                     All Projects
//                 </button>
//                 <select
//                     value={filter}
//                     onChange={(e) => setFilter(e.target.value)}
//                     className="px-4 py-2 rounded border border-gray-300 bg-transparent"
//                 >
//                     <option value="All Projects">Status: All</option>
//                     <option value="Draft">Draft</option>
//                     <option value="Pending">Pending</option>
//                     <option value="Active">Active</option>
//                     <option value="Completed">Completed</option>
//                 </select>
//             </div>

//             {/* Projects Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {filteredProjects.map(project => (
//                     <Link key={project._id} href={`/projects/${project._id}`} className="block bg-[#0000000F] p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
//                         <div className="flex justify-between items-start mb-2">
//                             <h3 className="font-bold text-lg">{project.title}</h3>
//                             <span className={`px-2 py-0.5 rounded text-xs font-medium
//                         ${project.status === 'Active' ? 'bg-green-100 text-green-800' :
//                                     project.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
//                                         project.status === 'Completed' ? 'bg-red-100 text-red-800' : 'bg-gray-200'}`}>
//                                 {project.status}
//                             </span>
//                         </div>
//                         <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
//                         <div className="flex justify-between items-end text-xs text-gray-500">
//                             <div>
//                                 <p>Assigned to: {project.assignedContractors?.map(c => c.name).join(', ') || 'Unassigned'}</p>
//                                 {project.editorName && <p>Editor: {project.editorName}</p>}
//                             </div>
//                             <div>
//                                 <p>Due: {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'N/A'}</p>
//                             </div>
//                         </div>
//                     </Link>
//                 ))}
//             </div>

//             {filteredProjects.length === 0 && (
//                 <div className="text-center py-12 text-gray-500">
//                     No projects found.
//                 </div>
//             )}
//         </div>
//     );
// }

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardNav from "@/components/DashboardNav";
import Link from "next/link";

export default function ProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]); // for search filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All Projects");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (res.ok) {
        const projectList = data.projects || [];
        setAllProjects(projectList);
        setProjects(projectList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time search filtering
  useEffect(() => {
    let filtered = allProjects;

    // Apply status filter first
    if (filter !== "All Projects") {
      filtered = filtered.filter((p) => p.status === filter);
    }

    // Then apply search term
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(lowerSearch) ||
          p.description?.toLowerCase().includes(lowerSearch) ||
          p.status?.toLowerCase().includes(lowerSearch) ||
          p.editorName?.toLowerCase().includes(lowerSearch) ||
          p.assignedContractors?.some((c) =>
            c.name?.toLowerCase().includes(lowerSearch),
          ),
      );
    }

    setProjects(filtered);
  }, [searchTerm, filter, allProjects]);

  if (authLoading || loading) return <div className="p-8">Loading...</div>;
  if (!user) return <div className="p-8">Access Denied</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <DashboardNav role={user.role} />

      {/* Search + Filters Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Search Bar */}
        <div className="relative w-full sm:w-96 lg:w-[420px]">
          <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-black focus-within:border-transparent transition-all duration-200">
            <div className="pl-4 text-gray-400 pointer-events-none">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-5.2-5.2m1.7-4.8a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects..."
              className="
                                flex-1 py-2.5 px-3 
                                bg-transparent 
                                text-gray-900 placeholder-gray-500 
                                focus:outline-none 
                                text-sm sm:text-base
                            "
            />

            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="pr-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Clear search"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter("All Projects")}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              filter === "All Projects"
                ? "bg-black text-white border-black"
                : "bg-white border-gray-300 hover:bg-gray-100"
            }`}
          >
            All
          </button>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-full border border-gray-300 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="All Projects">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Pending">Pending</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link
            key={project._id}
            href={`/projects/${project._id}`}
            className="block bg-[#0000000F] p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-base sm:text-lg line-clamp-1">
                {project.title}
              </h3>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap
                                    ${
                                      project.status === "Active"
                                        ? "bg-green-100 text-green-800"
                                        : project.status === "Pending"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : project.status === "Completed"
                                            ? "bg-gray-200 text-gray-700"
                                            : "bg-gray-100 text-gray-600"
                                    }`}
              >
                {project.status}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {project.description}
            </p>

            <div className="flex flex-wrap justify-between items-end text-xs text-gray-600">
              <div className="space-y-1">
                <p>
                  Assigned:{" "}
                  {project.assignedContractors?.map((c) => c.name).join(", ") ||
                    "None"}
                </p>
                {project.editorName && <p>Editor: {project.editorName}</p>}
              </div>
              <div className="text-right">
                <p>
                  Due:{" "}
                  {project.dueDate
                    ? new Date(project.dueDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          {searchTerm || filter !== "All Projects"
            ? "No matching projects found."
            : "No projects yet."}
        </div>
      )}
    </div>
  );
}
