const { ethers, network } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    let vrfCoordinatorAddress;
    let subscriptionId;
    let keyHash;

    // Network-specific config
    if (network.name === "sepolia") {
        // Sepolia VRF V2 Coordinator
        vrfCoordinatorAddress = "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625";
        subscriptionId = process.env.VRF_SUBSCRIPTION_ID;
        keyHash = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c"; // 150 gwei Key Hash
    } else {
        // Localhost / Hardhat Network -> Deploy Mock
        console.log("Local network detected! Deploying VRF Mock...");
        const BASE_FEE = "100000000000000000"; // 0.1 LINK
        const GAS_PRICE_LINK = "1000000000"; // 1 gwei

        const VRFCoordinatorV2Mock = await ethers.getContractFactory("VRFCoordinatorV2Mock");
        const mock = await VRFCoordinatorV2Mock.deploy(BASE_FEE, GAS_PRICE_LINK);
        await mock.waitForDeployment();
        vrfCoordinatorAddress = await mock.getAddress();
        console.log("VRF Mock deployed to:", vrfCoordinatorAddress);

        // Create Subscription
        const tx = await mock.createSubscription();
        const receipt = await tx.wait();
        subscriptionId = 1; // Mock subId is usually 1

        // Fund Subscription
        await mock.fundSubscription(subscriptionId, "1000000000000000000000"); // 1000 LINK
        console.log("VRF Subscription created and funded with ID:", subscriptionId);

        keyHash = "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc"; // Arbitrary for mock
    }

    // 1. Deploy MysteryToken
    const MysteryToken = await ethers.getContractFactory("MysteryToken");
    const mysteryToken = await MysteryToken.deploy();
    await mysteryToken.waitForDeployment();
    console.log("MysteryToken deployed to:", await mysteryToken.getAddress());

    // 2. Deploy MysteryItem
    const MysteryItem = await ethers.getContractFactory("MysteryItem");
    const mysteryItem = await MysteryItem.deploy();
    await mysteryItem.waitForDeployment();
    console.log("MysteryItem deployed to:", await mysteryItem.getAddress());

    // 3. Deploy GachaMachine
    const GachaMachine = await ethers.getContractFactory("GachaMachine");
    const gachaMachine = await GachaMachine.deploy(
        subscriptionId,
        vrfCoordinatorAddress,
        keyHash,
        await mysteryToken.getAddress(),
        await mysteryItem.getAddress()
    );
    await gachaMachine.waitForDeployment();
    console.log("GachaMachine deployed to:", await gachaMachine.getAddress());

    // 4. Deploy Marketplace
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(
        await mysteryToken.getAddress(),
        await mysteryItem.getAddress()
    );
    await marketplace.waitForDeployment();
    console.log("Marketplace deployed to:", await marketplace.getAddress());

    // --- Post Deployment Setup ---

    // Set GachaMachine in MysteryItem
    await mysteryItem.setGachaMachine(await gachaMachine.getAddress());
    console.log("Set GachaMachine in MysteryItem");

    // If Local, add consumer to VRF Mock
    if (network.name !== "sepolia") {
        const VRFCoordinatorV2Mock = await ethers.getContractFactory("VRFCoordinatorV2Mock");
        const mock = VRFCoordinatorV2Mock.attach(vrfCoordinatorAddress);
        await mock.addConsumer(subscriptionId, await gachaMachine.getAddress());
        console.log("Added GachaMachine as consumer to VRF Mock");
    }

    console.log("Deployment Complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
