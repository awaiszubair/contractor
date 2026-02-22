"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardNav from "@/components/DashboardNav";
import Link from "next/link";
import ProfileModal from "@/components/ProfileModal";
import { useSearchParams } from "next/navigation";

export default function DirectoryFullPage() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();

  const role = useMemo(() => {
    const r = searchParams.get("role");
    if (r === "client" || r === "contractor") return r;
    return null;
  }, [searchParams]);

  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [fetchError, setFetchError] = useState(false);

  const title = role === "client" ? "Clients" : "Contractors";
  const addLink = role ? `/invite?role=${role}` : "/invite";

  useEffect(() => {
    if (!role) return;
    fetchUsers(role);
  }, [role]);

  const fetchUsers = async (targetRole) => {
    try {
      setFetchError(false);
      const res = await fetch(`/api/users?role=${targetRole}`);

      if (!res.ok) {
        console.error(`Failed to fetch ${targetRole}s: ${res.status}`);
        setFetchError(true);
        return;
      }

      const data = await res.json();
      const userList = data.users || [];
      setAllUsers(userList);
      setUsers(userList);
    } catch (err) {
      console.error(`Error fetching ${targetRole}s:`, err);
      setFetchError(true);
    }
  };

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase().trim();

    if (!lowerSearch) {
      setUsers(allUsers);
      return;
    }

    const filtered = allUsers.filter((u) =>
      [u.name, u.email, u.phone]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(lowerSearch)),
    );

    setUsers(filtered);
  }, [searchTerm, allUsers]);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  if (!user || user.role !== "admin") {
    return (
      <div className="text-center mt-10 text-xl text-red-600">
        Access Denied
      </div>
    );
  }

  if (!role) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold mb-6">Invalid Role</h1>
        <p className="text-gray-600 mb-8">
          Please use ?role=client or ?role=contractor
        </p>
        <div className="flex justify-center gap-8">
          <Link
            href="/directory/full?role=client"
            className="text-blue-600 hover:underline text-lg"
          >
            View Clients
          </Link>
          <Link
            href="/directory/full?role=contractor"
            className="text-blue-600 hover:underline text-lg"
          >
            View Contractors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <DashboardNav role={user.role} />

        {/* Search Bar – matched style */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div className="relative w-full sm:w-96 lg:w-[420px]">
            <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-black focus-within:border-transparent transition-all duration-200">
              <div className="pl-4 text-gray-400 pointer-events-none">
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
                    d="M21 21l-5.2-5.2m1.7-4.8a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${title.toLowerCase()} by name, email or phone...`}
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

        {/* Main Section – same wrapper style as DirectoryPage */}
        <div className="bg-[#0000000F] rounded-2xl overflow-hidden border border-gray-200/60">
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-200/70 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {title}
            </h2>
            <div className="flex items-center gap-4 sm:gap-5">
              <Link
                href={`/directory?role=${role}`}
                className="text-xs sm:text-sm font-medium text-black hover:text-gray-800"
              >
                ← Back to overview
              </Link>
              <Link
                href={addLink}
                className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-900 transition-colors shadow-sm"
              >
                + Add {role === "client" ? "Client" : "Contractor"}
              </Link>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {fetchError ? (
              <div className="text-center py-16 text-red-600 text-lg">
                Failed to load {title.toLowerCase()}. Please try again later.
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-16 text-gray-500 text-lg">
                {searchTerm
                  ? `No matching ${title.toLowerCase()} found.`
                  : `No ${title.toLowerCase()} available yet.`}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 sm:gap-6">
                {users.map((u) => (
                  <div
                    key={u._id || u.id} // or c._id || c.id in the other page
                    className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                          {u.name || "Unnamed"}
                        </h3>
                        {u.email && (
                          <p className="text-sm text-gray-600 mt-0.5">
                            {u.email}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedUser(u)} // or setSelectedUser(c)
                        className="
        inline-flex items-center px-4 py-2
        bg-[#0000001F] text-black text-sm font-medium
        rounded-full
        transition-colors duration-200
        hover:bg-[#00000014]
        active:bg-[#00000026]
        cursor-pointer
        shrink-0
      "
                      >
                        View Profile
                      </button>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-3">
                      {u.bio || u.description || "No Description"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedUser && (
        <ProfileModal
          user={selectedUser}
          onClose={() => {
            setSelectedUser(null);
            if (role) fetchUsers(role);
          }}
        />
      )}
    </div>
  );
}
