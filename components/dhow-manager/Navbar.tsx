"use client";

import React from 'react';
import { Menu, LogOut, User as UserIcon } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface NavbarProps {
  setSidebarOpen: (isOpen: boolean) => void;
}

export default function Navbar({ setSidebarOpen }: NavbarProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-gray-800 hidden sm:block tracking-tight">Manager Portal</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
            <UserIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Manager Session</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}