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
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { supabase } from "@/lib/supabase";
import MainLayout from "@/components/layout/MainLayout";
import { UploadChangeParam } from 'antd/es/upload';
import { log } from 'console';

const { Text, Title } = Typography;

interface FeaturedLocation {
  id: number;
  CreatedAt: string;
  Title: string;
  SubTitle: string;
  Image: string;
}

export default function FeaturedLocations() {
  const [locations, setLocations] = useState<FeaturedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchFeaturedLocations();
  }, []);

  const fetchFeaturedLocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('FeaturedLocations')
        .select('*')
        .order('CreatedAt', { ascending: false });

      if (error) throw error;

      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching featured locations:', error);
      message.error('Failed to load featured locations');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (info: UploadChangeParam) => {
    const file = info.file.originFileObj;
    console.log('Uploaded File:', file);
    if (file) {
      setImageFile(file);
    }
    console.log('Image File:', imageFile);
  };

  const handleCreateLocation = async (values: Partial<FeaturedLocation>) => {
    try {
      // Set loading to true
      setLoading(true);

      // Log form values and image file
      console.log('Form Values:', values);
      console.log('Image File:', imageFile);

      // Validate inputs
      if (!values.Title) {
        message.error('Title is required');
        return;
      }
      if (!values.SubTitle) {
        message.error('Subtitle is required');
        return;
      }
      if (!imageFile) {
        message.error('Please upload an image');
        return;
      }

      // Generate a unique filename
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('featured-locations')
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        message.error(`Failed to upload image: ${uploadError.message}`);
        return;
      }

      // Insert location data
      const { data, error } = await supabase
        .from('FeaturedLocations')
        .insert({
          Title: values.Title,
          SubTitle: values.SubTitle,
          Image: filePath
        })
        .select();

      if (error) {
        console.error('Database insertion error:', error);
        message.error(`Failed to create location: ${error.message}`);
        return;
      }

      // Update local state
      if (data) {
        setLocations(prevLocations => [data[0], ...prevLocations]);
        message.success('Featured location created successfully');
        setModalVisible(false);
        form.resetFields();
        setImageFile(null);
      }
    } catch (error) {
      console.error('Unexpected error creating featured location:', error);
      message.error('An unexpected error occurred');
    } finally {
      // Always set loading to false
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
        const { data } = supabase.storage.from('featured-locations').getPublicUrl(imagePath);
        return (
          <AntImage
            src={data.publicUrl}
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
            rowKey="id"
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
                showUploadList={true}
                onChange={handleImageUpload}
                beforeUpload={() => false} // Prevent auto upload
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
                htmlType="submit" 
                block
                loading={loading}
              >
                Create Featured Location
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
}