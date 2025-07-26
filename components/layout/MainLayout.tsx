'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Car,
  Copy,
  Bell,
  LayoutDashboard,
  User as UserIcon,
  TreePalm,
} from 'lucide-react';
import { UserButton, SignedIn, useUser } from "@clerk/nextjs";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();

  const menuItems = [
    {
      key: '/',
      icon: <LayoutDashboard size={20} />,
      label: 'Dashboard',
      href: '/',
    },
    {
      key: '/support',
      icon: <Users size={20} />,
      label: 'Support Requests',
      href: '/support',
    },
    {
      key: '/drivers',
      icon: <UserIcon size={20} />,
      label: 'Drivers',
      href: '/drivers',
    },
    {
      key: '/rides',
      icon: <Car size={20} />,
      label: 'Rides',
      href: '/rides',
    },
    {
      key: '/insurances',
      icon: <Copy size={20} />,
      label: 'Insurances',
      href: '/insurances',
    },
    {
      key: '/featured',
      icon: <TreePalm size={20} />,
      label: 'Featured Locations',
      href: '/featured',
    },
    {
      key: '/notifications',
      icon: <Bell size={20} />,
      label: 'Notifications',
      href: '/notifications',
    },
  ];

  return (
    <SignedIn>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        {/* Sidebar + Main Content Group */}
        <div className="flex gap-6 w-full max-w-7xl items-stretch">
          {/* Sidebar */}
          <aside className="w-64 bg-white border rounded-xl shadow flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center space-x-2 px-4 py-4">
                <div className="relative w-8 h-8">
                  <Image
                    src="/logo.jpg"
                    alt="Hubin Logo"
                    fill
                    className="object-contain rounded-full"
                  />
                </div>
                <span className="font-bold text-black">
                  HUBIN ADMIN
                </span>
              </div>
              <nav className="mt-4">
                <ul className="flex flex-col">
                  {menuItems.map((item) => (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors rounded-r-lg mb-1 ${pathname === item.key ? 'bg-gray-200 font-semibold' : ''}`}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <div className="p-4 border-t">
              <div className="flex items-center space-x-2">
                <UserButton afterSignOutUrl="/sign-in" />
                <span className="text-sm">{user?.firstName}</span>
              </div>
            </div>
          </aside>
          {/* Main Content */}
          <main className="flex-1 m-0 p-6 bg-white rounded-xl shadow h-full flex flex-col">
            {children}
          </main>
        </div>
      </div>
    </SignedIn>
  );
}