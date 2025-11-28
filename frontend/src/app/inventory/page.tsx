'use client';

import { Card, Typography, Empty, Tag, Button, message, Modal, Input } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useContract } from '@/hooks/useContract';
import { useWeb3 } from '@/hooks/useWeb3';
import { ethers } from 'ethers';

const { Title, Paragraph } = Typography;

export default function InventoryPage() {
        </div >
    );
}

function RarityTag({ rarity }: { rarity: string }) {
    let color = 'default';
    if (rarity === 'Legendary') color = 'gold';
    if (rarity === 'Epic') color = 'purple';
    if (rarity === 'Rare') color = 'blue';

    return <Tag color={color}>{rarity}</Tag>;
}
