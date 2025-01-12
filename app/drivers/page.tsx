'use client';

import { useState, useEffect } from 'react';
import { Table, Typography, Card, Switch, Modal, message, Button, Tag } from 'antd';
import { supabase } from "@/lib/supabase";
import MainLayout from "@/components/layout/MainLayout";
import { EyeOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface Driver {
  id: string;
  legalname: string;
  phonenumber: string;
  email: string;
  approved: boolean;
  created_at: string;
  vehicle: string;
  plate: string;
  total_rides?: number;
}

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      // First get all drivers
      const { data: driversData, error: driversError } = await supabase
        .from('driver')
        .select('*')
        .order('created_at', { ascending: false });

      if (driversError) throw driversError;

      // Then get ride counts for each driver
      if (driversData) {
        const driversWithCounts = await Promise.all(
          driversData.map(async (driver) => {
            const { count } = await supabase
              .from('rides')
              .select('*', { count: 'exact' })
              .eq('driver_id', driver.id);

            return {
              ...driver,
              total_rides: count || 0
            };
          })
        );

        setDrivers(driversWithCounts);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      message.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalChange = async (driverId: string, newStatus: boolean) => {
    try {
      // Optimistically update the UI
      setDrivers(currentDrivers => 
        currentDrivers.map(driver => 
          driver.id === driverId 
            ? { ...driver, approved: newStatus }
            : driver
        )
      );

      const { error } = await supabase
        .from('driver')
        .update({ 
          approved: newStatus,
        })
        .eq('id', driverId)
        .select();

      if (error) {
        // Revert the optimistic update if there's an error
        setDrivers(currentDrivers => 
          currentDrivers.map(driver => 
            driver.id === driverId 
              ? { ...driver, approved: !newStatus }
              : driver
          )
        );
        throw error;
      }

      message.success(`Driver ${newStatus ? 'approved' : 'unapproved'} successfully`);
      
      // No need to fetch all drivers again, we already updated the state
      // Only fetch if you need to sync with other data
      // await fetchDrivers();
    } catch (error) {
      console.error('Error updating driver status:', error);
      message.error('Failed to update driver status');
    }
  };

  const showDriverDetails = (driver: Driver) => {
    setSelectedDriver(driver);
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'legalname',
      key: 'name',
      width: '20%',
      ellipsis: true,
      render: (text: string) => (
        <Text
          strong
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {text}
        </Text>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phonenumber',
      key: 'phone',
      width: '15%',
      ellipsis: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '20%',
      ellipsis: true,
      render: (text: string) => (
        <Text
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {text}
        </Text>
      ),
    },
    {
      title: 'Car Type',
      dataIndex: 'vehicle',
      key: 'vehicle',
      width: '12%',
      align: 'center' as const,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Car Number',
      dataIndex: 'plate',
      key: 'plate',
      width: '12%',
      align: 'center' as const,
      render: (text: string) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: 'Total Rides',
      dataIndex: 'total_rides',
      key: 'total_rides',
      width: '10%',
      align: 'center' as const,
      render: (count: number) => <Tag color="green">{count}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'approved',
      key: 'status',
      width: '12%',
      align: 'center' as const,
      render: (approved: boolean, record: Driver) => (
        <Switch
          checked={approved}
          onChange={(checked) => handleApprovalChange(record.id, checked)}
          checkedChildren="Approved"
          unCheckedChildren="Not Approved"
          style={{ width: 100 }}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '10%',
      align: 'center' as const,
      render: (_: any, record: Driver) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => showDriverDetails(record)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="p-6">
        <Card bodyStyle={{ padding: "0px" }}>
          <div className="p-6 border-b">
            <Title level={4} style={{ margin: 0 }}>
              Drivers List
            </Title>
          </div>
          <Table
            columns={columns}
            dataSource={drivers}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} drivers`,
            }}
            scroll={{ x: 1200 }}
            style={{ minWidth: '800px' }}
          />
        </Card>

        <Modal
          title="Driver Details"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setModalVisible(false)}>
              Close
            </Button>
          ]}
          width={600}
        >
          {selectedDriver && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text type="secondary">Name</Text>
                  <div className="font-medium">{selectedDriver.legalname}</div>
                </div>
                <div>
                  <Text type="secondary">Phone</Text>
                  <div className="font-medium">{selectedDriver.phonenumber}</div>
                </div>
                <div>
                  <Text type="secondary">Email</Text>
                  <div className="font-medium">{selectedDriver.email}</div>
                </div>
                <div>
                  <Text type="secondary">Car Type</Text>
                  <div>
                    <Tag color="blue">{selectedDriver.vehicle}</Tag>
                  </div>
                </div>
                <div>
                  <Text type="secondary">Car Number</Text>
                  <div>
                    <Tag color="purple">{selectedDriver.plate}</Tag>
                  </div>
                </div>
                <div>
                  <Text type="secondary">Total Rides</Text>
                  <div>
                    <Tag color="green">{selectedDriver.total_rides}</Tag>
                  </div>
                </div>
                <div>
                  <Text type="secondary">Status</Text>
                  <div>
                    <Switch
                      checked={selectedDriver.approved}
                      onChange={(checked) => handleApprovalChange(selectedDriver.id, checked)}
                      checkedChildren="Approved"
                      unCheckedChildren="Not Approved"
                    />
                  </div>
                </div>
                <div>
                  <Text type="secondary">Joined Date</Text>
                  <div className="font-medium">
                    {new Date(selectedDriver.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
}
