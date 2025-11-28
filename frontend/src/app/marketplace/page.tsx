'use client';

import { Card, Typography, Button, Tag, Input, Select } from 'antd';
import { ShoppingCartOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { motion } from 'framer-motion';

const { Title } = Typography;
const { Search } = Input;

// Mock Data
const MOCK_LISTINGS = [
    { id: 101, name: 'Golden Crown', rarity: 'Legendary', price: 500, seller: '0x12...3456', image: '👑' },
    { id: 102, name: 'Silver Dagger', rarity: 'Rare', price: 50, seller: '0xAB...CDEF', image: '🗡️' },
    { id: 103, name: 'Magic Potion', rarity: 'Epic', price: 150, seller: '0x98...7654', image: '🧪' },
    { id: 104, name: 'Old Map', rarity: 'Common', price: 10, seller: '0x11...2233', image: '🗺️' },
];

export default function MarketplacePage() {
    const [listings, setListings] = useState(MOCK_LISTINGS);

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
                                        <Button type="primary" shape="round" icon={<ShoppingCartOutlined />}>
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
                                            <span className="text-xs text-gray-400">Seller: {item.seller}</span>
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
