'use client';

import { Table, Card, Typography, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const { Title } = Typography;

interface RecentRide {
  RideId: string;
  FarePrice: number;
  CreatedAt: string;
  PaymentStatus: string;
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
        .from('Rides')
        .select('RideId, FarePrice, CreatedAt, PaymentStatus')
        .order('CreatedAt', { ascending: false })
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
      dataIndex: 'FarePrice',
      key: 'amount',
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Status',
      dataIndex: 'PaymentStatus',
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
        rowKey="RideId"
        loading={loading}
        pagination={false}
        size="small"
      />
    </Card>
  );
} 