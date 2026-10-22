"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Activity, Anchor, Settings, Users } from "lucide-react"

const links = [
    { name: "Users", href: "/superuser/dashboard", icon: Users },
    { name: "Activity Log", href: "/superuser/activity", icon: Activity },
    { name: "My Profile", href: "/superuser/profile", icon: Settings },
    { name: "Manager Tools", href: "/dhow-manager/dashboard", icon: Anchor },
]

export default function SuperuserNav() {
    const { data: session } = useSession()
    const pathname = usePathname()
    const user = session?.user

    return (
        <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Link href="/superuser/dashboard" className="flex items-center gap-3">
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
                            Admin Portal
                        </span>
                    </div>
                </Link>

                <div className="flex items-center gap-4 sm:pl-6 sm:border-l border-gray-100 order-2 sm:order-3">
                    <div className="hidden sm:flex flex-col text-right">
                        <p className="text-xs font-semibold text-gray-900 leading-none truncate max-w-[150px]">
                            {user?.name || user?.email}
                        </p>
                        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mt-1">Admin</p>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest border border-red-100 px-3 py-1.5 rounded bg-red-50/50"
                    >
                        Logout
                    </button>
                </div>

                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto order-3 sm:order-2 sm:ml-auto">
                    {links.map(({ name, href, icon: Icon }) => {
                        const isActive = pathname === href
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
                                    isActive ? "bg-primary/10 text-primary" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {name}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}
