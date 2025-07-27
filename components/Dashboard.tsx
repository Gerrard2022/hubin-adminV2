'use client';

import { useEffect, useState } from 'react';
import { Car, User, DollarSign } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import DashboardTotalCountCard from '@/components/dashboard/DashboardTotalCountCard';
import RecentRides from '@/components/dashboard/RecentRides';
import RideChart from '@/components/dashboard/RideChart';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRides: 0,
    totalDrivers: 0,
    totalRevenue: 0,
    rideGrowth: 0,
    driverGrowth: 0,
    revenueGrowth: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const firstDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

      const { data: currentRides } = await supabase
        .from('Rides')
        .select('FarePrice')
        .gte('CreatedAt', firstDayOfMonth.toISOString());

      const { data: lastMonthRides } = await supabase
        .from('Rides')
        .select('FarePrice')
        .gte('CreatedAt', firstDayOfLastMonth.toISOString())
        .lt('CreatedAt', firstDayOfMonth.toISOString());

      const { count: currentDrivers } = await supabase
        .from('Driver')
        .select('*', { count: 'exact' });

      const { count: lastMonthDrivers } = await supabase
        .from('Driver')
        .select('*', { count: 'exact' })
        .lt('CreatedAt', firstDayOfMonth.toISOString());
      
      const rideGrowth = lastMonthRides?.length 
        ? ((currentRides?.length || 0) - lastMonthRides.length) / lastMonthRides.length * 100 
        : 0;

      const driverGrowth = lastMonthDrivers 
        ? ((currentDrivers || 0) - lastMonthDrivers) / lastMonthDrivers * 100 
        : 0;

      const currentRevenue = currentRides?.reduce((sum, ride) => sum + (ride.FarePrice || 0), 0) || 0;
      const lastMonthRevenue = lastMonthRides?.reduce((sum, ride) => sum + (ride.FarePrice || 0), 0) || 0;
      const revenueGrowth = lastMonthRevenue 
        ? (currentRevenue - lastMonthRevenue) / lastMonthRevenue * 100 
        : 0;

      setStats({
        totalRides: currentRides?.length || 0,
        totalDrivers: currentDrivers || 0,
        totalRevenue: currentRevenue,
        rideGrowth,
        driverGrowth,
        revenueGrowth,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  return (
    <MainLayout>
      <div className="h-screen flex flex-col p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
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
          <div className="lg:col-span-2">
            <RideChart />
          </div>
          <div className="lg:col-span-1">
            <RecentRides />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
