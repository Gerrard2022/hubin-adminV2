'use client';

import { DollarOutlined } from "@ant-design/icons";
import { Area, AreaConfig } from "@ant-design/plots";
import { Card } from "antd";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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

      // Group rides by month
      const monthlyData = (rides || []).reduce((acc: Record<string, { rides: number, revenue: number }>, ride) => {
        const month = new Date(ride.CreatedAt).toLocaleString("default", {
          month: "short",
        });
        
        if (!acc[month]) {
          acc[month] = { rides: 0, revenue: 0 };
        }
        
        acc[month].rides += 1;
        acc[month].revenue += Number(ride.FarePrice) || 0;
        
        return acc;
      }, {});

      // Define all months to fill missing ones
      const allMonths = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];

      // Create ride data array
      const rideData = allMonths.map(month => ({
        timeText: month,
        value: monthlyData[month]?.rides || 0,
        state: "Rides"
      }));

      // Create revenue data array
      const revenueData = allMonths.map(month => ({
        timeText: month,
        value: monthlyData[month]?.revenue || 0,
        state: "Revenue"
      }));

      // Combine both datasets
      const combinedData = [...rideData, ...revenueData];
      console.log("Final Combined Data:", combinedData);
      setData(combinedData);
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const config: AreaConfig = {
    data,
    xField: "timeText",
    yField: "value",
    isStack: false,
    seriesField: "state",
    animation: true,
    startOnZero: false,
    smooth: true,
    legend: {
      offsetY: -6,
    },
    yAxis: {
      tickCount: 4,
      label: {
        formatter: (v: string) => {
          const value = parseFloat(v);
          if (!isNaN(value) && value > 1000) {
            return `$${value / 1000}k`;
          }
          return v;
        },
      },
    },
    tooltip: {
      formatter: (data: { state: string; value: number }) => {
        return {
          name: data.state,
          value:
            data.state === "Revenue"
              ? `$${Number(data.value) / 1000}k`
              : `${data.value} Rides`,
        };
      },
    },
  };

  return (
    <Card
      style={{
        height: "100%",
      }}
      headStyle={{
        padding: "8px 16px",
      }}
      bodyStyle={{
        padding: "24px 24px 0 24px",
      }}
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <DollarOutlined />
          <span style={{ marginLeft: "0.5rem", fontSize: "14px" }}>
            Rides and Revenue
          </span>
        </div>
      }
    >
      <Area {...config} height={325} loading={isLoading} />
    </Card>
  );
};

export default RideChart; 