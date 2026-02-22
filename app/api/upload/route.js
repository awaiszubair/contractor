// import { NextResponse } from 'next/server';
// import { writeFile, mkdir } from 'fs/promises';
// import path from 'path';
// import { verifyToken } from '@/lib/auth';
// import { cookies } from 'next/headers';

// async function getUser() {
//     const cookieStore = await cookies();
//     const token = cookieStore.get('token')?.value;
//     if (!token) return null;
//     return verifyToken(token);
// }

// export async function POST(req) {
//     try {
//         const user = await getUser();
//         if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//         const formData = await req.formData();
//         const file = formData.get('file');

//         if (!file) {
//             return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
//         }

//         const buffer = Buffer.from(await file.arrayBuffer());
//         const filename = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
//         const uploadDir = path.join(process.cwd(), 'public/uploads');

//         // Ensure directory exists
//         try {
//             await mkdir(uploadDir, { recursive: true });
//         } catch (e) {
//             // Ignore if exists
//         }

//         await writeFile(path.join(uploadDir, filename), buffer);

//         return NextResponse.json({ url: `/uploads/${filename}`, filename: file.name });

//     } catch (error) {
//         console.error('Upload Error:', error);
//         return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//     }
// }

import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// Backblaze B2 Configuration
const b2Client = new S3Client({
  endpoint: process.env.B2_ENDPOINT, // e.g., 'https://s3.us-west-004.backblazeb2.com'
  region: process.env.B2_REGION || "us-west-004",
  credentials: {
    accessKeyId: process.env.B2_APPLICATION_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
  },
});

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

// ------------- Development Local Upload (comment out for production) -------------
export async function POST(req) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        const uploadDir = path.join(process.cwd(), 'public/uploads');

        // Ensure directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Ignore if exists
        }

        await writeFile(path.join(uploadDir, filename), buffer);

        return NextResponse.json({ url: `/uploads/${filename}`, filename: file.name });

    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// ------------- Production B2 Upload -------------
// export async function POST(req) {
//   try {
//     const user = await getUser();
//     if (!user)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const formData = await req.formData();
//     const file = formData.get("file");

//     if (!file) {
//       return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//     }

//     const buffer = Buffer.from(await file.arrayBuffer());
//     const filename = `${Date.now()}_${file.name.replace(/\s/g, "_")}`;

//     // Optional: Organize files by user ID or date
//     const fileKey = `uploads/${filename}`; // or `uploads/${user.id}/${filename}`

//     // Upload to Backblaze B2
//     const uploadParams = {
//       Bucket: process.env.B2_BUCKET_NAME,
//       Key: fileKey,
//       Body: buffer,
//       ContentType: file.type || "application/octet-stream",
//     };

//     await b2Client.send(new PutObjectCommand(uploadParams));

//     // Construct the public URL
//     const bucketName = process.env.B2_BUCKET_NAME;
//     const endpoint = process.env.B2_ENDPOINT.replace("https://", "");
//     const publicUrl = `https://${bucketName}.${endpoint}/${fileKey}`;

//     return NextResponse.json({
//       url: publicUrl,
//       filename: file.name,
//     });
//   } catch (error) {
//     console.error("Upload Error:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 },
//     );
//   }
// }
