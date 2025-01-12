'use client';

import { Card, Typography } from 'antd';
import { Line } from '@ant-design/charts';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const { Title } = Typography;

interface ChartData {
  date: string;
  rides: number;
  revenue: number;
}

export default function RideChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: rides, error } = await supabase
        .from('rides')
        .select('created_at, fare_price')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;

      const dailyData = rides?.reduce((acc: Record<string, ChartData>, ride) => {
        const date = new Date(ride.created_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, rides: 0, revenue: 0 };
        }
        acc[date].rides += 1;
        acc[date].revenue += ride.fare_price;
        return acc;
      }, {});

      setData(Object.values(dailyData || {}).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ));
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const config = {
    data,
    loading,
    xField: 'date',
    yField: 'rides',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    tooltip: {
      formatter: (datum: ChartData) => {
        return {
          name: 'Rides',
          value: datum.rides,
          revenue: new Intl.NumberFormat('rw-RW', {
            style: 'currency',
            currency: 'RWF',
            minimumFractionDigits: 0,
          }).format(datum.revenue),
        };
      },
    },
  };

  return (
    <Card>
      <Title level={5} className="mb-4">Ride Statistics</Title>
      <Line {...config} />
    </Card>
  );
} 