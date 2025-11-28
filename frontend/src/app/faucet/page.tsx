'use client';

import { Button, Card, Typography, Statistic, message } from 'antd';
import { GiftOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { motion } from 'framer-motion';

const { Title, Paragraph } = Typography;
const { Countdown } = Statistic;

export default function FaucetPage() {
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState<number | null>(null);

    const handleClaim = async () => {
        setLoading(true);
        // Simulate API call / Contract interaction
        setTimeout(() => {
            setLoading(false);
            setCooldown(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
            message.success('Successfully claimed 100 MST!');
        }, 2000);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="w-full max-w-md text-center shadow-xl border-blue-100 rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-8 -mx-6 -mt-6 mb-6">
                        <GiftOutlined className="text-6xl text-white mb-4" />
                        <Title level={2} className="!text-white !mb-0">Mystery Faucet</Title>
                        <Paragraph className="text-blue-100 mb-0">Claim free MST tokens daily</Paragraph>
                    </div>

                    <div className="py-4">
                        <div className="mb-8">
                            <Statistic title="Claimable Amount" value={100} suffix="MST" valueStyle={{ color: '#1890ff', fontWeight: 'bold' }} />
                        </div>

                        {cooldown ? (
                            <div className="flex flex-col items-center gap-2 text-gray-500">
                                <ClockCircleOutlined className="text-2xl" />
                                <span>Next claim available in:</span>
                                <Countdown value={cooldown} format="HH:mm:ss" onFinish={() => setCooldown(null)} />
                            </div>
                        ) : (
                            <Button
                                type="primary"
                                size="large"
                                loading={loading}
                                onClick={handleClaim}
                                className="w-full h-12 text-lg rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 border-none hover:opacity-90"
                            >
                                Claim Tokens
                            </Button>
                        )}
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
