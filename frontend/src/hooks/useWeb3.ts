'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

export function useWeb3() {
    const [account, setAccount] = useState<string | null>(null);
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);

    const connectWallet = useCallback(async () => {
        if (typeof (window as any).ethereum !== 'undefined') {
            try {
                const _provider = new ethers.BrowserProvider((window as any).ethereum);
                const _signer = await _provider.getSigner();
                const _account = await _signer.getAddress();
                const _network = await _provider.getNetwork();
                const chainId = Number(_network.chainId);

                // Check Network (Sepolia = 11155111, Localhost = 31337)
                // For this demo, we'll warn if not on Localhost or Sepolia
                if (chainId !== 31337 && chainId !== 11155111) {
                    alert("Please switch to Sepolia or Localhost!");
                    try {
                        await (window as any).ethereum.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: '0xaa36a7' }], // Sepolia
                        });
                    } catch (switchError: any) {
                        // This error code indicates that the chain has not been added to MetaMask.
                        if (switchError.code === 4902) {
                            console.log("This network is not available in your metamask, please add it");
                        }
                    }
                }

                setProvider(_provider);
                setSigner(_signer);
                setAccount(_account);
                setChainId(chainId);
            } catch (error) {
                console.error("Failed to connect wallet:", error);
            }
        } else {
            console.error("MetaMask not installed");
        }
    }, []);

    useEffect(() => {
        if (typeof (window as any).ethereum !== 'undefined') {
            // Listen for account changes
            (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    connectWallet(); // Re-init signer
                } else {
                    setAccount(null);
                    setSigner(null);
                }
            });

            // Listen for chain changes
            (window as any).ethereum.on('chainChanged', () => {
                window.location.reload();
            });

            // Check if already connected
            (window as any).ethereum.request({ method: 'eth_accounts' })
                .then((accounts: string[]) => {
                    if (accounts.length > 0) {
                        connectWallet();
                    }
                });
        }
    }, [connectWallet]);

    return { account, provider, signer, chainId, connectWallet };
}
