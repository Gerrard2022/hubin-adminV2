'use client';

import { useState, useEffect } from 'react';
import { 
  Table, 
  Typography, 
  Card, 
  Modal, 
  message, 
  Button, 
  Form, 
  Input, 
  Upload, 
  Image as AntImage 
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { supabase } from "@/lib/supabase";
import MainLayout from "@/components/layout/MainLayout";
import { UploadChangeParam } from 'antd/es/upload';
import { createFeaturedLocation, deleteFeaturedLocation, fetchFeaturedLocations } from './actions';


const { Text, Title } = Typography;

interface FeaturedLocation {
  Id: number;
  CreatedAt: string;
  Title: string;
  SubTitle: string;
  Image: string;
  Address?: string;
  Latitude?: number;
  Longitude?: number;
}

export default function FeaturedLocations() {
  const [locations, setLocations] = useState<FeaturedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingLocation, setEditingLocation] = useState<FeaturedLocation | null>(null);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await fetchFeaturedLocations();
      setLocations(data);
    } catch (error) {
      message.error('Failed to load featured locations');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (info: UploadChangeParam) => {
    const file = info.file.originFileObj;
    if (file) {
      setImageFile(file);
    }
  };

  const handleDeleteLocation = async (id: number) => {
    try {
      setLoading(true);
      await deleteFeaturedLocation(id);
      setLocations(prev => prev.filter(loc => loc.Id !== id));
      message.success('Location deleted');
    } catch (error) {
      message.error('Failed to delete location');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'Image',
      key: 'image',
      width: '20%',
      render: (imagePath: string) => {
        let imageUrl = imagePath;
        if (!/^https?:\/\//.test(imagePath)) {
          const { data } = supabase.storage.from('featured-locations').getPublicUrl(imagePath);
          imageUrl = data.publicUrl;
        }
        return (
          <AntImage
            src={imageUrl}
            alt="Location"
            style={{ 
              width: 100, 
              height: 100, 
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
        );
      },
    },
    {
      title: 'Title',
      dataIndex: 'Title',
      key: 'title',
      width: '30%',
      render: (text: string) => (
        <Text strong>{text}</Text>
      ),
    },
    {
      title: 'Subtitle',
      dataIndex: 'SubTitle',
      key: 'subtitle',
      width: '30%',
    },
    {
      title: 'Created At',
      dataIndex: 'CreatedAt',
      key: 'createdAt',
      width: '20%',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '20%',
      render: (_: any, record: FeaturedLocation) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="link" onClick={() => setEditingLocation(record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDeleteLocation(record.Id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="p-6">
        <Card 
          bodyStyle={{ padding: "0px" }}
          extra={
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setModalVisible(true)}
              className="m-4"
            >
              Add New Location
            </Button>
          }
        >
          <div className="p-6 border-b">
            <Title level={4} style={{ margin: 0 }}>
              Featured Locations
            </Title>
          </div>
          <Table
            columns={columns}
            dataSource={locations}
            rowKey="Id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} locations`,
            }}
            scroll={{ x: 1200 }}
            style={{ minWidth: '800px' }}
          />
        </Card>

        <Modal
          title="Add New Featured Location"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateLocation}
          >
            <Form.Item
              name="Title"
              label="Title"
              rules={[{ required: true, message: 'Please input the location title!' }]}
            >
              <Input placeholder="Enter location title" />
            </Form.Item>

            <Form.Item
              name="SubTitle"
              label="Subtitle"
              rules={[{ required: true, message: 'Please input the location subtitle!' }]}
            >
              <Input placeholder="Enter location subtitle" />
            </Form.Item>

            <Form.Item
              name="Image"
              label="Location Image"
              rules={[{ required: true, message: 'Please upload an image!' }]}
            >
              <Upload
                name="image"
                listType="picture-card"
                className="image-uploader"
                showUploadList={{ showPreviewIcon: false, showRemoveIcon: true }}
                onChange={handleImageUpload}
                beforeUpload={() => false} 
                maxCount={1}
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="button"
                block
                loading={loading}
                disabled={loading}
                onClick={async () => {
                  console.log('Create Featured Location button clicked');
                  try {
                    const values = await form.validateFields();
                    if (!imageFile) {
                      message.error('Please upload an image');
                      return;
                    }
                    setLoading(true);
                    const fileExt = imageFile.name.split('.').pop();
                    const fileName = `${Date.now()}.${fileExt}`;
                    const filePath = `${fileName}`;
                    console.log('Create button pressed. Data to send:', {
                      Title: values.Title,
                      SubTitle: values.SubTitle,
                      Image: filePath,
                    });
                    const { error: uploadError } = await supabase.storage
                      .from('featured-locations')
                      .upload(filePath, imageFile);
                    if (uploadError) {
                      console.error('Upload error:', uploadError);
                      message.error(`Failed to upload image: ${uploadError.message}`);
                      setLoading(false);
                      return;
                    }
                    const newLocation = await createFeaturedLocation({
                      Title: values.Title,
                      SubTitle: values.SubTitle,
                      Image: filePath,
                    });
                    if (newLocation) {
                      setLocations(prevLocations => [newLocation, ...prevLocations]);
                      message.success('Featured location created successfully');
                      setModalVisible(false);
                      form.resetFields();
                      setImageFile(null);
                    }
                  } catch (error) {
                    // Validation failed or unexpected error
                    if (error && error.message) {
                      message.error(error.message);
                    }
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {loading ? 'Creating...' : 'Create Featured Location'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
}