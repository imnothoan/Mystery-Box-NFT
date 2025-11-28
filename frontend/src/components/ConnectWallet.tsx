'use client';

import { Button, message } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function ConnectWallet() {
    const [account, setAccount] = useState<string | null>(null);
    const [balance, setBalance] = useState<string>('0');

    const connectWallet = async () => {
        if (typeof (window as any).ethereum !== 'undefined') {
            try {
                const provider = new ethers.BrowserProvider((window as any).ethereum);
                const signer = await provider.getSigner();
                const address = await signer.getAddress();
                const bal = await provider.getBalance(address);

                setAccount(address);
                setBalance(ethers.formatEther(bal));
                message.success('Wallet connected successfully!');
            } catch (error) {
                console.error(error);
                message.error('Failed to connect wallet');
            }
        } else {
            message.warning('Please install MetaMask!');
        }
    };

    useEffect(() => {
        // Check if already connected
        if (typeof (window as any).ethereum !== 'undefined') {
            (window as any).ethereum.request({ method: 'eth_accounts' })
                .then((accounts: string[]) => {
                    if (accounts.length > 0) {
                        connectWallet();
                    }
                });
        }
    }, []);

    if (account) {
        return (
            <div className="flex items-center gap-4 bg-white py-2 px-4 rounded-full shadow-sm border border-gray-100">
                <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-400">Balance</span>
                    <span className="font-bold text-blue-600">{parseFloat(balance).toFixed(4)} ETH</span>
                </div>
                <div className="h-8 w-[1px] bg-gray-200"></div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-gray-700">
                        {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <Button
            type="primary"
            icon={<WalletOutlined />}
            size="large"
            className="rounded-full"
            onClick={connectWallet}
        >
            Connect Wallet
        </Button>
    );
}
