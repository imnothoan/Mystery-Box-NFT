'use client';

import { Card, Typography, Empty, Tag, Button } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { motion } from 'framer-motion';

const { Title, Paragraph } = Typography;

// Mock Data
const MOCK_ITEMS = [
    { id: 1, name: 'Ancient Sword', rarity: 'Rare', image: '⚔️' },
    { id: 2, name: 'Wooden Shield', rarity: 'Common', image: '🛡️' },
    { id: 3, name: 'Dragon Egg', rarity: 'Legendary', image: '🥚' },
];

export default function InventoryPage() {
    const [items, setItems] = useState(MOCK_ITEMS);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <Title level={2} className="!mb-0">My Inventory</Title>
                <div className="text-gray-500">
                    Total Items: <span className="font-bold text-black">{items.length}</span>
                </div>
            </div>

            {items.length === 0 ? (
                <Empty description="No items found" />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card
                                hoverable
                                cover={
                                    <div className="h-48 bg-gray-100 flex items-center justify-center text-6xl">
                                        {item.image}
                                    </div>
                                }
                                actions={[
                                    <Button key="sell" type="text" icon={<ShoppingOutlined />}>Sell</Button>
                                ]}
                            >
                                <Card.Meta
                                    title={
                                        <div className="flex justify-between items-center">
                                            <span>{item.name}</span>
                                            <RarityTag rarity={item.rarity} />
                                        </div>
                                    }
                                    description={`Token ID: #${item.id}`}
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
