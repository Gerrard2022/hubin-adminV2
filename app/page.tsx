'use client';

import { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import { CarOutlined, UserOutlined, DollarOutlined } from '@ant-design/icons';
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
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8}>
            <DashboardTotalCountCard
              title="Total Rides"
              total={stats.totalRides}
              icon={<CarOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
              colors={{ bg: '#e6f7ff', text: '#1890ff', icon: '#1890ff' }}
              percentage={stats.rideGrowth}
            />
          </Col>
          <Col xs={24} sm={8}>
            <DashboardTotalCountCard
              title="Total Drivers"
              total={stats.totalDrivers}
              icon={<UserOutlined style={{ fontSize: 24, color: '#52c41a' }} />}
              colors={{ bg: '#f6ffed', text: '#52c41a', icon: '#52c41a' }}
              percentage={stats.driverGrowth}
            />
          </Col>
          <Col xs={24} sm={8}>
            <DashboardTotalCountCard
              title="Total Revenue"
              total={stats.totalRevenue}
              icon={<DollarOutlined style={{ fontSize: 24, color: '#722ed1' }} />}
              colors={{ bg: '#f9f0ff', text: '#722ed1', icon: '#722ed1' }}
              percentage={stats.revenueGrowth}
            />
          </Col>
          <Col xs={24} lg={16}>
            <RideChart />
          </Col>
          <Col xs={24} lg={8}>
            <RecentRides />
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
}
