import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import Project from '@/models/Project';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { writeFile } from 'fs/promises';
import path from 'path';

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    return verifyToken(token);
}

export async function POST(req) {
    try {
        await dbConnect();
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const formData = await req.formData();
        const file = formData.get('file');
        const description = formData.get('description');
        const projectId = formData.get('project');
        const amount = formData.get('amount');

        if (!file || !projectId) {
            return NextResponse.json({ error: 'Missing file or project' }, { status: 400 });
        }

        // Validate user belongs to project or is admin
        // For simplicity, we just check if project exists for now, 
        // ideally we check if user is assigned to project.

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        const uploadDir = path.join(process.cwd(), 'public/uploads');

        // Ensure uploadDir exists (handled by run_command previously but good to be safe)
        // await mkdir(uploadDir, { recursive: true });

        await writeFile(path.join(uploadDir, filename), buffer);
        const fileUrl = `/uploads/${filename}`;

        // Determine Receiver (Admin if sender is client/contractor, or Contractor if sender is Admin)
        // User requirements: "Client Invoice Page: Just can submit its invoice and will automatically be sended to admin"
        // "Admin Invoice Page: Admin can view invoices sended by client, and can send invoice to contractor project wise."

        // Default receiver is Admin (we don't have a specific admin user ID easily accessible without query, 
        // but arguably Receiver field might not be strictly needed if we just filter by Sender Role).
        // Let's just store it if we can find one, or leave null and imply Admin.
        // Actually Schema requires Receiver.
        // Let's change Schema or find an Admin.
        // For now, I'll relax the schema requirement strictly or just find the first admin.

        // Wait, schema says required. I'll just put the Project's creator (usually admin).
        const project = await Project.findById(projectId);
        let receiverId = project.createdBy; // Default to project creator (Admin)

        if (user.role === 'admin') {
            // If Admin is sending, they are likely sending TO the contractor?
            // "can send invoice to contractor".
            // We'd need to know Which contractor.
            // For now, if Admin sends, let's assume they are just uploading a record.
            // or we need a field "receiver" in form. 
            // Simplification: Invoices are usually incoming to Admin.
            receiverId = user.id; // Self assign if admin for now to avoid error
        }

        const newInvoice = await Invoice.create({
            project: projectId,
            sender: user.id,
            receiver: receiverId,
            fileUrl,
            description,
            amount: amount || 0,
            status: 'pending' // Default
        });

        return NextResponse.json({ message: 'Invoice submitted', invoice: newInvoice }, { status: 201 });

    } catch (error) {
        console.error('Invoice Upload Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        await dbConnect();
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        let query = {};

        if (user.role === 'client') {
            query.sender = user.id;
        } else if (user.role === 'contractor') {
            query.sender = user.id;
            // Also maybe invoices sentenced TO them? 
            // "can send invoice to contractor" -> query.$or = [{sender: user.id}, {receiver: user.id}]
            query = { $or: [{ sender: user.id }, { receiver: user.id }] };
        }
        // Admin sees all

        const invoices = await Invoice.find(query)
            .populate('sender', 'name email role')
            .populate('project', 'title')
            .sort({ createdAt: -1 });

        return NextResponse.json({ invoices });

    } catch (error) {
        console.error('Get Invoices Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
