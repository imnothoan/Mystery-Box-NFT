'use client';

import { Button, Card, Typography } from 'antd';
import { RocketOutlined, GiftOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { motion } from 'framer-motion';

const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center py-20 bg-gradient-to-b from-white to-blue-50 rounded-3xl shadow-sm border border-blue-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Title level={1} className="!text-6xl !mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Unlock Your Destiny
          </Title>
          <Paragraph className="text-xl text-gray-500 max-w-2xl mx-auto mb-8">
            Experience the thrill of the blockchain Gacha. Collect rare NFTs, trade on the marketplace, and prove your luck on the Ethereum network.
          </Paragraph>
          <div className="flex gap-4 justify-center">
            <Link href="/shop">
              <Button type="primary" size="large" icon={<RocketOutlined />} className="h-12 px-8 text-lg rounded-full">
                Get Started
              </Button>
            </Link>
            <Link href="/faucet">
              <Button size="large" icon={<GiftOutlined />} className="h-12 px-8 text-lg rounded-full">
                Claim Free Tokens
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          icon={<GiftOutlined className="text-4xl text-blue-500" />}
          title="Provably Fair"
          description="Powered by Chainlink VRF, ensuring every spin is truly random and verifiable on-chain."
        />
        <FeatureCard
          icon={<SafetyCertificateOutlined className="text-4xl text-purple-500" />}
          title="True Ownership"
          description="Your items are ERC-721 NFTs. You own them completely and can trade them instantly."
        />
        <FeatureCard
          icon={<RocketOutlined className="text-4xl text-green-500" />}
          title="Instant Trading"
          description="List your items on our marketplace or any other NFT platform. Liquidity at your fingertips."
        />
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-4 bg-gray-50 rounded-full mb-2">
            {icon}
          </div>
          <Title level={3} className="!mb-0">{title}</Title>
          <Paragraph className="text-gray-500">
            {description}
          </Paragraph>
        </div>
      </Card>
    </motion.div>
  );
}
