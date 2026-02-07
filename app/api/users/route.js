import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    return verifyToken(token);
}

export async function GET(req) {
    try {
        await dbConnect();
        const currentUser = await getUser();
        if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Only admin can list all users? 
        // Or maybe clients need to see contractors?
        // For Directory page, it seems to be Admin only based on the page's access check.
        if (currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const url = new URL(req.url);
        const role = url.searchParams.get('role'); // 'client' or 'contractor'

        let query = {};
        if (role) {
            query.role = role;
        } else {
            // If no role specified, maybe return all except admin?
            query.role = { $ne: 'admin' };
        }

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });

        return NextResponse.json({ users });

    } catch (error) {
        console.error('Get Users Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
