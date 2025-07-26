'use client';

import { Card } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface ChartData {
  timeText: string;
  value: number;
  state: 'Rides' | 'Revenue';
}

export const RideChart = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const { data: rides, error } = await supabase
        .from('Rides')
        .select('CreatedAt, FarePrice')
        .order('CreatedAt', { ascending: true });

      if (error) throw error;

      const monthlyData = (rides || []).reduce((acc: Record<string, { rides: number, revenue: number }>, ride) => {
        const month = new Date(ride.CreatedAt).toLocaleString('default', {
          month: 'short',
        });
        if (!acc[month]) {
          acc[month] = { rides: 0, revenue: 0 };
        }
        acc[month].rides += 1;
        acc[month].revenue += Number(ride.FarePrice) || 0;
        return acc;
      }, {});

      const allMonths = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];

      const rideData = allMonths.map(month => ({
        timeText: month,
        value: monthlyData[month]?.rides || 0,
        state: 'Rides' as const,
      }));

      const revenueData = allMonths.map(month => ({
        timeText: month,
        value: monthlyData[month]?.revenue || 0,
        state: 'Revenue' as const,
      }));

      setData([...rideData, ...revenueData]);
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = Array.from(new Set(data.map(d => d.timeText))).map(month => {
    const rides = data.find(d => d.timeText === month && d.state === 'Rides')?.value || 0;
    const revenue = data.find(d => d.timeText === month && d.state === 'Revenue')?.value || 0;
    return { month, Rides: rides, Revenue: revenue };
  });

  return (
    <Card className="h-full">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-primary" />
        <span className="font-semibold text-base">Rides and Revenue</span>
      </div>
      <div className="w-full h-[325px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRides" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" tickCount={4} tickFormatter={v => v > 1000 ? `${(v/1000).toFixed(1)}k RWF` : `${v} RWF`} />
            <Tooltip formatter={(value: number, name: string) => name === 'Revenue' ? `${Number(value).toLocaleString()} RWF` : `${value} Rides`} />
            <Legend verticalAlign="top" height={36} />
            <Area type="monotone" dataKey="Rides" stackId="1" stroke="#6366f1" fill="url(#colorRides)" />
            <Area type="monotone" dataKey="Revenue" stackId="1" stroke="#22c55e" fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10"><span className="text-gray-500">Loading...</span></div>}
    </Card>
  );
};

export default RideChart; 