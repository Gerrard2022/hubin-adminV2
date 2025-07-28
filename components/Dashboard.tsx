'use client';

import { useEffect, useState } from 'react';
import { Car, User, DollarSign } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import DashboardTotalCountCard from '@/components/dashboard/DashboardTotalCountCard';
import RecentRides from '@/components/dashboard/RecentRides';
import RideChart from '@/components/dashboard/RideChart';
import FeatureFlags from '@/components/dashboard/FeatureFlags';

interface DashboardStats {
  totalRides: number;
  totalDrivers: number;
  totalRevenue: number;
  rideGrowth: number;
  driverGrowth: number;
  revenueGrowth: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRides: 0,
    totalDrivers: 0,
    totalRevenue: 0,
    rideGrowth: 0,
    driverGrowth: 0,
    revenueGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSkeleton = () => (
    <div className="flex flex-col gap-6 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow animate-pulse h-64" />
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow animate-pulse h-64" />
      </div>
      <div className="bg-white p-6 rounded-lg shadow animate-pulse h-40 lg:w-1/2" />
    </div>
  );

  if (loading) {
    return <MainLayout>{renderSkeleton()}</MainLayout>;
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <DashboardTotalCountCard
            title="Total Rides"
            total={stats.totalRides}
            icon={<Car size={24} color="#1890ff" />}
            colors={{ bg: '#e6f7ff', text: '#1890ff', icon: '#1890ff' }}
            percentage={stats.rideGrowth}
          />
          <DashboardTotalCountCard
            title="Total Drivers"
            total={stats.totalDrivers}
            icon={<User size={24} color="#52c41a" />}
            colors={{ bg: '#f6ffed', text: '#52c41a', icon: '#52c41a' }}
            percentage={stats.driverGrowth}
          />
          <DashboardTotalCountCard
            title="Total Revenue"
            total={stats.totalRevenue}
            icon={<DollarSign size={24} color="#722ed1" />}
            colors={{ bg: '#f9f0ff', text: '#722ed1', icon: '#722ed1' }}
            percentage={stats.revenueGrowth}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Ride Overview</h2>
            <RideChart />
          </div>
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Rides</h2>
            <RecentRides />
          </div>
        </div>

        <div className="bg-white mt-6 p-6 rounded-lg shadow w-full lg:w-1/2">
          <h2 className="text-xl font-semibold mb-4">Feature Flags</h2>
          <FeatureFlags />
        </div>
      </div>
    </MainLayout>
  );
}
