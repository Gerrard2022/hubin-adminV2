'use client';

import { useUser } from '@clerk/nextjs';
import Landing from '@/components/Landing';
import Dashboard from '@/components/Dashboard';

export default function LandingPage() {
  
  const { user } = useUser();

  if(!user){
    return (
      <Landing />
    )
  }

  return (
    <Dashboard />
  )
}
