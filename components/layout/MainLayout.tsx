'use client';

import { Layout, Menu } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  DashboardOutlined,
  UserOutlined,
  CarOutlined,
  DollarOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link href="/">Dashboard</Link>,
    },
    {
      key: '/drivers',
      icon: <UserOutlined />,
      label: <Link href="/drivers">Drivers</Link>,
    },
    {
      key: '/rides',
      icon: <CarOutlined />,
      label: <Link href="/rides">Rides</Link>,
    },
    {
      key: '/to-pay',
      icon: <DollarOutlined />,
      label: <Link href="/to-pay">To Pay</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light">
        <div style={{ height: 32, margin: 16, background: 'rgba(0, 0, 0, 0.2)' }} />
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }} />
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
} 