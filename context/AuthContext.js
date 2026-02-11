"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const changePassword = async (currentPassword, newPassword) => {
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to change password");
    }

    return data;
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();

      if (res.ok) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error("Fetch projects error", err);
    }
  };

  const checkUserLoggedIn = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        await fetchProjects();
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check error", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to reset password");
    }

    return data;
  };

  const login = async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      router.push("/dashboard"); // Standard redirect
      return { success: true };
    }
    return { success: false, error: data.error };
  };

  const logout = async () => {
    try {
      // Call the logout API to clear the httpOnly cookie
      await fetch("/api/auth/logout", { method: "POST" });

      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear state and redirect even if API fails
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        projects,
        changePassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
