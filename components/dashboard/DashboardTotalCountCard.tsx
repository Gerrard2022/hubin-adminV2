'use client';

import { Card, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface DashboardTotalCountCardProps {
  title: string;
  total: number;
  icon: React.ReactNode;
  colors: {
    bg: string;
    text: string;
    icon: string;
  };
  percentage?: number;
}

export default function DashboardTotalCountCard({
  title,
  total,
  icon,
  colors,
  percentage
}: DashboardTotalCountCardProps) {
  return (
    <Card 
      className="hover:shadow-md transition-shadow"
      bodyStyle={{ padding: '24px' }}
    >
      <div className="flex justify-between items-start">
        <div>
          <Text className="text-gray-600 text-sm">{title}</Text>
          <Title level={3} style={{ margin: '8px 0' }}>
            {total.toLocaleString()}
          </Title>
          {percentage !== undefined && (
            <div className="flex items-center gap-1">
              {percentage >= 0 ? (
                <ArrowUpOutlined className="text-green-500" />
              ) : (
                <ArrowDownOutlined className="text-red-500" />
              )}
              <Text 
                className={percentage >= 0 ? 'text-green-500' : 'text-red-500'}
              >
                {Math.abs(percentage)}%
              </Text>
              <Text className="text-gray-500">vs last month</Text>
            </div>
          )}
        </div>
        <div 
          className="p-3 rounded-full"
          style={{ backgroundColor: colors.bg }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
} 