require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();
require("solidity-coverage");
require("hardhat-deploy");
// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const COINMARKETCAP_API_KEY =
    process.env.COINMARKETCAP_API_KEY || "25f81152-b4fd-4be6-8b24-d94a7dc5d39f";
const KOVAN_RPC_URL =
    process.env.KOVAN_RPC_URL ||
    "https://eth-mainnet.alchemyapi.io/v2/your-api-key";
const RINKEBY_RPC_URL =
    process.env.RINKEBY_RPC_URL ||
    "https://eth-mainnet.alchemyapi.io/v2/oqfqOYTa4qA3hHII3rph93z2V6sUgn1i";
const PRIVATE_KEY =
    process.env.PRIVATE_KEY ||
    "33cf9c8047e2085b60ee4e7381c04cbb62d691be459a38edd4a192d7e26e8651";
const ETHERSCAN_API_KEY =
    process.env.ETHERSCAN_API_KEY || "H3939RS83PR517NR9Z9BDG1AE9FCR9FD13";

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337
            // gasPrice: 130000000000,
        },
        kovan: {
            url: KOVAN_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 42,
            gas: 6000000
        },
        rinkeby: {
            url: RINKEBY_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 4,
            blockConfirmations: 6
        },
        localhost: {
            chainId: 31337,
            url: "http://127.0.0.1:8545/",
            //accounts: Thx Hardhat!
            blockConfirmations: 1
        }
    },
    //solidity: "0.8.8",
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }]
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "ETH"
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0 // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        }
    }
};
