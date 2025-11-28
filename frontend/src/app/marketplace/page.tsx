'use client';

import { Card, Typography, Button, Tag, Input, Select, message } from 'antd';
import { ShoppingCartOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useContract } from '@/hooks/useContract';
import { useWeb3 } from '@/hooks/useWeb3';
import { ethers } from 'ethers';

const { Title } = Typography;
const { Search } = Input;

export default function MarketplacePage() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { marketplace, mysteryToken, mysteryItem } = useContract();
    const { account } = useWeb3();

    useEffect(() => {
        if (marketplace) {
            fetchListings();
        }
    }, [marketplace]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            // Fetch ItemListed events
            const filter = marketplace!.filters.ItemListed();
            const events = await marketplace!.queryFilter(filter);

            const activeListings = [];
            for (const event of events) {
                const { seller, tokenId, price } = (event as any).args;

                // Check if still active (simple check, ideally query contract mapping)
                const listing = await marketplace!.listings(tokenId);
                if (listing.active) {
                    // Fetch Metadata (Mock for now)
                    const uri = await mysteryItem!.tokenURI(tokenId);
                    let rarity = 'Common';
                    if (uri.includes('Rare')) rarity = 'Rare';
                    if (uri.includes('Epic')) rarity = 'Epic';
                    if (uri.includes('Legendary')) rarity = 'Legendary';

                    activeListings.push({
                        id: tokenId.toString(),
                        name: `Mystery Item #${tokenId}`,
                        rarity,
                        price: ethers.formatEther(price),
                        seller: seller,
                        image: rarity === 'Legendary' ? '👑' : rarity === 'Epic' ? '⚔️' : rarity === 'Rare' ? '💎' : '🗿'
                    });
                }
            }
            setListings(activeListings);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (item: any) => {
        if (!marketplace || !mysteryToken || !account) return message.error("Connect wallet");

        try {
            const priceWei = ethers.parseEther(item.price);

            // Check Allowance
            const allowance = await mysteryToken.allowance(account, await marketplace.getAddress());
            if (allowance < priceWei) {
                message.info("Approving tokens...");
                const txApprove = await mysteryToken.approve(await marketplace.getAddress(), priceWei);
                await txApprove.wait();
            }

            // Buy Item
            message.info("Buying item...");
            const txBuy = await marketplace.buyItem(item.id);
            await txBuy.wait();

            message.success("Item purchased!");
            fetchListings(); // Refresh
        } catch (error: any) {
            console.error(error);
            message.error(error.reason || "Failed to buy item");
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <Title level={2} className="!mb-0">Marketplace</Title>
                <div className="flex gap-4 w-full md:w-auto">
                    <Search placeholder="Search items..." style={{ width: 200 }} />
                    <Select
                        defaultValue="all"
                        style={{ width: 120 }}
                        options={[
                            { value: 'all', label: 'All Rarity' },
                            { value: 'legendary', label: 'Legendary' },
                            { value: 'epic', label: 'Epic' },
                            { value: 'rare', label: 'Rare' },
                            { value: 'common', label: 'Common' },
                        ]}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">Loading marketplace...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {listings.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card
                                hoverable
                                cover={
                                    <div className="h-48 bg-gray-50 flex items-center justify-center text-6xl relative group">
                                        {item.image}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button type="primary" shape="round" icon={<ShoppingCartOutlined />} onClick={() => handleBuy(item)}>
                                                Buy Now
                                            </Button>
                                        </div>
                                    </div>
                                }
                            >
                                <Card.Meta
                                    title={
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="truncate">{item.name}</span>
                                            <RarityTag rarity={item.rarity} />
                                        </div>
                                    }
                                    description={
                                        <div className="flex flex-col gap-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-400">Seller: {item.seller.slice(0, 6)}...{item.seller.slice(-4)}</span>
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-lg font-bold text-blue-600">{item.price} MST</span>
                                            </div>
                                        </div>
                                    }
                                />
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

function RarityTag({ rarity }: { rarity: string }) {
    let color = 'default';
    if (rarity === 'Legendary') color = 'gold';
    if (rarity === 'Epic') color = 'purple';
    if (rarity === 'Rare') color = 'blue';

    return <Tag color={color}>{rarity}</Tag>;
}
