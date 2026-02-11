// You can put this in a new file: components/ChangePasswordSection.tsx
// or just paste it directly in DashboardPage for now
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const { changePassword } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await changePassword(currentPassword, newPassword); // ✅ clean
      setMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0000000F] p-6 rounded-[20px]">
      <h2 className="text-lg font-bold mb-4">Change Password</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white rounded-[15px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white rounded-[15px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white rounded-[15px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            required
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 p-3 rounded-[12px]">
            {error}
          </p>
        )}

        {message && (
          <p className="text-green-600 text-sm bg-green-50 p-3 rounded-[12px]">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`
            w-full py-3 px-4 rounded-[82px] text-white font-medium
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-gray-800 transition-colors"
            }
          `}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;
