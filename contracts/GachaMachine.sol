// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MysteryItem.sol";

contract GachaMachine is VRFConsumerBaseV2, Ownable {
    VRFCoordinatorV2Interface COORDINATOR;
    IERC20 public mysteryToken;
    MysteryItem public mysteryItem;

    // Chainlink VRF Variables
    uint64 s_subscriptionId;
    bytes32 keyHash;
    uint32 callbackGasLimit = 200000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;

    uint256 public gachaPrice = 10 * 10**18; // 10 MST per spin

    // Rarity Probabilities (out of 100)
    // Common: 0-49 (50%)
    // Rare: 50-79 (30%)
    // Epic: 80-94 (15%)
    // Legendary: 95-99 (5%)
    
    struct RequestStatus {
        bool fulfilled;
        bool exists;
        address requester;
    }
    mapping(uint256 => RequestStatus) public s_requests;

    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);
    event GachaResult(address indexed user, string rarity, uint256 tokenId);

    constructor(
        uint64 subscriptionId,
        address vrfCoordinator,
        bytes32 _keyHash,
        address _mysteryToken,
        address _mysteryItem
    ) VRFConsumerBaseV2(vrfCoordinator) Ownable(msg.sender) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subscriptionId;
        keyHash = _keyHash;
        mysteryToken = IERC20(_mysteryToken);
        mysteryItem = MysteryItem(_mysteryItem);
    }

    function spin() external returns (uint256 requestId) {
        require(mysteryToken.balanceOf(msg.sender) >= gachaPrice, "Insufficient MST balance");
        require(mysteryToken.allowance(msg.sender, address(this)) >= gachaPrice, "Insufficient allowance");

        // Burn the tokens (or transfer to treasury)
        // Assuming MysteryToken is burnable, we can transfer to 0x0 or burn if we cast to Burnable
        // For now, let's just transfer to this contract (revenue)
        mysteryToken.transferFrom(msg.sender, address(this), gachaPrice);

        // Request Randomness
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        
        s_requests[requestId] = RequestStatus({
            fulfilled: false,
            exists: true,
            requester: msg.sender
        });
        
        emit RequestSent(requestId, numWords);
        return requestId;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        require(s_requests[_requestId].exists, "Request not found");
        s_requests[_requestId].fulfilled = true;
        
        address user = s_requests[_requestId].requester;
        uint256 randomValue = _randomWords[0] % 100;
        
        string memory rarity;
        string memory uri;

        if (randomValue < 50) {
            rarity = "Common";
            uri = "ipfs://QmCommonHash"; 
        } else if (randomValue < 80) {
            rarity = "Rare";
            uri = "ipfs://QmRareHash";
        } else if (randomValue < 95) {
            rarity = "Epic";
            uri = "ipfs://QmEpicHash";
        } else {
            rarity = "Legendary";
            uri = "ipfs://QmLegendaryHash";
        }

        uint256 tokenId = mysteryItem.mint(user, uri);
        
        emit RequestFulfilled(_requestId, _randomWords);
        emit GachaResult(user, rarity, tokenId);
    }

    function setGachaPrice(uint256 _price) external onlyOwner {
        gachaPrice = _price;
    }
}
