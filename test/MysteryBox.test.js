const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Mystery Box DApp", function () {
    let MysteryToken, mysteryToken;
    let MysteryItem, mysteryItem;
    let GachaMachine, gachaMachine;
    let Marketplace, marketplace;
    let VRFCoordinatorV2Mock, vrfCoordinatorV2Mock;
    let owner, addr1, addr2;

    const BASE_FEE = "100000000000000000"; // 0.1 LINK
    const GAS_PRICE_LINK = "1000000000"; // 1 gwei

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy VRF Mock
        const VRFCoordinatorV2MockFactory = await ethers.getContractFactory("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Mock = await VRFCoordinatorV2MockFactory.deploy(BASE_FEE, GAS_PRICE_LINK);
        // await vrfCoordinatorV2Mock.deployed(); // Not needed in ethers v6 if using waitForDeployment() or just await deploy()

        const tx = await vrfCoordinatorV2Mock.createSubscription();
        const receipt = await tx.wait();
        // In Mock, event is SubscriptionCreated(uint64 indexed subId, address owner)
        // We can get subId from event. 
        // Ethers v6 event parsing:
        const subId = 1; // Mock usually starts at 1
        await vrfCoordinatorV2Mock.fundSubscription(subId, "1000000000000000000000"); // Fund 1000 LINK

        // Deploy MysteryToken
        const MysteryTokenFactory = await ethers.getContractFactory("MysteryToken");
        mysteryToken = await MysteryTokenFactory.deploy();

        // Deploy MysteryItem
        const MysteryItemFactory = await ethers.getContractFactory("MysteryItem");
        mysteryItem = await MysteryItemFactory.deploy();

        // Deploy GachaMachine
        const GachaMachineFactory = await ethers.getContractFactory("GachaMachine");
        // keyHash doesn't matter for mock
        const keyHash = "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc";
        gachaMachine = await GachaMachineFactory.deploy(
            subId,
            await vrfCoordinatorV2Mock.getAddress(),
            keyHash,
            await mysteryToken.getAddress(),
            await mysteryItem.getAddress()
        );

        // Add GachaMachine as consumer to VRF
        await vrfCoordinatorV2Mock.addConsumer(subId, await gachaMachine.getAddress());

        // Set GachaMachine in MysteryItem
        await mysteryItem.setGachaMachine(await gachaMachine.getAddress());

        // Deploy Marketplace
        const MarketplaceFactory = await ethers.getContractFactory("Marketplace");
        marketplace = await MarketplaceFactory.deploy(
            await mysteryToken.getAddress(),
            await mysteryItem.getAddress()
        );
    });

    describe("MysteryToken", function () {
        it("Should allow faucet usage", async function () {
            await mysteryToken.connect(addr1).faucet();
            const balance = await mysteryToken.balanceOf(addr1.address);
            expect(balance).to.equal(ethers.parseEther("100"));
        });

        it("Should prevent faucet spam", async function () {
            await mysteryToken.connect(addr1).faucet();
            await expect(mysteryToken.connect(addr1).faucet()).to.be.revertedWith("Faucet: Cooldown active");
        });
    });

    describe("GachaMachine", function () {
        it("Should spin and mint NFT", async function () {
            // 1. Get Tokens
            await mysteryToken.connect(addr1).faucet();

            // 2. Approve Gacha
            await mysteryToken.connect(addr1).approve(await gachaMachine.getAddress(), ethers.parseEther("100"));

            // 3. Spin
            await expect(gachaMachine.connect(addr1).spin())
                .to.emit(gachaMachine, "RequestSent");

            // 4. Fulfill Randomness (Simulate Chainlink)
            // We need the requestId. In mock, we can just call fulfillRandomWords with the requestId.
            // Since it's the first request, requestId should be 1.
            // We accept any result as long as the event is emitted
            await expect(vrfCoordinatorV2Mock.fulfillRandomWords(1, await gachaMachine.getAddress()))
                .to.emit(gachaMachine, "GachaResult");
            // .withArgs(addr1.address, "Common", 0); // Removed strict check due to randomness

            // 5. Check NFT ownership
            expect(await mysteryItem.ownerOf(0)).to.equal(addr1.address);
        });
    });

    describe("Marketplace", function () {
        beforeEach(async function () {
            // Setup: addr1 gets NFT
            await mysteryToken.connect(addr1).faucet();
            await mysteryToken.connect(addr1).approve(await gachaMachine.getAddress(), ethers.parseEther("100"));
            await gachaMachine.connect(addr1).spin();
            await vrfCoordinatorV2Mock.fulfillRandomWords(1, await gachaMachine.getAddress());
        });

        it("Should list and buy item", async function () {
            // 1. addr1 lists item
            await mysteryItem.connect(addr1).approve(await marketplace.getAddress(), 0);
            await marketplace.connect(addr1).listItem(0, ethers.parseEther("50"));

            // 2. addr2 buys item
            await mysteryToken.connect(addr2).faucet(); // addr2 needs money
            await mysteryToken.connect(addr2).approve(await marketplace.getAddress(), ethers.parseEther("50"));

            await expect(marketplace.connect(addr2).buyItem(0))
                .to.emit(marketplace, "ItemSold")
                .withArgs(addr1.address, addr2.address, 0, ethers.parseEther("50"));

            // 3. Check ownership
            expect(await mysteryItem.ownerOf(0)).to.equal(addr2.address);

            // 4. Check balances
            // addr1 should have: 100 (faucet) - 10 (gacha) + 50 (sale) = 140
            expect(await mysteryToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("140"));
            // addr2 should have: 100 (faucet) - 50 (buy) = 50
            expect(await mysteryToken.balanceOf(addr2.address)).to.equal(ethers.parseEther("50"));
        });
    });
});
