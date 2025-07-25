'use client';

import { useState, useEffect } from 'react';
import { Table, Typography, Card, Modal, message, Button, Tag, Image } from 'antd';
import { supabase } from "@/lib/supabase";
import MainLayout from "@/components/layout/MainLayout";
import { EyeOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface DriverInsurance {
  Id: string;
  CreatedAt: string;
  DriverId: string;
  UpdatedOn: string | null;
  InsuranceDocument: string | null;
  PolicyNo: string | null;
  InceptionDate: string | null;
  ExpiryDate: string | null;
  MarkType: string | null;
  Chassis: string | null;
  Psv: string | null;
  Usage: string | null;
  Insurer: string | null;
  DriverName?: string;
}

export default function DriverInsurances() {
  const [insurances, setInsurances] = useState<DriverInsurance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsurance, setSelectedInsurance] = useState<DriverInsurance | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchDriverInsurances();
  }, []);

  const fetchDriverInsurances = async () => {
    try {
      setLoading(true);
      
      const { data: insurancesData, error: insurancesError } = await supabase
        .from('DriverInsurance')
        .select(`
          *,
          Driver!inner(LegalName)
        `)
        .order('CreatedAt', { ascending: false });

      if (insurancesError) throw insurancesError;

      const insurancesWithDriverName = insurancesData?.map(insurance => ({
        ...insurance,
        DriverName: insurance.Driver?.LegalName || 'Unknown Driver'
      })) || [];

      setInsurances(insurancesWithDriverName);
    } catch (error) {
      console.error('Error fetching driver insurances:', error);
      message.error('Failed to load driver insurances');
    } finally {
      setLoading(false);
    }
  };

  const showInsuranceDetails = (insurance: DriverInsurance) => {
    setSelectedInsurance(insurance);
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Driver Name',
      dataIndex: 'DriverName',
      key: 'driverName',
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
      title: 'Policy Number',
      dataIndex: 'PolicyNo',
      key: 'policyNo',
      width: '15%',
      ellipsis: true,
    },
    {
      title: 'Insurer',
      dataIndex: 'Insurer',
      key: 'insurer',
      width: '15%',
      ellipsis: true,
      render: (text: string) => (
        <Tag color="blue">{text}</Tag>
      ),
    },
    {
      title: 'Mark Type',
      dataIndex: 'MarkType',
      key: 'markType',
      width: '12%',
      align: 'center' as const,
      render: (text: string) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: 'Inception Date',
      dataIndex: 'InceptionDate',
      key: 'inceptionDate',
      width: '12%',
      align: 'center' as const,
      render: (date: string) => (
        <Text>{new Date(date).toLocaleDateString()}</Text>
      ),
    },
    {
      title: 'Expiry Date',
      dataIndex: 'ExpiryDate',
      key: 'expiryDate',
      width: '12%',
      align: 'center' as const,
      render: (date: string) => (
        <Text style={{ color: new Date(date) < new Date() ? 'red' : 'inherit' }}>
          {new Date(date).toLocaleDateString()}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '10%',
      align: 'center' as const,
      render: (_: any, record: DriverInsurance) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => showInsuranceDetails(record)}
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
              Driver Insurances
            </Title>
          </div>
          <Table
            columns={columns}
            dataSource={insurances}
            rowKey="Id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} insurances`,
            }}
            scroll={{ x: 1200 }}
            style={{ minWidth: '800px' }}
          />
        </Card>

        <Modal
          title="Insurance Details"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setModalVisible(false)}>
              Close
            </Button>
          ]}
          width={800}
        >
          {selectedInsurance && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text type="secondary">Driver Name</Text>
                  <div className="font-medium">{selectedInsurance.DriverName}</div>
                </div>
                <div>
                  <Text type="secondary">Policy Number</Text>
                  <div className="font-medium">{selectedInsurance.PolicyNo}</div>
                </div>
                <div>
                  <Text type="secondary">Insurer</Text>
                  <div>
                    <Tag color="blue">{selectedInsurance.Insurer}</Tag>
                  </div>
                </div>
                <div>
                  <Text type="secondary">Mark Type</Text>
                  <div>
                    <Tag color="purple">{selectedInsurance.MarkType}</Tag>
                  </div>
                </div>
                <div>
                  <Text type="secondary">Chassis</Text>
                  <div className="font-medium">{selectedInsurance.Chassis || 'N/A'}</div>
                </div>
                <div>
                  <Text type="secondary">PSV</Text>
                  <div className="font-medium">{selectedInsurance.Psv || 'N/A'}</div>
                </div>
                <div>
                  <Text type="secondary">Usage</Text>
                  <div className="font-medium">{selectedInsurance.Usage || 'N/A'}</div>
                </div>
                <div>
                  <Text type="secondary">Inception Date</Text>
                  <div className="font-medium">
                    {selectedInsurance.InceptionDate 
                      ? new Date(selectedInsurance.InceptionDate).toLocaleDateString() 
                      : 'N/A'}
                  </div>
                </div>
                <div>
                  <Text type="secondary">Expiry Date</Text>
                  <div className="font-medium" style={{ 
                    color: selectedInsurance.ExpiryDate && new Date(selectedInsurance.ExpiryDate) < new Date() 
                      ? 'red' 
                      : 'inherit' 
                  }}>
                    {selectedInsurance.ExpiryDate 
                      ? new Date(selectedInsurance.ExpiryDate).toLocaleDateString() 
                      : 'N/A'}
                  </div>
                </div>
                <div className="col-span-2">
                  <Text type="secondary" className="block mb-2">Insurance Document</Text>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    {selectedInsurance.InsuranceDocument ? (
                      <Image
                        src={selectedInsurance.InsuranceDocument}
                        alt="Insurance Document"
                        className="rounded-lg"
                        style={{ maxHeight: '200px', objectFit: 'contain' }}
                      />
                    ) : (
                      <div className="text-gray-500 italic">No document uploaded</div>
                    )}
                  </div>
                </div>
                <div>
                  <Text type="secondary">Created At</Text>
                  <div className="font-medium">
                    {new Date(selectedInsurance.CreatedAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <Text type="secondary">Last Updated</Text>
                  <div className="font-medium">
                    {selectedInsurance.UpdatedOn 
                      ? new Date(selectedInsurance.UpdatedOn).toLocaleDateString() 
                      : 'N/A'}
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