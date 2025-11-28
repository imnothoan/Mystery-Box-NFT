'use client';

import { useWeb3 } from './useWeb3';
import { ethers } from 'ethers';
import { useMemo } from 'react';

// Import ABIs
import MysteryTokenABI from '../abis/contracts/MysteryToken.sol/MysteryToken.json';
import MysteryItemABI from '../abis/contracts/MysteryItem.sol/MysteryItem.json';
import GachaMachineABI from '../abis/contracts/GachaMachine.sol/GachaMachine.json';
import MarketplaceABI from '../abis/contracts/Marketplace.sol/Marketplace.json';

// Addresses (Should be in .env)
const MYSTERY_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_MYSTERY_TOKEN_ADDRESS || '';
const MYSTERY_ITEM_ADDRESS = process.env.NEXT_PUBLIC_MYSTERY_ITEM_ADDRESS || '';
const GACHA_MACHINE_ADDRESS = process.env.NEXT_PUBLIC_GACHA_MACHINE_ADDRESS || '';
const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || '';

export function useContract() {
    const { signer, provider } = useWeb3();

    const mysteryToken = useMemo(() => {
        if (!signer && !provider) return null;
        return new ethers.Contract(MYSTERY_TOKEN_ADDRESS, MysteryTokenABI.abi, signer || provider);
    }, [signer, provider]);

    const mysteryItem = useMemo(() => {
        if (!signer && !provider) return null;
        return new ethers.Contract(MYSTERY_ITEM_ADDRESS, MysteryItemABI.abi, signer || provider);
    }, [signer, provider]);

    const gachaMachine = useMemo(() => {
        if (!signer && !provider) return null;
        return new ethers.Contract(GACHA_MACHINE_ADDRESS, GachaMachineABI.abi, signer || provider);
    }, [signer, provider]);

    const marketplace = useMemo(() => {
        if (!signer && !provider) return null;
        return new ethers.Contract(MARKETPLACE_ADDRESS, MarketplaceABI.abi, signer || provider);
    }, [signer, provider]);

    return { mysteryToken, mysteryItem, gachaMachine, marketplace };
}
