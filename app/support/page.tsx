'use client';

import { useState, useEffect } from 'react';
import { Table, Typography, Card, Modal, message, Button, Tag, Select } from 'antd';
import { supabase } from "@/lib/supabase";
import MainLayout from "@/components/layout/MainLayout";
import { EyeOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const { Option } = Select;

interface SupportRequest {
  Id: number;
  CreatedAt: string;
  Message: string;
  ContactInfo: string;
  Status: string;
  Subject: string;
  UserId: string;
}

export default function SupportRequests() {
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchSupportRequests();
  }, []);

  const fetchSupportRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('SupportRequests')
        .select('*')
        .eq('Status', 'pending')
        .order('CreatedAt', { ascending: false });

      if (error) throw error;

      setSupportRequests(data || []);
    } catch (error) {
      console.error('Error fetching support requests:', error);
      message.error('Failed to load support requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId: number, newStatus: string) => {
    try {
      setSupportRequests(currentRequests => 
        currentRequests.filter(request => request.Id !== requestId)
      );

      const { error } = await supabase
        .from('SupportRequests')
        .update({ Status: newStatus })
        .eq('Id', requestId);

      if (error) {
        fetchSupportRequests();
        throw error;
      }

      message.success(`Support request marked as ${newStatus}`);
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating support request status:', error);
      message.error('Failed to update support request status');
    }
  };

  const showRequestDetails = (request: SupportRequest) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Subject',
      dataIndex: 'Subject',
      key: 'subject',
      width: '25%',
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
      title: 'Contact Info',
      dataIndex: 'ContactInfo',
      key: 'contactInfo',
      width: '20%',
      ellipsis: true,
    },
    {
      title: 'Created At',
      dataIndex: 'CreatedAt',
      key: 'createdAt',
      width: '20%',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Status',
      dataIndex: 'Status',
      key: 'status',
      width: '15%',
      align: 'center' as const,
      render: (status: string) => (
        <Tag color="warning">{status}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '10%',
      align: 'center' as const,
      render: (_: any, record: SupportRequest) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => showRequestDetails(record)}
        >
          Edit
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
              Pending Support Requests
            </Title>
          </div>
          <Table
            columns={columns}
            dataSource={supportRequests}
            rowKey="Id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} pending requests`,
            }}
            scroll={{ x: 1000 }}
            style={{ minWidth: '800px' }}
          />
        </Card>

        <Modal
          title="Support Request Details"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setModalVisible(false)}>
              Close
            </Button>
          ]}
          width={600}
        >
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text type="secondary">Subject</Text>
                  <div className="font-medium">{selectedRequest.Subject}</div>
                </div>
                <div>
                  <Text type="secondary">Contact Info</Text>
                  <div className="font-medium">{selectedRequest.ContactInfo}</div>
                </div>
                <div className="col-span-2">
                  <Text type="secondary">Message</Text>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    {selectedRequest.Message}
                  </div>
                </div>
                <div>
                  <Text type="secondary">Created At</Text>
                  <div className="font-medium">
                    {new Date(selectedRequest.CreatedAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <Text type="secondary">Update Status</Text>
                  <div>
                    <Select
                      style={{ width: '100%' }}
                      placeholder="Change Status"
                      value={selectedRequest.Status} 
                      onChange={(value) => handleStatusChange(selectedRequest.Id, value)}
                    >
                      <Option value="answered">Answered</Option>
                      <Option value="pending">Pending</Option>
                    </Select>
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