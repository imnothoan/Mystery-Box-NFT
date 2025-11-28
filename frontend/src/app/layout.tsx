import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, Layout, Menu, Button } from 'antd';
import Link from 'next/link';
import { WalletOutlined } from '@ant-design/icons';
import ConnectWallet from '@/components/ConnectWallet';
import './globals.css';

const { Header, Content, Footer } = Layout;

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#1890ff',
                borderRadius: 8,
                fontFamily: 'Inter, sans-serif',
              },
            }}
          >
            <Layout className="min-h-screen">
              <Header className="flex items-center justify-between bg-white shadow-sm px-8 sticky top-0 z-50">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  <Link href="/">MysteryBox</Link>
                </div>
                <Menu
                  mode="horizontal"
                  className="border-none flex-1 justify-center min-w-[400px]"
                  items={[
                    { key: 'home', label: <Link href="/">Home</Link> },
                    { key: 'shop', label: <Link href="/shop">Shop</Link> },
                    { key: 'inventory', label: <Link href="/inventory">Inventory</Link> },
                    { key: 'marketplace', label: <Link href="/marketplace">Marketplace</Link> },
                    { key: 'faucet', label: <Link href="/faucet">Faucet</Link> },
                  ]}
                />
                <ConnectWallet />
              </Header>
              <Content className="p-8 max-w-7xl mx-auto w-full">
                {children}
              </Content>
              <Footer className="text-center bg-gray-50 text-gray-500">
                Mystery Box DApp ©2024 Created by Elite Architect
              </Footer>
            </Layout>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
};

export default RootLayout;
