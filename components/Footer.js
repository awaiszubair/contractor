"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";
import companyLogo from "../public/footer_logo.png";
import Image from "next/image";

export default function Footer() {
  const { user } = useAuth() || {};

  return (
    // <footer className="bg-black text-white">
    //   {/* Main footer content */}
    //   <div className="max-w-7xl mx-auto px-6  py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
    //     {/* LEFT — LOGO */}
    //     <Image src={companyLogo} alt="Valiant Production Logo" />

    //     {/* MIDDLE — LINKS */}
    //     <div className="grid grid-cols-[max-content_max-content] gap-x-10 justify-end">
    //       <div className="flex flex-col items-start gap-3 text-lg">
    //         {user?.role == "admin" ? (
    //           <>
    //             <Link href="/" className="hover:underline">
    //               Dashboard
    //             </Link>
    //             <Link href="/directory" className="hover:underline">
    //               Directory
    //             </Link>
    //             <Link href="/projects" className="hover:underline">
    //               Projects
    //             </Link>
    //             <Link href="/messages" className="hover:underline">
    //               Messages
    //             </Link>
    //             <Link href="/invoices" className="hover:underline">
    //               Invoices
    //             </Link>
    //             <Link href="/invite" className="hover:underline">
    //               Invite
    //             </Link>
    //           </>
    //         ) : (
    //           <>
    //             <Link href="/" className="hover:underline">
    //               Dashboard
    //             </Link>
    //             <Link href="/" className="hover:underline">
    //               Contracts
    //             </Link>
    //             <Link href="/" className="hover:underline">
    //               Projects
    //             </Link>
    //             <Link href="/" className="hover:underline">
    //               Messages
    //             </Link>
    //             <Link href="/" className="hover:underline">
    //               Invoices
    //             </Link>
    //           </>
    //         )}
    //       </div>

    //       {/* RIGHT — CONTACT + SOCIAL */}
    //       <div className="">
    //         <h4 className="font-bold mb-3">Contact Us:</h4>
    //         <p>973-255-8304</p>
    //         <p className="mb-6">info@valiantproduction.com</p>

    //         <h4 className="font-bold mb-3">Follow Us Here:</h4>
    //         <div className="flex gap-5 text-3xl">
    //           <FaInstagram className="hover:text-pink-400 cursor-pointer" />
    //           <FaFacebookF className="hover:text-blue-400 cursor-pointer" />
    //           <FaYoutube className="hover:text-red-500 cursor-pointer" />
    //         </div>
    //       </div>
    //     </div>
    //   </div>

    //   {/* BOTTOM BAR */}
    //   <div className="border-t border-white/40 py-4">
    //     <p className="text-center text-sm">
    //       All Rights And Claims Reserved {new Date().getFullYear()}
    //     </p>
    //   </div>
    // </footer>



  <footer className="bg-black text-white">

  {/* Main Footer Content */}
  <div
    className="
      max-w-7xl mx-auto
      px-6
      py-12 md:py-16
      grid grid-cols-1 md:grid-cols-2
      gap-10 md:gap-12
      items-center md:items-start
      text-center md:text-left
    "
  >

    {/* LEFT — LOGO */}
    <div className="flex justify-center md:justify-start">
      <Image
        src={companyLogo}
        alt="Valiant Production Logo"
      />
    </div>

    {/* RIGHT — LINKS + CONTACT */}
    <div
      className="
        flex flex-col gap-10 md:gap-0
        md:grid md:grid-cols-[max-content_max-content]
        md:gap-x-10
        md:justify-end
        items-center md:items-start
      "
    >

      {/* LINKS */}
      <div className="flex flex-col gap-3 text-lg items-center md:items-start">
        {user?.role == "admin" ? (
          <>
            <Link href="/" className="hover:underline">Dashboard</Link>
            <Link href="/directory" className="hover:underline">Directory</Link>
            <Link href="/projects" className="hover:underline">Projects</Link>
            <Link href="/messages" className="hover:underline">Messages</Link>
            <Link href="/invoices" className="hover:underline">Invoices</Link>
            <Link href="/invite" className="hover:underline">Invite</Link>
          </>
        ) : (
          <>
            <Link href="/" className="hover:underline">Dashboard</Link>
            <Link href="/" className="hover:underline">Contracts</Link>
            <Link href="/" className="hover:underline">Projects</Link>
            <Link href="/" className="hover:underline">Messages</Link>
            <Link href="/" className="hover:underline">Invoices</Link>
          </>
        )}
      </div>

      {/* CONTACT + SOCIAL */}
      <div className="space-y-4">
        <div>
          <h4 className="font-bold mb-2">Contact Us:</h4>
          <p>973-255-8304</p>
          <p>info@valiantproduction.com</p>
        </div>

        <div>
          <h4 className="font-bold mb-2">Follow Us Here:</h4>
          <div className="flex gap-5 text-3xl justify-center md:justify-start">
            <FaInstagram className="hover:text-pink-400 cursor-pointer" />
            <FaFacebookF className="hover:text-blue-400 cursor-pointer" />
            <FaYoutube className="hover:text-red-500 cursor-pointer" />
          </div>
        </div>
      </div>

    </div>
  </div>

  {/* Bottom Bar */}
  <div className="border-t border-white/40 py-4">
    <p className="text-center text-sm">
      All Rights And Claims Reserved {new Date().getFullYear()}
    </p>
  </div>

</footer>


  );
}
