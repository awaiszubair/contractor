import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import User from '@/models/User';
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
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        let projectQuery = {};

        // Contextual access control
        if (user.role === 'client') {
            projectQuery.client = user.id;
        } else if (user.role === 'contractor') {
            projectQuery.assignedContractors = user.id;
        }

        // 1. Project Stats
        const totalProjects = await Project.countDocuments(projectQuery);

        const activeProjectsCount = await Project.countDocuments({
            ...projectQuery,
            status: 'Active'
        });

        const pendingProjectsCount = await Project.countDocuments({
            ...projectQuery,
            status: 'Pending'
        });

        // Projects due in next 7 days
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const dueSoonCount = await Project.countDocuments({
            ...projectQuery,
            status: { $ne: 'Completed' },
            dueDate: { $lte: sevenDaysFromNow, $gte: new Date() }
        });

        // 2. Recent Projects
        const recentProjects = await Project.find(projectQuery)
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title status dueDate description');

        // 3. Recent Messages (for user's projects)
        // Find projects user is involved in first if not admin, or just use the query
        // Actually message query is complex if we want "messages from my projects".
        // Simplest: Find messages where 'project' is IN list of user's projects.
        const userProjects = await Project.find(projectQuery).select('_id');
        const projectIds = userProjects.map(p => p._id);

        const recentMessages = await Message.find({ project: { $in: projectIds } })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('sender', 'name')
            .populate('project', 'title');

        return NextResponse.json({
            stats: {
                total: totalProjects,
                active: activeProjectsCount,
                pending: pendingProjectsCount,
                dueSoon: dueSoonCount
            },
            recentProjects,
            recentMessages
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
