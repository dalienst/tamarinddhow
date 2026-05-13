"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

export default function Navbar() {
    const { data: session } = useSession()
    const pathname = usePathname()

    const user = session?.user

    const navLinks = [
        {
            name: "Dashboard",
            href: user?.is_dhow_manager || user?.is_staff ? "/dhow-manager/dashboard" : 
                  user?.is_agent ? "/agent/dashboard" : "/guest/dashboard",
            show: !!user
        },
    ]

    return (
        <nav className="bg-white border-b border-gray-100 px-6 py-3">
            <div className="flex items-center justify-between">
                {/* Brand - Left End */}
                <div className="flex items-center gap-3">
                    <Image
                        src="/smallLogo.jpg"
                        alt="Tamarind Dhow"
                        width={32}
                        height={32}
                        className="rounded shadow-sm"
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-primary tracking-tight leading-none">
                            Tamarind Dhow
                        </span>
                        <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
                            Portal
                        </span>
                    </div>
                </div>

                {/* Navigation and Actions - Right End */}
                <div className="flex items-center gap-8">
                    {/* Links */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.filter(link => link.show).map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                                    pathname === link.href ? "text-primary" : "text-gray-400 hover:text-gray-600"
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center gap-4 pl-8 border-l border-gray-100">
                        <div className="hidden sm:flex flex-col text-right">
                            <p className="text-xs font-semibold text-gray-900 leading-none truncate max-w-[150px]">
                                {user?.name || user?.email}
                            </p>
                            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mt-1">
                                {user?.is_superuser ? "Admin" : 
                                 user?.is_dhow_manager ? "Manager" : 
                                 user?.is_agent ? "Agent" : "Guest"}
                            </p>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest border border-red-100 px-3 py-1.5 rounded bg-red-50/50"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}