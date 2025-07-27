'use client';

import Image from 'next/image';
import { UserButton, SignedIn, useUser } from "@clerk/nextjs";
import { Navbar } from '../Navbar';
import { useState } from 'react';
import { TopNav } from '../TopNav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <SignedIn>
      <div className="min-h-screen bg-gray-100">
      <TopNav />
        <aside 
          className={`fixed left-2 top-20 bottom-4 ${isHovered ? 'w-64' : 'w-16'} bg-white border rounded-xl shadow flex flex-col justify-between transition-all duration-300 ease-in-out overflow-hidden z-50`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div>
            <div className='w-full'>
              <Navbar isExpanded={isHovered} />
            </div>
          </div>
        </aside>
        
        <div className="flex justify-center">
          <main className={`${isHovered ? 'ml-80' : 'ml-24'} mr-6 mt-20 mb-6 p-6 bg-white rounded-xl shadow flex-1 max-w-6xl transition-all duration-300 ease-in-out`}>
            {children}
          </main>
        </div>
      </div>
    </SignedIn>
  );
}