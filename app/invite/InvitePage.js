"use client";
import { useEffect } from "react";
import { useAuth } from "../messages";
import { useSearchParams } from "next/navigation";
import DashboardNav from "@/components/DashboardNav";
import { useState } from "react";
import TextField from "@/components/TextField";

export default function InvitePage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || "client";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: initialRole,
    phone: "",
    description: "",
    projectId: "", // ← new
  });

  const [projects, setProjects] = useState([]); // ← new
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  // Fetch projects for dropdown (admin only)
  useEffect(() => {
    if (user?.role === "admin") {
      const fetchProjects = async () => {
        try {
          const res = await fetch("/api/projects");
          const data = await res.json();
          if (res.ok) setProjects(data.projects || []);
        } catch (err) {
          console.error("Failed to load projects");
        }
      };
      fetchProjects();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    setInviteLink("");

    try {
      const payload = { ...formData };
      if (!payload.projectId) delete payload.projectId; // don't send empty string

      const res = await fetch("/api/auth/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Invitation sent successfully!");
        setInviteLink(data.link);
        setFormData({
          name: "",
          email: "",
          role: formData.role, // keep role
          phone: "",
          description: "",
          projectId: "",
        });
      } else {
        setError(data.error || "Failed to send invite");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "admin")
    return <div className="p-8 text-center">Access Denied</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <DashboardNav role={user.role} />

      <div className="bg-white max-sm:py-4 max-sm:px-4 md:p-8 rounded-[20px] md:rounded-[30px] shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold mb-6">Invite New User</h1>

        {/* {message && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-[30px] border border-green-200">
            {message}
            {inviteLink && (
              <p className="mt-2 text-sm text-green-900 break-all">
                <strong>Registration Link (for testing):</strong> <br />
                <a href={inviteLink} className="underline">
                  {inviteLink}
                </a>
              </p>
            )}
          </div>
        )} */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-[10px] border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-bold">User Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:ring-black focus:border-black"
                />
              </div> */}
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:ring-black focus:border-black"
                />
              </div> */}
              <TextField
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:ring-black focus:border-black"
                />
              </div> */}
              <TextField
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border-1 border-[#00000033] 
p-2 rounded-[15px] bg-[#F8F8F8] 
focus:outline-none 
focus:border-[#00000066] 
focus:ring-2 focus:ring-[#00000022]"
                >
                  <option value="client">Client</option>
                  <option value="contractor">Contractor</option>
                  {/* <option value="admin">Admin</option> */}
                </select>
              </div>

              {/* NEW: Project selector – optional */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Project (optional)
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) =>
                    setFormData({ ...formData, projectId: e.target.value })
                  }
                  className="w-full px-3 py-2 border-1 border-[#00000033] 
p-2 rounded-[15px]  bg-[#F8F8F8] 
focus:outline-none 
focus:border-[#00000066] 
focus:ring-2 focus:ring-[#00000022]"
                >
                  <option value="">General invite (no project)</option>
                  {projects.map((proj) => (
                    <option key={proj._id} value={proj._id}>
                      {proj.title} ({proj.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description / Notes
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:ring-black focus:border-black h-24"
                />
              </div> */}
              <TextField
                label="Description / Notes"
                type="textarea"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                classes="md:col-span-2"
              />
            </div>
          </div>

          <div className="flex gap-4">
            {/* <button
              type="button"
              className="px-6 cursor-pointer py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button> */}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-black cursor-pointer text-white rounded-full hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Sending Invite..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
