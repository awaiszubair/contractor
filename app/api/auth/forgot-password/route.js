import dbConnect from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { sendEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    // Always return same message (prevents email enumeration attack)
    if (!user) {
      return NextResponse.json(
        { message: "If the email exists, a reset link has been sent." },
        { status: 200 },
      );
    }

    // Create reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
    // Nodemailer – Gmail (use App Password!)
    await sendEmail({
      to: email,
      subject: "Reset Your Password",
      html: ` <p>You requested a password reset for ContractorCMS.</p>
                <p>Click the button below to reset your password (link expires in 1 hour):</p>
                <a href="${resetUrl}"
                   style="display:inline-block; padding:12px 24px; background:#000000; color:#ffffff; text-decoration:none; border-radius:6px; font-weight:500;">
                   Reset Password
                </a>
                <p style="margin-top:20px;">If you didn’t request this, ignore this email.</p>
                <p>ContractorCMS Team</p>`,
    });
    return NextResponse.json(
      { message: "If the email exists, a reset link has been sent." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
