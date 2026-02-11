// "use client";

// import { useState, useEffect } from "react";
// import { useAuth } from "@/context/AuthContext";
// import DashboardNav from "@/components/DashboardNav";
// import { useParams } from "next/navigation";
// import Link from "next/link";

// export default function ProjectDetailsPage() {
//   const { user, loading: authLoading } = useAuth();
//   const { id } = useParams();
//   const [project, setProject] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [assignEmail, setAssignEmail] = useState("");
//   const [msg, setMsg] = useState("");

//   useEffect(() => {
//     if (user && id) {
//       fetchProject();
//     }
//   }, [user, id]);

//   const [availableContractors, setAvailableContractors] = useState([]);

//   useEffect(() => {
//     if (user && id) {
//       fetchProject();
//       if (user.role === "admin") {
//         fetchContractors();
//       }
//     }
//   }, [user, id]);

//   const fetchContractors = async () => {
//     try {
//       const res = await fetch("/api/users?role=contractor");
//       const data = await res.json();
//       if (res.ok) setAvailableContractors(data.users || []);
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   const fetchProject = async () => {
//     try {
//       const res = await fetch(`/api/projects/${id}`);
//       const data = await res.json();
//       if (res.ok) {
//         setProject(data.project);
//       } else {
//         setMsg(data.error || "Failed to load project");
//       }
//     } catch (err) {
//       console.error(err);
//       setMsg("Error loading project");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAssign = async (e) => {
//     e.preventDefault();
//     setMsg("");
//     try {
//       const res = await fetch(`/api/projects/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ assignContractorEmail: assignEmail }),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setMsg("Contractor assigned successfully");
//         setAssignEmail("");
//         fetchProject(); // Refresh
//       } else {
//         setMsg(data.error || "Failed to assign");
//       }
//     } catch (err) {
//       setMsg("Error assigning contractor");
//     }
//   };

//   if (authLoading || loading) return <div className="p-8">Loading...</div>;
//   if (!user || !project)
//     return <div className="p-8">Access Denied or Not Found</div>;

//   return (
//     <div className="max-w-7xl mx-auto">
//       <DashboardNav role={user.role} />

//       {msg && (
//         <div className="mb-4 p-4 bg-gray-100 rounded border border-gray-200">
//           {msg}
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Main Project Info */}
//         <div className="md:col-span-2 space-y-6">
//           <div className="bg-[#0000000F] p-6 rounded-lg">
//             <div className="flex justify-between items-start">
//               <h1 className="text-3xl font-bold">{project.title}</h1>
//               <span
//                 className={`px-3 py-1 rounded text-sm font-bold
//                         ${project.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-200"}`}
//               >
//                 {project.status}
//               </span>
//             </div>
//             <div className="mt-4 space-y-2 text-gray-700">
//               <p>
//                 <strong>Service Type:</strong> {project.serviceType}
//               </p>
//               <p>
//                 <strong>Due Date:</strong>{" "}
//                 {project.dueDate
//                   ? new Date(project.dueDate).toLocaleDateString()
//                   : "N/A"}
//               </p>
//               <p>
//                 <strong>Amount:</strong> ${project.amount}
//               </p>
//             </div>

//             <div className="mt-6">
//               <h3 className="font-bold text-lg border-b border-gray-300 pb-2 mb-2">
//                 Scope of Work
//               </h3>
//               <p className="whitespace-pre-wrap text-gray-600">
//                 {project.scopeOfWork}
//               </p>
//             </div>

//             <div className="mt-6">
//               <h3 className="font-bold text-lg border-b border-gray-300 pb-2 mb-2">
//                 Payment Terms
//               </h3>
//               <p className="whitespace-pre-wrap text-gray-600">
//                 {project.paymentTerms}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Sidebar / People */}
//         <div className="space-y-6">
//           {/* Client Info */}
//           <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
//             <h3 className="font-bold text-lg mb-4">Client</h3>
//             <div className="flex items-center gap-3 mb-2">
//               <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold">
//                 {project.client?.name?.[0]}
//               </div>
//               <div>
//                 <p className="font-bold">{project.client?.name}</p>
//                 <p className="text-xs text-gray-500">{project.client?.email}</p>
//               </div>
//             </div>
//             <p className="text-sm text-gray-600 mt-2">{project.description}</p>
//           </div>

//           {/* Assigned Contractors */}
//           <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
//             <h3 className="font-bold text-lg mb-4">Assigned Contractors</h3>
//             {project.assignedContractors?.length > 0 ? (
//               <div className="space-y-3">
//                 {project.assignedContractors.map((c) => (
//                   <div key={c._id} className="flex items-center gap-3">
//                     <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
//                       {c.name[0]}
//                     </div>
//                     <p className="text-sm">{c.name}</p>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-sm text-gray-500 italic">
//                 No contractors assigned.
//               </p>
//             )}

//             {/* Assign Form (Admin Only) */}
//             {user.role === "admin" && (
//               <div className="mt-4 pt-4 border-t border-gray-100">
//                 <label className="block text-xs font-bold mb-1">
//                   Assign Contractor
//                 </label>
//                 <div className="flex gap-2">
//                   <select
//                     value={assignEmail}
//                     onChange={(e) => setAssignEmail(e.target.value)}
//                     className="flex-1 px-2 py-1 text-sm border rounded"
//                   >
//                     <option value="">Select Contractor...</option>
//                     {availableContractors.map((c) => (
//                       <option key={c._id} value={c.email}>
//                         {c.name}
//                       </option>
//                     ))}
//                   </select>
//                   <button
//                     onClick={handleAssign}
//                     disabled={!assignEmail}
//                     className="bg-black text-white px-3 py-1 rounded text-sm disabled:opacity-50"
//                   >
//                     +
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Chat Link */}
//           <div className="bg-black text-white p-4 rounded text-center">
//             <Link
//               href={`/messages/${project._id}`}
//               className="block w-full font-bold hover:underline"
//             >
//               Open Project Chat
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useAuth } from "@/context/AuthContext";
// import DashboardNav from "@/components/DashboardNav";
// import { useParams, useRouter } from "next/navigation";
// import Link from "next/link";

// export default function ProjectDetailsPage() {
//   const { user, loading: authLoading } = useAuth();
//   const { id } = useParams();
//   const router = useRouter();

//   const [project, setProject] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [msg, setMsg] = useState("");
//   const [assignEmail, setAssignEmail] = useState("");
//   const [availableContractors, setAvailableContractors] = useState([]);

//   // Menu & modal states
//   const [showMenu, setShowMenu] = useState(false);
//   const [showStatusModal, setShowStatusModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [newStatus, setNewStatus] = useState("");

//   const menuRef = useRef(null);
//   const statusModalRef = useRef(null);
//   const deleteModalRef = useRef(null);

//   useEffect(() => {
//     if (user && id) {
//       fetchProject();
//       if (user.role === "admin") {
//         fetchContractors();
//       }
//     }
//   }, [user, id]);

//   // Close menu/modals on outside click
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         setShowMenu(false);
//       }
//       if (
//         statusModalRef.current &&
//         !statusModalRef.current.contains(event.target)
//       ) {
//         setShowStatusModal(false);
//       }
//       if (
//         deleteModalRef.current &&
//         !deleteModalRef.current.contains(event.target)
//       ) {
//         setShowDeleteModal(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const fetchProject = async () => {
//     try {
//       const res = await fetch(`/api/projects/${id}`);
//       const data = await res.json();
//       if (res.ok) {
//         setProject(data.project);
//         setNewStatus(data.project.status || ""); // for modal pre-fill
//       } else {
//         setMsg(data.error || "Failed to load project");
//       }
//     } catch (err) {
//       console.error(err);
//       setMsg("Error loading project");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchContractors = async () => {
//     try {
//       const res = await fetch("/api/users?role=contractor");
//       const data = await res.json();
//       if (res.ok) setAvailableContractors(data.users || []);
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   const handleAssign = async (e) => {
//     e.preventDefault();
//     setMsg("");
//     try {
//       const res = await fetch(`/api/projects/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ assignContractorEmail: assignEmail }),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setMsg("Contractor assigned successfully");
//         setAssignEmail("");
//         fetchProject(); // Refresh project data
//       } else {
//         setMsg(data.error || "Failed to assign");
//       }
//     } catch (err) {
//       setMsg("Error assigning contractor");
//     }
//   };

//   // Update Project Status
//   const handleUpdateStatus = async () => {
//     try {
//       const res = await fetch(`/api/projects/${id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: newStatus }),
//       });
//       const data = await res.json();

//       if (res.ok) {
//         setMsg("Status updated successfully");
//         setProject(data.project);
//         setShowStatusModal(false);
//       } else {
//         setMsg(data.error || "Failed to update status");
//       }
//     } catch (err) {
//       setMsg("Error updating status");
//     }
//   };

//   // Delete Project
//   const handleDeleteProject = async () => {
//     try {
//       const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
//       if (res.ok) {
//         setMsg("Project deleted successfully");
//         setTimeout(() => router.push("/projects"), 1500);
//       } else {
//         const data = await res.json();
//         setMsg(data.error || "Failed to delete project");
//       }
//     } catch (err) {
//       setMsg("Error deleting project");
//     } finally {
//       setShowDeleteModal(false);
//     }
//   };

//   if (authLoading || loading) return <div className="p-8">Loading...</div>;
//   if (!user || !project)
//     return <div className="p-8">Access Denied or Not Found</div>;

//   return (
//     <div className="max-w-7xl mx-auto">
//       <DashboardNav role={user.role} />

//       {msg && (
//         <div className="mb-4 p-4 bg-gray-100 rounded border border-gray-200 text-center">
//           {msg}
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Main Project Info */}
//         <div className="md:col-span-2 space-y-6">
//           <div className="bg-[#0000000F] p-6 rounded-lg relative">
//             <div className="flex justify-between items-start mb-6">
//               <h1 className="text-3xl font-bold">{project.title}</h1>

//               <div className="flex items-center gap-3">
//                 <span
//                   className={`px-3 py-1 rounded text-sm font-bold
//                     ${project.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-200"}`}
//                 >
//                   {project.status}
//                 </span>

//                 {/* 3 Dots Menu - Admin Only */}
//                 {user.role === "admin" && (
//                   <div className="relative" ref={menuRef}>
//                     <button
//                       onClick={() => setShowMenu(!showMenu)}
//                       className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
//                     >
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="w-6 h-6 text-gray-700"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
//                         />
//                       </svg>
//                     </button>

//                     {showMenu && (
//                       <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50">
//                         <button
//                           onClick={() => {
//                             setShowStatusModal(true);
//                             setShowMenu(false);
//                           }}
//                           className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
//                         >
//                           Edit Status
//                         </button>
//                         <button
//                           onClick={() => {
//                             setShowDeleteModal(true);
//                             setShowMenu(false);
//                           }}
//                           className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
//                         >
//                           Delete Project
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="mt-4 space-y-2 text-gray-700">
//               <p>
//                 <strong>Service Type:</strong> {project.serviceType}
//               </p>
//               <p>
//                 <strong>Due Date:</strong>{" "}
//                 {project.dueDate
//                   ? new Date(project.dueDate).toLocaleDateString()
//                   : "N/A"}
//               </p>
//               <p>
//                 <strong>Amount:</strong> ${project.amount}
//               </p>
//             </div>

//             <div className="mt-6">
//               <h3 className="font-bold text-lg border-b border-gray-300 pb-2 mb-2">
//                 Scope of Work
//               </h3>
//               <p className="whitespace-pre-wrap text-gray-600">
//                 {project.scopeOfWork}
//               </p>
//             </div>

//             <div className="mt-6">
//               <h3 className="font-bold text-lg border-b border-gray-300 pb-2 mb-2">
//                 Payment Terms
//               </h3>
//               <p className="whitespace-pre-wrap text-gray-600">
//                 {project.paymentTerms}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Sidebar / People */}
//         <div className="space-y-6">
//           {/* Client Info */}
//           <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
//             <h3 className="font-bold text-lg mb-4">Client</h3>
//             <div className="flex items-center gap-3 mb-2">
//               <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold">
//                 {project.client?.name?.[0] || "?"}
//               </div>
//               <div>
//                 <p className="font-bold">{project.client?.name || "Unknown"}</p>
//                 <p className="text-xs text-gray-500">
//                   {project.client?.email || "—"}
//                 </p>
//               </div>
//             </div>
//             <p className="text-sm text-gray-600 mt-2">
//               {project.description || "No description"}
//             </p>
//           </div>

//           {/* Assigned Contractors */}
//           <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
//             <h3 className="font-bold text-lg mb-4">Assigned Contractors</h3>
//             {project.assignedContractors?.length > 0 ? (
//               <div className="space-y-3">
//                 {project.assignedContractors.map((c) => (
//                   <div key={c._id} className="flex items-center gap-3">
//                     <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
//                       {c.name?.[0] || "?"}
//                     </div>
//                     <p className="text-sm">{c.name || "Unnamed"}</p>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-sm text-gray-500 italic">
//                 No contractors assigned.
//               </p>
//             )}

//             {/* Assign Form (Admin Only) */}
//             {user.role === "admin" && (
//               <div className="mt-4 pt-4 border-t border-gray-100">
//                 <label className="block text-xs font-bold mb-1">
//                   Assign Contractor
//                 </label>
//                 <div className="flex gap-2">
//                   <select
//                     value={assignEmail}
//                     onChange={(e) => setAssignEmail(e.target.value)}
//                     className="flex-1 px-2 py-1 text-sm border rounded"
//                   >
//                     <option value="">Select Contractor...</option>
//                     {availableContractors.map((c) => (
//                       <option key={c._id} value={c.email}>
//                         {c.name}
//                       </option>
//                     ))}
//                   </select>
//                   <button
//                     onClick={handleAssign}
//                     disabled={!assignEmail}
//                     className="bg-black text-white px-3 py-1 rounded text-sm disabled:opacity-50"
//                   >
//                     +
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Chat Link */}
//           <div className="bg-black text-white p-4 rounded text-center">
//             <Link
//               href={`/messages/${project._id}`}
//               className="block w-full font-bold hover:underline"
//             >
//               Open Project Chat
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* ==================== Modals ==================== */}

//       {/* Status Edit Modal */}
//       {showStatusModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div
//             ref={statusModalRef}
//             className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4"
//           >
//             <h2 className="text-xl font-bold mb-4">Update Project Status</h2>
//             <select
//               value={newStatus}
//               onChange={(e) => setNewStatus(e.target.value)}
//               className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-black"
//             >
//               <option value="Draft">Draft</option>
//               <option value="Pending">Pending</option>
//               <option value="Active">Active</option>
//               <option value="Completed">Completed</option>
//             </select>

//             <div className="flex gap-3">
//               <button
//                 onClick={() => setShowStatusModal(false)}
//                 className="flex-1 py-3 border border-gray-300 rounded-full font-medium"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleUpdateStatus}
//                 className="flex-1 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800"
//               >
//                 Update Status
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div
//             ref={deleteModalRef}
//             className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4"
//           >
//             <h2 className="text-xl font-bold text-red-600 mb-2">
//               Delete Project?
//             </h2>
//             <p className="text-gray-600 mb-6">
//               This action cannot be undone. The project and all related data
//               will be permanently deleted.
//             </p>

//             <div className="flex gap-3">
//               <button
//                 onClick={() => setShowDeleteModal(false)}
//                 className="flex-1 py-3 border border-gray-300 rounded-full font-medium"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDeleteProject}
//                 className="flex-1 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700"
//               >
//                 Yes, Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardNav from "@/components/DashboardNav";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ProjectDetailsPage() {
  const { user, loading: authLoading } = useAuth();
  const { id } = useParams();
  const router = useRouter();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [assignEmail, setAssignEmail] = useState("");
  const [availableContractors, setAvailableContractors] = useState([]);

  // Menu & modal states
  const [showMenu, setShowMenu] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false); // New for remove contractor
  const [selectedToRemove, setSelectedToRemove] = useState(null); // Contractor to remove
  const [newStatus, setNewStatus] = useState("");

  const menuRef = useRef(null);
  const statusModalRef = useRef(null);
  const deleteModalRef = useRef(null);
  const removeModalRef = useRef(null); // New ref for remove modal

  useEffect(() => {
    if (user && id) {
      fetchProject();
      if (user.role === "admin") {
        fetchContractors();
      }
    }
  }, [user, id]);

  // Close menu/modals on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
      if (
        statusModalRef.current &&
        !statusModalRef.current.contains(event.target)
      ) {
        setShowStatusModal(false);
      }
      if (
        deleteModalRef.current &&
        !deleteModalRef.current.contains(event.target)
      ) {
        setShowDeleteModal(false);
      }
      if (
        removeModalRef.current &&
        !removeModalRef.current.contains(event.target)
      ) {
        setShowRemoveModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      if (res.ok) {
        setProject(data.project);
        setNewStatus(data.project.status || ""); // for modal pre-fill
      } else {
        setMsg(data.error || "Failed to load project");
      }
    } catch (err) {
      console.error(err);
      setMsg("Error loading project");
    } finally {
      setLoading(false);
    }
  };

  const fetchContractors = async () => {
    try {
      const res = await fetch("/api/users?role=contractor");
      const data = await res.json();
      if (res.ok) setAvailableContractors(data.users || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignContractorEmail: assignEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Contractor assigned successfully");
        setAssignEmail("");
        fetchProject(); // Refresh project data
      } else {
        setMsg(data.error || "Failed to assign");
      }
    } catch (err) {
      setMsg("Error assigning contractor");
    }
  };

  // New: Remove Contractor
  const handleRemoveContractor = async () => {
    setMsg("");
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removeContractorEmail: selectedToRemove.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Contractor removed successfully");
        setShowRemoveModal(false);
        setSelectedToRemove(null);
        fetchProject(); // Refresh
      } else {
        setMsg(data.error || "Failed to remove");
      }
    } catch (err) {
      setMsg("Error removing contractor");
    }
  };

  // Update Project Status
  const handleUpdateStatus = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (res.ok) {
        setMsg("Status updated successfully");
        setProject(data.project);
        setShowStatusModal(false);
      } else {
        setMsg(data.error || "Failed to update status");
      }
    } catch (err) {
      setMsg("Error updating status");
    }
  };

  // Delete Project
  const handleDeleteProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMsg("Project deleted successfully");
        setTimeout(() => router.push("/projects"), 1500);
      } else {
        const data = await res.json();
        setMsg(data.error || "Failed to delete project");
      }
    } catch (err) {
      setMsg("Error deleting project");
    } finally {
      setShowDeleteModal(false);
    }
  };

  if (authLoading || loading) return <div className="p-8">Loading...</div>;
  if (!user || !project)
    return <div className="p-8">Access Denied or Not Found</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <DashboardNav role={user.role} />

      {msg && (
        <div className="mb-4 p-4 bg-gray-100 rounded border border-gray-200 text-center">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Project Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#0000000F] p-6 rounded-lg relative">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-3xl font-bold">{project.title}</h1>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded text-sm font-bold 
                    ${project.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-200"}`}
                >
                  {project.status}
                </span>

                {/* 3 Dots Menu - Admin Only */}
                {user.role === "admin" && (
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 text-gray-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>

                    {showMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50">
                        <button
                          onClick={() => {
                            setShowStatusModal(true);
                            setShowMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Edit Status
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteModal(true);
                            setShowMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Delete Project
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-2 text-gray-700">
              <p>
                <strong>Service Type:</strong> {project.serviceType}
              </p>
              <p>
                <strong>Due Date:</strong>{" "}
                {project.dueDate
                  ? new Date(project.dueDate).toLocaleDateString()
                  : "N/A"}
              </p>
              <p>
                <strong>Amount:</strong> ${project.amount}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="font-bold text-lg border-b border-gray-300 pb-2 mb-2">
                Scope of Work
              </h3>
              <p className="whitespace-pre-wrap text-gray-600">
                {project.scopeOfWork}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="font-bold text-lg border-b border-gray-300 pb-2 mb-2">
                Payment Terms
              </h3>
              <p className="whitespace-pre-wrap text-gray-600">
                {project.paymentTerms}
              </p>
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
                {project.client?.name?.[0] || "?"}
              </div>
              <div>
                <p className="font-bold">{project.client?.name || "Unknown"}</p>
                <p className="text-xs text-gray-500">
                  {project.client?.email || "—"}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {project.description || "No description"}
            </p>
          </div>

          {/* Assigned Contractors */}
          <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
            <h3 className="font-bold text-lg mb-4">Assigned Contractors</h3>
            {project.assignedContractors?.length > 0 ? (
              <div className="space-y-3">
                {project.assignedContractors.map((c) => (
                  <div
                    key={c._id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                        {c.name?.[0] || "?"}
                      </div>
                      <p className="text-sm">{c.name || "Unnamed"}</p>
                    </div>
                    {/* Remove Button - Admin Only */}
                    {user.role === "admin" && (
                      <button
                        onClick={() => {
                          setSelectedToRemove(c);
                          setShowRemoveModal(true);
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
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
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No contractors assigned.
              </p>
            )}

            {/* Assign Form (Admin Only) */}
            {user.role === "admin" && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="block text-xs font-bold mb-1">
                  Assign Contractor
                </label>
                <div className="flex gap-2">
                  <select
                    value={assignEmail}
                    onChange={(e) => setAssignEmail(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border rounded"
                  >
                    <option value="">Select Contractor...</option>
                    {availableContractors.map((c) => (
                      <option key={c._id} value={c.email}>
                        {c.name}
                      </option>
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
            <Link
              href={`/messages/${project._id}`}
              className="block w-full font-bold hover:underline"
            >
              Open Project Chat
            </Link>
          </div>
        </div>
      </div>

      {/* ==================== Modals ==================== */}

      {/* Status Edit Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            ref={statusModalRef}
            className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4"
          >
            <h2 className="text-xl font-bold mb-4">Update Project Status</h2>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="Draft">Draft</option>
              <option value="Pending">Pending</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 py-3 border border-gray-300 rounded-full font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="flex-1 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            ref={deleteModalRef}
            className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4"
          >
            <h2 className="text-xl font-bold text-red-600 mb-2">
              Delete Project?
            </h2>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. The project and all related data
              will be permanently deleted.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 border border-gray-300 rounded-full font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                className="flex-1 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Contractor Confirmation Modal */}
      {showRemoveModal && selectedToRemove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            ref={removeModalRef}
            className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4"
          >
            <h2 className="text-xl font-bold text-red-600 mb-2">
              Remove Contractor?
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove{" "}
              <strong>{selectedToRemove.name}</strong> from this project?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRemoveModal(false);
                  setSelectedToRemove(null);
                }}
                className="flex-1 py-3 border border-gray-300 rounded-full font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveContractor}
                className="flex-1 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
