// import nodemailer from 'nodemailer';

// const transporter = nodemailer.createTransport({
//     service: 'gmail', // Use specific service or SMTP details from env
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });

// export async function sendEmail({ to, subject, html }) {
//     try {
//         const info = await transporter.sendMail({
//             from: `"Contractor CMS" <${process.env.EMAIL_USER}>`,
//             to,
//             subject,
//             html,
//         });
//         console.log('Message sent: %s', info.messageId);
//         return info;
//     } catch (error) {
//         console.error('Error sending email:', error);
//         throw error;
//     }
// }

// lib/sendEmail.js (Next.js)
export async function sendEmail({ to, subject, html }) {
    try {
        const response = await fetch('https://awaiszubair512.wixstudio.com/my-site-3/_functions/sendEmail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to, subject, html })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to send email");
        }

        console.log("Message sent via Wix backend:", data.messageId);
        return data;
    } catch (error) {
        console.error("Error sending email via Wix backend:", error);
        throw error;
    }
}
