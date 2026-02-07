'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardNav({ role }) {
    const pathname = usePathname();

    const adminLinks = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Directory', href: '/directory' },
        { name: 'Projects', href: '/projects' },
        { name: 'Messages', href: '/messages' },
        { name: 'Invoices', href: '/invoices' },
        { name: 'Invite', href: '/invite' },
    ];

    const clientLinks = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Projects', href: '/projects' },
        { name: 'Messages', href: '/messages' },
        { name: 'Invoices', href: '/invoices' },
    ];

    const links = role === 'admin' ? adminLinks : clientLinks;

    return (
        <div className="flex flex-wrap gap-2 mb-8 bg-[#F0F0F0]">
            {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border border-transparent
              ${isActive
                                ? 'bg-black text-white'
                                : 'bg-transparent text-black hover:bg-gray-200 border-gray-300' // user said transparent with black text, I added hover
                            }`}
                    >
                        {link.name}
                    </Link>
                );
            })}
        </div>
    );
}
