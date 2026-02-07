import dbConnect from '@/lib/db';
import User from '@/models/User';
import { signToken, verifyToken } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        await dbConnect();

        // Check if requester is admin
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        // Allow if no users exist yet (first run) or if admin
        const userCount = await User.countDocuments();

        if (userCount > 0) {
            if (!token) {
                return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
            }
            const decoded = verifyToken(token);
            if (!decoded || decoded.role !== 'admin') {
                return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
            }
        }

        const { email, role, name } = await req.json();

        if (!email || !role) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        // Generate invite token valid for 3 days
        // We strictly use this token to verify the email and role during registration
        const inviteToken = signToken({ email, role, name });

        // In a real app, send actual email. For now we just return the link or log it.
        // user requested nodemailer, we implemented it in lib/email.js

        const registrationLink = `${process.env.NEXT_PUBLIC_API_URL}/register?token=${inviteToken}`;

        // Send email (commented out if no env vars set, but code is there)
        if (process.env.EMAIL_USER) {
            await sendEmail({
                to: email,
                subject: 'You have been invited to Contractor CMS',
                html: `<p>Hello ${name || 'User'},</p><p>You have been invited to join as a ${role}.</p><p><a href="${registrationLink}">Click here to register</a></p>`
            });
        }

        return NextResponse.json({ message: 'Invitation sent', link: registrationLink });

    } catch (error) {
        console.error('Invite error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
