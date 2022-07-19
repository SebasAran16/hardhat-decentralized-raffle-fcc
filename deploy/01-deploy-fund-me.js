const { getNamedAccounts, deployments, network } = require("hardhat");
const {
    networkConfig,
    developmentChains
} = require("../helper-hardhat-config");
//That above equals these two lines:
//const helperConfig = require("../helper-hardhat-config");
//const networkConfig = helperConfig.networkConfig;
const { verify } = require("../utils/verify");

module.exports = async ({ geteNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    // if chainId is X use address Y
    // if chainId is X use address Y
    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];

    // Well, what if we want to change chains?
    // when going for localhost or hardhat network we want to use a mock
    let ethUsdPriceFeedAddress;
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }

    //If the contract doesn't exist, we deploy a minimal version
    //of it for our local testing

    const args = [ethUsdPriceFeedAddress];
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, //Put priceFeed address (this is to the constructor, remember)
        log: true, //Custom log for not doing the console.log stuff
        waitConfirmations: network.config.blockConfirmations || 1
    });

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args);
    }

    log("---------------------------");
};
module.exports.tags = ["all", "fundme"];
