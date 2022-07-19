const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
    const { deployer } = await getNamedAccounts;
    const fundMe = await ethers.getContract("FundMe", deployer);
    console.log("Withdrawing Contract's funds...");
    const transactionResponse = await fundMe.cheaperWithdraw();
    await transactionResponse.wait(1);
    console.log("Withdrawn successfuly!");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
