'use client';

import { Button, Card, Typography, message, Modal } from 'antd';
import { ShoppingCartOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useContract } from '@/hooks/useContract';
import { useWeb3 } from '@/hooks/useWeb3';
import { ethers } from 'ethers';
import { ipfsToHttp } from '@/utils/ipfs';

const { Title, Paragraph } = Typography;

export default function ShopPage() {
    const [buying, setBuying] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState<{ rarity: string; image: string } | null>(null);

    const { mysteryToken, gachaMachine, mysteryItem } = useContract();
    const { account } = useWeb3();

    useEffect(() => {
        if (gachaMachine) {
            const handleGachaResult = (user: string, rarity: string, tokenId: bigint) => {
                if (user.toLowerCase() === account?.toLowerCase()) {
                    setBuying(false);
                    setResult({
                        rarity,
                        image: `/images/${rarity.toLowerCase()}.png` // In real app, fetch metadata from tokenId
                    });
                    setShowResult(true);
                    message.success(`You won a ${rarity} item!`);
                }
            };

            gachaMachine.on('GachaResult', handleGachaResult);

            return () => {
                gachaMachine.off('GachaResult', handleGachaResult);
            };
        }
    }, [gachaMachine, account]);

    const handleBuy = async () => {
        if (!mysteryToken || !gachaMachine || !account) return message.error("Wallet not connected");

        setBuying(true);
        try {
            // 1. Check Allowance
            const price = ethers.parseEther("10");
            const allowance = await mysteryToken.allowance(account, await gachaMachine.getAddress());

            if (allowance < price) {
                message.info("Approving tokens...");
                const txApprove = await mysteryToken.approve(await gachaMachine.getAddress(), price);
                await txApprove.wait();
                message.success("Approved!");
            }

            // 2. Spin
            message.info("Spinning the Gacha...");
            const txSpin = await gachaMachine.spin();
            await txSpin.wait();
            message.success("Transaction sent! Waiting for result...");

            // Result handled by event listener
        } catch (error: any) {
            console.error(error);
            setBuying(false);
            message.error(error.reason || "Transaction failed");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Card
                    className="w-full max-w-lg text-center shadow-2xl border-purple-100 rounded-3xl overflow-hidden"
                    cover={
                        <div className="h-64 bg-gradient-to-b from-purple-600 to-indigo-900 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="text-9xl"
                            >
                                🎁
                            </motion.div>
                        </div>
                    }
                >
                    <div className="p-4">
                        <Title level={2}>Mystery Box</Title>
                        <Paragraph className="text-gray-500 text-lg">
                            Contains a random NFT with varying rarity.
                        </Paragraph>

                        <div className="grid grid-cols-2 gap-4 mb-8 text-left bg-gray-50 p-4 rounded-xl">
                            <RarityBadge color="bg-gray-400" label="Common" chance="50%" />
                            <RarityBadge color="bg-blue-500" label="Rare" chance="30%" />
                            <RarityBadge color="bg-purple-500" label="Epic" chance="15%" />
                            <RarityBadge color="bg-yellow-500" label="Legendary" chance="5%" />
                        </div>

                        <div className="flex items-center justify-between mb-6 px-4">
                            <span className="text-gray-500">Price</span>
                            <span className="text-2xl font-bold text-blue-600">10 MST</span>
                        </div>

                        <Button
                            type="primary"
                            size="large"
                            loading={buying}
                            onClick={handleBuy}
                            disabled={!account}
                            icon={<ShoppingCartOutlined />}
                            className="w-full h-14 text-xl rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 border-none hover:opacity-90 shadow-lg shadow-blue-200"
                        >
                            {buying ? 'Opening...' : (account ? 'Buy Now' : 'Connect Wallet')}
                        </Button>
                    </div>
                </Card>
            </motion.div>

            <Modal
                open={showResult}
                footer={null}
                onCancel={() => setShowResult(false)}
                centered
                className="text-center"
            >
                <div className="flex flex-col items-center py-8">
                    <Title level={3} className="!mb-8">You got a {result?.rarity} Item!</Title>
                    <div className="text-9xl mb-8 animate-bounce">
                        {result?.rarity === 'Legendary' ? '👑' : result?.rarity === 'Epic' ? '⚔️' : result?.rarity === 'Rare' ? '💎' : '🗿'}
                    </div>
                    <Button type="primary" size="large" onClick={() => setShowResult(false)}>
                        Awesome!
                    </Button>
                </div>
            </Modal>
        </div>
    );
}

function RarityBadge({ color, label, chance }: { color: string, label: string, chance: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`}></div>
            <span className="font-medium">{label}</span>
            <span className="text-gray-400 text-sm ml-auto">{chance}</span>
        </div>
    );
}
