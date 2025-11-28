// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MysteryItem is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    address public gachaMachine;

    event GachaMachineUpdated(address indexed newGachaMachine);
    event ItemMinted(address indexed to, uint256 indexed tokenId, string uri);

    constructor() ERC721("MysteryItem", "MITM") Ownable(msg.sender) {}

    modifier onlyGacha() {
        require(msg.sender == gachaMachine, "Caller is not the GachaMachine");
        _;
    }

    function setGachaMachine(address _gachaMachine) external onlyOwner {
        gachaMachine = _gachaMachine;
        emit GachaMachineUpdated(_gachaMachine);
    }

    function mint(address to, string memory uri) external onlyGacha returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        emit ItemMinted(to, tokenId, uri);
        
        return tokenId;
    }
}
