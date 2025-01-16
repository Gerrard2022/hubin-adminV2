'use client';

import { useState, useEffect } from 'react';
import { Table, Typography, Card } from 'antd';
import { supabase } from "@/lib/supabase";
import MainLayout from "@/components/layout/MainLayout";

const { Text, Title } = Typography;

interface Ride {
  ride_id: string;
  destination_address: string;
  origin_address: string;
  created_at: string;
  fare_price: number;
  is_completed: boolean;
  payment_status: string;
  driver_id: string;
  organization: string | null;
  driver?: {
    legalname: string;
    phonenumber: string;
  };
}

interface Organization {
  id: string;
  name: string;
}

export default function Rides() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [organizations, setOrganizations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRides();
    fetchOrganizations();
  }, []);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const { data: fetchedRides, error } = await supabase
        .from('rides')
        .select(`
          *,
          driver:driver_id (
            legalname,
            phonenumber
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (fetchedRides) setRides(fetchedRides);
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const { data: fetchedOrganizations, error } = await supabase
        .from('organizations')
        .select('id, name');

      if (error) throw error;
      if (fetchedOrganizations) {
        const organizationMap: Record<string, string> = {};
        fetchedOrganizations.forEach((org: Organization) => {
          organizationMap[org.id] = org.name;
        });
        setOrganizations(organizationMap);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const columns = [
    {
      title: 'Driver',
      dataIndex: ['driver', 'legalname'],
      key: 'driver',
      render: (text: string) => <Text>{text || 'N/A'}</Text>,
    },
    {
      title: 'Phone Number',
      dataIndex: ['driver', 'phonenumber'],
      key: 'phone',
      render: (text: string) => <Text>{text || 'N/A'}</Text>,
    },
    {
      title: 'From',
      dataIndex: 'origin_address',
      key: 'origin',
      width: '15%',
    },
    {
      title: 'To',
      dataIndex: 'destination_address',
      key: 'destination',
      width: '15%',
    },
    {
      title: 'Organization',
      dataIndex: 'organization',
      key: 'organization',
      render: (orgId: string) =>
        organizations[orgId] ? (
          <Text>{organizations[orgId]}</Text>
        ) : (
          <Text style={{ fontStyle: 'italic', color: '#ccc' }}>None</Text>
        ),
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'date',
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Amount',
      dataIndex: 'fare_price',
      key: 'fare',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Status',
      dataIndex: 'is_completed',
      key: 'status',
      width: '100px',
      align: 'center' as const,
      render: (status: boolean) => (
        <div className="flex justify-center">
          <Text
            className={`px-3 py-1 rounded-full text-center min-w-[90px] ${
              status 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}
          >
            {status ? 'Completed' : 'Pending'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Payment',
      dataIndex: 'payment_status',
      key: 'payment',
      width: '100px',
      align: 'center' as const,
      render: (status: string) => (
        <div className="flex justify-center">
          <Text
            className={`px-3 py-1 rounded-full text-center min-w-[90px] ${
              status === 'paid'
                ? 'bg-green-100 text-green-800'
                : 'bg-orange-100 text-orange-800'
            }`}
          >
            {status === 'paid' ? 'Paid' : 'Not Paid'}
          </Text>
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="p-6">
        <Card bodyStyle={{ padding: "0px" }}>
          <div className="p-6 border-b">
            <Title level={4} style={{ margin: 0 }}>
              Rides List
            </Title>
          </div>
          <Table
            columns={columns}
            dataSource={rides}
            rowKey="ride_id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} rides`,
            }}
            scroll={{ x: true }}
          />
        </Card>
      </div>
    </MainLayout>
  );
}
