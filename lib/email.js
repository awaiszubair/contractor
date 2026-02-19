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


import nodemailer from 'nodemailer';

// Transporter ko function ke andar banao, bahar nahi
// Kyunki cold start pe connection fail ho sakta hai
export async function sendEmail({ to, subject, html }) {
    try {
        // Check if email credentials exist
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('Email credentials not configured');
            throw new Error('Email service not configured');
        }

        // Create transporter with proper settings
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for 587
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // Must be App Password, not regular password!
            },
            // Timeout settings (bahut important for production)
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 10000,   // 10 seconds  
            socketTimeout: 15000,      // 15 seconds
            // TLS settings
            tls: {
                rejectUnauthorized: false, // For self-signed certificates
                minVersion: 'TLSv1.2',
            },
            // Connection pooling
            pool: true,
            maxConnections: 5,
            maxMessages: 10,
        });

        // Verify connection before sending
        console.log('Verifying SMTP connection...');
        await transporter.verify();
        console.log('SMTP connection verified ✓');

        // Send email
        const info = await transporter.sendMail({
            from: `"Contractor CMS" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        
        // Detailed error logging for debugging
        if (error.code === 'ECONNECTION') {
            console.error('Connection error - Check SMTP settings');
        } else if (error.code === 'EAUTH') {
            console.error('Authentication error - Check EMAIL_USER and EMAIL_PASS');
        } else if (error.code === 'ETIMEDOUT') {
            console.error('Timeout error - SMTP server not responding');
        }
        
        throw error;
    }
}