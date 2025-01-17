'use client'

import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import MainLayout from "@/components/layout/MainLayout";
import Image from 'next/image';
import { Modal, Button, Form, Input, Select, Upload, Table, message } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

interface Organization {
  id: string;
  name: string;
  owner: string;
  type: string;
  created_at: string;
  image?: string;
  totalRevenue?: number;
}

export default function Organizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrganizationsWithRevenue();
  }, []);

  const fetchOrganizationsWithRevenue = async () => {
    try {
      setLoading(true);
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });
  
      if (orgError) throw orgError;
  
      if (orgData) {
        const { data: rideData, error: rideError } = await supabase
          .from('rides')
          .select('organization, fare_price');
  
        if (rideError) throw rideError;
  
        const revenueMap = rideData?.reduce((acc, ride) => {
          if (ride.organization && ride.fare_price) {
            acc[ride.organization] = (acc[ride.organization] || 0) + ride.fare_price;
          }
          return acc;
        }, {} as Record<string, number>);
  
        const organizationsWithRevenue = orgData.map(org => ({
          ...org,
          totalRevenue: revenueMap[org.id]
            ? (revenueMap[org.id] * 0.05).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : '0.00',
        }));
  
        setOrganizations(organizationsWithRevenue);
      }
    } catch (error) {
      console.error('Error fetching organizations or revenue:', error);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      let imageUrl = '';

      if (fileList[0]?.originFileObj) {
        const file = fileList[0].originFileObj;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('organizations')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('organizations')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const { error } = await supabase.from('organizations').insert([{
        name: values.name,
        owner: values.owner,
        type: values.type,
        image: imageUrl || null
      }]);

      if (error) throw error;

      message.success('Organization created successfully');
      handleModalClose();
      fetchOrganizationsWithRevenue();
    } catch (error) {
      console.error('Error creating organization:', error);
      message.error('Failed to create organization');
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    form.resetFields();
    setFileList([]);
  };

  const columns = [
    {
      title: 'Image',
      key: 'image',
      render: (record: Organization) => (
        record.image ? (
          <div className="w-12 h-12 relative">
            <Image
              src={record.image}
              alt={record.name}
              fill
              className="rounded-full object-cover"
            />
          </div>
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs text-gray-500">No Image</span>
          </div>
        )
      )
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      key: 'owner',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Revenue',
      key: 'revenue',
      render: (record: Organization) => `RWF ${record.totalRevenue}`
    },
    {
      title: 'Created',
      key: 'created_at',
      render: (record: Organization) => new Date(record.created_at).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Organization) => (
        <span>
          <Button type="link" onClick={() => console.log('Edit')}>Edit</Button>
          <Button type="link" danger onClick={() => console.log('Delete')}>Delete</Button>
        </span>
      )
    }
  ];

  return (
    <MainLayout>
      <div className="p-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Organizations</h1>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalOpen(true)}
            >
              Create Organization
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={organizations}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </div>

        <Modal
          title="Create Organization"
          open={modalOpen}
          onCancel={handleModalClose}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="image"
              label="Organization Image"
            >
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                beforeUpload={() => false}
                maxCount={1}
              >
                {fileList.length === 0 && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <Form.Item
              label="Organization Name"
              name="name"
              rules={[{ required: true, message: 'Please input organization name!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Owner Name"
              name="owner"
              rules={[{ required: true, message: 'Please input owner name!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Organization Type"
              name="type"
              rules={[{ required: true, message: 'Please select organization type!' }]}
              initialValue="business"
            >
              <Select>
                <Select.Option value="business">Business</Select.Option>
                <Select.Option value="nonprofit">Non-Profit</Select.Option>
                <Select.Option value="government">Government</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item className="flex justify-end space-x-2">
              <Button onClick={handleModalClose}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Create Organization
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
}