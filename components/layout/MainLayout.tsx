'use client';

import { Layout, Menu } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  DashboardOutlined,
  UserOutlined,
  CarOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { UserButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";

const { Header, Sider, Content } = Layout;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();

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
      key: '/insurances',
      icon: <CopyOutlined />,
      label: <Link href="/insurances">Insurances</Link>,
    },
  ];

  return (
    <SignedIn>
      <Layout className="min-h-screen">
        <Sider theme="light">
          <div className="flex items-center space-x-2 px-4 py-4">
            <div className="relative w-8 h-8">
              <Image
                src="/logo.jpg"
                alt="Hubin Logo"
                fill
                className="object-contain rounded-full"
              />
            </div>
            <span className="font-bold text-black">
              HUBIN ADMIN
            </span>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[pathname]}
            items={menuItems}
          />
          <div className="absolute bottom-0 left-0 w-full p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserButton afterSignOutUrl="/sign-in" />
                <span className="text-sm">{user?.firstName}</span>
              </div>
            </div>
          </div>
        </Sider>
        <Layout>
          <Content className="m-4 p-6 bg-white">
            {children}
          </Content>
        </Layout>
      </Layout>
    </SignedIn>
  );
}