'use client';

import { Table, Card, Typography, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const { Title } = Typography;

interface RecentRide {
  ride_id: string;
  fare_price: number;
  created_at: string;
  payment_status: string;
}

export default function RecentRides() {
  const [rides, setRides] = useState<RecentRide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentRides();
  }, []);

  const fetchRecentRides = async () => {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select('ride_id, fare_price, created_at, payment_status')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      if (data) setRides(data);
    } catch (error) {
      console.error('Error fetching recent rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      currencyDisplay: 'code'
    }).format(amount)
    .replace('RWF', 'RWF')
    .trim();
  };

  const columns = [
    {
      title: 'Amount',
      dataIndex: 'fare_price',
      key: 'amount',
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Status',
      dataIndex: 'payment_status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'paid' ? 'success' : 'warning'}>
          {status === 'paid' ? 'Paid' : 'Not Paid'}
        </Tag>
      ),
    },
  ];

  return (
    <Card>
      <Title level={5} className="mb-4">Recent Rides</Title>
      <Table
        columns={columns}
        dataSource={rides}
        rowKey="ride_id"
        loading={loading}
        pagination={false}
        size="small"
      />
    </Card>
  );
} 