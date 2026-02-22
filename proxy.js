import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "./lib/auth";

// Roles allowed for all pages (admin full access, client/contractor limited)
const ROLE_ALLOWED = {
  admin: ["*"], // admin → all pages
  client: ["/dashboard", "/projects", "/messages", "/invoices", "/invite"],
  contractor: ["/dashboard", "/projects", "/messages", "/invoices", "/invite"],
};

async function getUser(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return await verifyToken(token); // { role: "admin" | "client" | "contractor", ... }
}

export default async function middleware(request) {
  const user = await getUser(request);
  let path = request.nextUrl.pathname.replace(/\/$/, "");
  
  // console.log("Middleware: User:", user, "Path:", path);

  // No token → redirect login
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const allowedRoutes = ROLE_ALLOWED[user.role];

  // Admin has full access (*)
  if (!allowedRoutes.includes("*") && !allowedRoutes.includes(path)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Apply middleware to all main routes
export const config = {
  matcher: ["/dashboard", "/projects", "/messages", "/invoices", "/directory", "/invite", "/contracts/create"],
};
