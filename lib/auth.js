import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

export async function comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

export function setCookie(res, token) {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 day
        sameSite: 'strict',
        path: '/',
    };

    if (res.cookies && typeof res.cookies.set === 'function') {
        // Next.js App Router (NextResponse)
        res.cookies.set('token', token, cookieOptions);
    } else if (typeof res.setHeader === 'function') {
        // Node.js / Pages Router
        const cookie = serialize('token', token, cookieOptions);
        res.setHeader('Set-Cookie', cookie);
    }
}
