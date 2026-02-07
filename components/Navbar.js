'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
            {/* Left: Logo */}
            <div className="text-xl font-bold">
                <Link href="/">ContractorCMS</Link>
            </div>

            {/* Right: Hamburger & Profile */}
            <div className="flex items-center gap-4">
                {user ? (
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold">{user.name}</p>
                            <p className="text-xs text-gray-500 uppercase">{user.role}</p>
                        </div>
                        {/* Avatar (Placeholder if no image) */}
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                            {user.avatar ? (
                                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-gray-600 font-bold">{user.name?.[0]?.toUpperCase()}</span>
                            )}
                        </div>
                        {/* Hamburger */}
                        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
                            <div className="space-y-1">
                                <span className="block w-6 h-0.5 bg-black"></span>
                                <span className="block w-6 h-0.5 bg-black"></span>
                                <span className="block w-6 h-0.5 bg-black"></span>
                            </div>
                        </button>
                    </div>
                ) : (
                    <Link href="/login" className="text-sm font-semibold hover:underline">Login</Link>
                )}
            </div>

            {/* Mobile/Sidebar Menu */}
            {menuOpen && (
                <div className="absolute top-16 right-4 w-48 bg-white shadow-lg rounded-lg border border-gray-100 p-2 z-50">
                    <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-50 rounded">Dashboard</Link>
                    <Link href="/profile" className="block px-4 py-2 hover:bg-gray-50 rounded">Profile</Link>
                    <button onClick={logout} className="block w-full text-left px-4 py-2 hover:bg-gray-50 rounded text-red-600">Logout</button>
                </div>
            )}
        </nav>
    );
}
