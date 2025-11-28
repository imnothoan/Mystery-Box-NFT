'use client';

import { Button, Card, Typography, Statistic, message } from 'antd';
import { GiftOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useContract } from '@/hooks/useContract';
import { useWeb3 } from '@/hooks/useWeb3';
import { ethers } from 'ethers';

const { Title, Paragraph } = Typography;
const { Countdown } = Statistic;

export default function FaucetPage() {
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState<number | null>(null);
    const { mysteryToken } = useContract();
    const { account } = useWeb3();

    useEffect(() => {
        if (mysteryToken && account) {
            checkCooldown();
        }
    }, [mysteryToken, account]);

    const checkCooldown = async () => {
        try {
            const lastAccess = await mysteryToken?.lastFaucetAccess(account);
            const cooldownTime = 24 * 60 * 60; // 1 day in seconds
            const nextAccess = Number(lastAccess) + cooldownTime;
            const now = Math.floor(Date.now() / 1000);

            if (nextAccess > now) {
                setCooldown(nextAccess * 1000);
            }
        } catch (error) {
            console.error("Error checking cooldown:", error);
        }
    };

    const handleClaim = async () => {
        if (!mysteryToken) return message.error("Contract not loaded");

        setLoading(true);
        try {
            const tx = await mysteryToken.faucet();
            await tx.wait();
            message.success('Successfully claimed 100 MST!');
            checkCooldown();
        } catch (error: any) {
            console.error(error);
            if (error.reason) {
                message.error(error.reason);
            } else {
                message.error('Failed to claim tokens');
            }
        } finally {
            setLoading(false);
        }
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
                                disabled={!account}
                                className="w-full h-12 text-lg rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 border-none hover:opacity-90"
                            >
                                {account ? 'Claim Tokens' : 'Connect Wallet First'}
                            </Button>
                        )}
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
