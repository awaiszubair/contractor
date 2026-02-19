"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardNav from "@/components/DashboardNav";
import Link from "next/link";
import ProfileModal from "@/components/ProfileModal";

export default function DirectoryPage() {
  const { user, loading } = useAuth();
  const [clients, setClients] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [allContractors, setAllContractors] = useState([]);
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

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!user || user.role !== "admin")
    return <div className="text-center mt-10 text-red-600">Access Denied</div>;

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <DashboardNav role={user.role} />

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
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
                placeholder="Search by name, email or phone..."
                className="flex-1 py-3 px-3 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-base"
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
          <div className="hidden sm:block flex-1"></div>
        </div>

        {/* Clients Section */}
        <div className="mb-12 bg-[#0000000F] rounded-2xl overflow-hidden border border-gray-200/60">
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-200/70 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Clients
            </h2>
            <div className="flex items-center gap-4 sm:gap-5">
              <Link
                href="/directory/full?role=client"
                className="text-xs cursor-pointer sm:text-sm font-medium text-black hover:text-gray-800"
              >
                View All...
              </Link>
              <Link
                href="/invite?role=client"
                className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-900 transition-colors shadow-sm"
              >
                + Add Client
              </Link>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid  grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {clients.length > 0 ? (
                clients.slice(0, 2).map((c) => (
                  <div
                    key={c._id || c.id}
                    className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                          {c.name || "Unnamed"}
                        </h3>
                        {c.email && (
                          <p className="text-sm text-gray-600 mt-0.5">
                            {c.email}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedUser(c)}
                        className="inline-flex items-center px-4 py-2
  bg-[#0000001F]
  text-black text-sm font-medium
  rounded-full
  transition-colors duration-200
  hover:bg-[#00000014]
  active:bg-[#00000026]
  cursor-pointer
  "
                      >
                        View Profile
                      </button>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {c.bio ||
                        c.description ||
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit..."}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 col-span-2 text-center py-8">
                  {searchTerm
                    ? "No matching clients found."
                    : "No clients found."}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contractors Section */}
        <div className="bg-[#0000000F] rounded-2xl overflow-hidden border border-gray-200/60">
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-200/70 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Contractors
            </h2>
            <div className="flex items-center gap-4 sm:gap-5">
              <Link
                href="/directory/full?role=contractor"
                className="text-xs sm:text-sm font-medium text-black hover:text-gray-800"
              >
                View All...
              </Link>
              <Link
                href="/invite?role=contractor"
                className="inline-flex items-center px-4 py-2 bg-black text-white rounded-full text-sm font-medium  hover:bg-gray-900 transition-colors shadow-sm"
              >
                + Add Contractor
              </Link>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {contractors.length > 0 ? (
                contractors.slice(0, 2).map((c) => (
                  <div
                    key={c._id || c.id}
                    className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                          {c.name || "Unnamed"}
                        </h3>
                        {c.email && (
                          <p className="text-sm text-gray-600 mt-0.5">
                            {c.email}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedUser(c)}
                        className="inline-flex items-center px-4 py-2
  bg-[#0000001F]
  text-black text-sm font-medium
  rounded-full
  transition-colors duration-200
  hover:bg-[#00000014]
  active:bg-[#00000026]
  cursor-pointer
  "
                      >
                        View Profile
                      </button>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {c.bio ||
                        c.description ||
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit..."}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 col-span-2 text-center py-8">
                  {searchTerm
                    ? "No matching contractors found."
                    : "No contractors found."}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Modal */}
        {selectedUser && (
          <ProfileModal
            user={selectedUser}
            onClose={() => {
              setSelectedUser(null);
              fetchUsers();
            }}
          />
        )}
      </div>
    </div>
  );
}
