import dbConnect from '@/lib/db';
import User from '@/models/User';
import Project from '@/models/Project';
import Message from '@/models/Message';
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

        const url = new URL(req.url);
        const projectId = url.searchParams.get('projectId');

        // Logic to find "contacts":
        // 1. Find all projects available to current user (or filtered by projectId).
        // 2. Extract all participants (Client, Contractors, Creator/Admin) from these projects.
        // 3. Exclude current user.
        // 4. Return unique list of users with last message info.

        let projectQuery = {};
        if (currentUser.role === 'client') {
            projectQuery.client = currentUser.id;
        } else if (currentUser.role === 'contractor') {
            projectQuery.assignedContractors = currentUser.id;
        }

        if (projectId && projectId !== 'all') {
            projectQuery._id = projectId;
        }

        const projects = await Project.find(projectQuery)
            .populate('client', 'name email avatar role')
            .populate('assignedContractors', 'name email avatar role')
            .populate('createdBy', 'name email avatar role'); // Admin

        let usersMap = new Map();

        projects.forEach(p => {
            const participants = [];
            if (p.client) participants.push(p.client);
            if (p.assignedContractors) participants.push(...p.assignedContractors);
            if (p.createdBy) participants.push(p.createdBy);

            participants.forEach(u => {
                if (u._id.toString() !== currentUser.id) {
                    if (!usersMap.has(u._id.toString())) {
                        usersMap.set(u._id.toString(), {
                            _id: u._id,
                            name: u.name,
                            role: u.role,
                            avatar: u.avatar,
                            projects: [p._id], // Track which projects they are in
                            unread: 0, // Placeholder
                            lastMessage: null // Placeholder
                        });
                    } else {
                        // Add project to list if not present
                        const existing = usersMap.get(u._id.toString());
                        if (!existing.projects.includes(p._id)) {
                            existing.projects.push(p._id);
                        }
                    }
                }
            });
        });

        // Now fetch last message for each user interaction
        // This is expensive if loop one by one. Better to fetch all messages involving currentUser and aggregation?
        // Optimization for prototype: Just fetch last message for top 20 recent conversations?
        // Or simpler: Just return list of users for now, and let Client fetch individual threads or use a single aggregation.

        // I'll do a simple iteration for now as user base is small.
        const users = Array.from(usersMap.values());

        for (let u of users) {
            // Find last message between currentUser and u
            // Filter by projectId if specific project selected?
            // "if admin assigned multiple projects... they can also filter chat members by project wise."

            let msgQuery = {
                $or: [
                    { sender: currentUser.id, receiver: u._id },
                    { sender: u._id, receiver: currentUser.id }
                ]
            };

            // If filtering by project, we ONLY want messages tagged with that project?
            // "filter chat members by project".
            // If I filter Project A, I see User X. The chat content should likely comprise Project A messages.
            if (projectId && projectId !== 'all') {
                msgQuery.project = projectId;
            } else {
                // If "All Messages", do we show all messages?
                // Probably yes.
            }

            const lastMsg = await Message.findOne(msgQuery).sort({ createdAt: -1 });
            if (lastMsg) {
                u.lastMessage = {
                    content: lastMsg.type === 'text' ? lastMsg.content : `[${lastMsg.type}]`,
                    createdAt: lastMsg.createdAt
                };
            }
        }

        // Sort users by last message time
        users.sort((a, b) => {
            const dateA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt) : new Date(0);
            const dateB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt) : new Date(0);
            return dateB - dateA;
        });

        console.log('[Chat Users API] Returning', users.length, 'users');
        users.forEach(u => {
            console.log(`  - ${u.name}: ${u.projects.length} projects`);
        });

        return NextResponse.json({ users });

    } catch (error) {
        console.error('Chat Users Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
