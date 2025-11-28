// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MysteryToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant FAUCET_AMOUNT = 100 * 10**18;
    uint256 public constant FAUCET_COOLDOWN = 1 days;

    mapping(address => uint256) public lastFaucetAccess;

    event FaucetUsed(address indexed user, uint256 amount);

    constructor() ERC20("MysteryToken", "MST") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10**18); // Initial supply for owner
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function faucet() external {
        require(
            block.timestamp >= lastFaucetAccess[msg.sender] + FAUCET_COOLDOWN,
            "Faucet: Cooldown active"
        );
        
        lastFaucetAccess[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        
        emit FaucetUsed(msg.sender, FAUCET_AMOUNT);
    }
}
