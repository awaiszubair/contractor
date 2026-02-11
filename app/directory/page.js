// 'use client';

// import { useState, useEffect } from 'react';
// import { useAuth } from '@/context/AuthContext';
// import DashboardNav from '@/components/DashboardNav';
// import UserCard from '@/components/UserCard';
// import Link from 'next/link';
// import ProfileModal from '@/components/ProfileModal'; // Will create next

// export default function DirectoryPage() {
//     const { user, loading } = useAuth();
//     const [clients, setClients] = useState([]);
//     const [contractors, setContractors] = useState([]);
//     const [selectedUser, setSelectedUser] = useState(null);

//     useEffect(() => {
//         fetchUsers();
//     }, []);

//     const fetchUsers = async () => {
//         try {
//             // Parallel fetch
//             const [clientsRes, contractorsRes] = await Promise.all([
//                 fetch('/api/users?role=client'),
//                 fetch('/api/users?role=contractor')
//             ]);

//             if (clientsRes.ok) {
//                 const data = await clientsRes.json();
//                 setClients(data.users || []);
//             }

//             if (contractorsRes.ok) {
//                 const data = await contractorsRes.json();
//                 setContractors(data.users || []);
//             }

//         } catch (e) {
//             console.error('Failed to fetch users', e);
//         }
//     };

//     if (loading) return <div>Loading...</div>;
//     if (!user || user.role !== 'admin') return <div className="text-center mt-10">Access Denied</div>;

//     return (
//         <div className="max-w-7xl mx-auto">
//             <DashboardNav role={user.role} />

//             {/* Clients Section */}
//             <div className="mb-12">
//                 <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-2">
//                     <h2 className="text-2xl font-bold">Clients</h2>
//                     <Link href="/directory?role=client" className="text-sm font-semibold hover:underline">View All...</Link>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {/* Map clients here */}
//                     {clients.length > 0 ? clients.slice(0, 2).map(c => (
//                         <UserCard key={c.id} user={c} onViewProfile={setSelectedUser} />
//                     )) : (
//                         <p className="text-gray-500 col-span-2">No clients found.</p>
//                     )}
//                 </div>
//                 <div className="mt-4">
//                     <Link href="/invite?role=client" className="inline-block bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800">
//                         + Add Client
//                     </Link>
//                 </div>
//             </div>

//             {/* Contractors Section */}
//             <div>
//                 <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-2">
//                     <h2 className="text-2xl font-bold">Contractors</h2>
//                     <Link href="/directory?role=contractor" className="text-sm font-semibold hover:underline">View All...</Link>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {/* Map contractors here */}
//                     {contractors.length > 0 ? contractors.slice(0, 2).map(c => (
//                         <UserCard key={c.id} user={c} onViewProfile={setSelectedUser} />
//                     )) : (
//                         <p className="text-gray-500 col-span-2">No contractors found.</p>
//                     )}
//                 </div>
//                 <div className="mt-4">
//                     <Link href="/invite?role=contractor" className="inline-block bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800">
//                         + Add Contractor
//                     </Link>
//                 </div>
//             </div>

//             {/* Profile Modal */}
//             {selectedUser && (
//                 <ProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
//             )}

//         </div>
//     );
// }
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardNav from "@/components/DashboardNav";
import UserCard from "@/components/UserCard";
import Link from "next/link";
import ProfileModal from "@/components/ProfileModal";

export default function DirectoryPage() {
  const { user, loading } = useAuth();
  const [clients, setClients] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [allClients, setAllClients] = useState([]); // for filtering
  const [allContractors, setAllContractors] = useState([]); // for filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const [clientsRes, contractorsRes] = await Promise.all([
        fetch("/api/users?role=client"),
        fetch("/api/users?role=contractor"),
      ]);

      if (clientsRes.ok) {
        const data = await clientsRes.json();
        const clientList = data.users || [];
        setAllClients(clientList);
        setClients(clientList);
      }

      if (contractorsRes.ok) {
        const data = await contractorsRes.json();
        const contractorList = data.users || [];
        setAllContractors(contractorList);
        setContractors(contractorList);
      }
    } catch (e) {
      console.error("Failed to fetch users", e);
    }
  };

  // Real-time filtering whenever searchTerm changes
  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase().trim();

    if (!lowerSearch) {
      setClients(allClients);
      setContractors(allContractors);
      return;
    }

    const filterUsers = (users) =>
      users.filter(
        (u) =>
          u.name?.toLowerCase().includes(lowerSearch) ||
          u.email?.toLowerCase().includes(lowerSearch) ||
          u.phone?.toLowerCase().includes(lowerSearch),
      );

    setClients(filterUsers(allClients));
    setContractors(filterUsers(allContractors));
  }, [searchTerm, allClients, allContractors]);

  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== "admin")
    return <div className="text-center mt-10">Access Denied</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <DashboardNav role={user.role} />

      {/* Search Bar – same style & width as ProjectsPage */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        {/* Search Bar */}
        <div className="relative w-full sm:w-96 lg:w-[420px]">
          <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-black focus-within:border-transparent transition-all duration-200">
            {/* Search icon */}
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

            {/* Input */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="
                flex-1 py-2.5 px-3 
                bg-transparent 
                text-gray-900 placeholder-gray-500 
                focus:outline-none 
                text-sm sm:text-base
              "
            />

            {/* Clear button */}
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

        {/* Optional space on right – keeps layout balanced */}
        <div className="hidden sm:block flex-1"></div>
      </div>

      {/* Clients Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-2">
          <h2 className="text-2xl font-bold">Clients</h2>
          <Link
            href="/directory?role=client"
            className="text-sm font-semibold hover:underline"
          >
            View All...
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clients.length > 0 ? (
            clients
              .slice(0, 2)
              .map((c) => (
                <UserCard
                  key={c._id || c.id}
                  user={c}
                  onViewProfile={setSelectedUser}
                />
              ))
          ) : (
            <p className="text-gray-500 col-span-2">
              {searchTerm ? "No matching clients found." : "No clients found."}
            </p>
          )}
        </div>
        <div className="mt-4">
          <Link
            href="/invite?role=client"
            className="inline-block bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
          >
            + Add Client
          </Link>
        </div>
      </div>

      {/* Contractors Section */}
      <div>
        <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-2">
          <h2 className="text-2xl font-bold">Contractors</h2>
          <Link
            href="/directory?role=contractor"
            className="text-sm font-semibold hover:underline"
          >
            View All...
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contractors.length > 0 ? (
            contractors
              .slice(0, 2)
              .map((c) => (
                <UserCard
                  key={c._id || c.id}
                  user={c}
                  onViewProfile={setSelectedUser}
                />
              ))
          ) : (
            <p className="text-gray-500 col-span-2">
              {searchTerm
                ? "No matching contractors found."
                : "No contractors found."}
            </p>
          )}
        </div>
        <div className="mt-4">
          <Link
            href="/invite?role=contractor"
            className="inline-block bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
          >
            + Add Contractor
          </Link>
        </div>
      </div>

      {/* Profile Modal */}
      {selectedUser && (
        <ProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
