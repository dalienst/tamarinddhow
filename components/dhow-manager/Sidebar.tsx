"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  UserPlus, 
  DollarSign, 
  FileSpreadsheet, 
  Ship, 
  QrCode,
  HelpCircle,
  X,
  List
} from 'lucide-react';
import Image from 'next/image';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dhow-manager/dashboard', icon: Home },
    { name: 'Sailing Calendar', href: '/dhow-manager/schedules', icon: Calendar },
    { name: 'Sailing List', href: '/dhow-manager/schedules/list', icon: List },
    { name: 'Walk-In Booking', href: '/dhow-manager/walk-in', icon: UserPlus },
    { name: 'Finance & Escrow', href: '/dhow-manager/finance', icon: DollarSign },
    { name: 'Reports', href: '/dhow-manager/reports', icon: FileSpreadsheet },
    { name: 'Vessels', href: '/dhow-manager/vessels', icon: Ship },
    { name: 'Scanner', href: '/dhow-manager/scanner', icon: QrCode },
    { name: 'Help Guide', href: '/dhow-manager/help', icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
            <Link href="/dhow-manager/dashboard" className="flex items-center gap-3">
              <Image src="/smallLogo.jpg" alt="Logo" width={32} height={32} className="rounded" />
              <span className="font-bold text-gray-900 tracking-tight">Tamarind Dhow</span>
            </Link>
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = item.href === '/dhow-manager/schedules' 
                ? pathname === item.href 
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all
                    ${isActive 
                      ? 'bg-amber-50 text-amber-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-amber-600' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            <p className="text-xs text-center text-gray-400 font-medium">
              &copy; {new Date().getFullYear()} Tamarind
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
