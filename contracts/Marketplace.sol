// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Marketplace is ReentrancyGuard, Ownable {
    IERC20 public mysteryToken;
    IERC721 public mysteryItem;

    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }

    mapping(uint256 => Listing) public listings;

    event ItemListed(address indexed seller, uint256 indexed tokenId, uint256 price);
    event ItemSold(address indexed seller, address indexed buyer, uint256 indexed tokenId, uint256 price);
    event ListingCancelled(address indexed seller, uint256 indexed tokenId);

    constructor(address _mysteryToken, address _mysteryItem) Ownable(msg.sender) {
        mysteryToken = IERC20(_mysteryToken);
        mysteryItem = IERC721(_mysteryItem);
    }

    function listItem(uint256 tokenId, uint256 price) external nonReentrant {
        require(price > 0, "Price must be greater than zero");
        require(mysteryItem.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(mysteryItem.isApprovedForAll(msg.sender, address(this)) || mysteryItem.getApproved(tokenId) == address(this), "Marketplace not approved");

        listings[tokenId] = Listing(msg.sender, price, true);
        
        emit ItemListed(msg.sender, tokenId, price);
    }

    function buyItem(uint256 tokenId) external nonReentrant {
        Listing memory listing = listings[tokenId];
        require(listing.active, "Item not for sale");
        require(mysteryToken.balanceOf(msg.sender) >= listing.price, "Insufficient funds");
        require(mysteryToken.allowance(msg.sender, address(this)) >= listing.price, "Insufficient allowance");

        // Update state before transfer to prevent reentrancy (though ReentrancyGuard handles this)
        listings[tokenId].active = false;

        // Transfer Token from Buyer to Seller
        mysteryToken.transferFrom(msg.sender, listing.seller, listing.price);

        // Transfer NFT from Seller to Buyer
        // Note: The seller must have approved the marketplace to move the NFT
        // But since the NFT is in the seller's wallet, we use transferFrom
        mysteryItem.safeTransferFrom(listing.seller, msg.sender, tokenId);

        emit ItemSold(listing.seller, msg.sender, tokenId, listing.price);
    }

    function cancelListing(uint256 tokenId) external nonReentrant {
        require(listings[tokenId].seller == msg.sender, "Not the seller");
        require(listings[tokenId].active, "Not listed");

        listings[tokenId].active = false;
        emit ListingCancelled(msg.sender, tokenId);
    }
}
