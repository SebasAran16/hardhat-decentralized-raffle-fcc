const { getNamedAccounts, ethers, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert } = require("chai");

//What this does is like an if argument in a single line of code
developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function() {
          let fundMe;
          let deployer;
          const sendValue = ethers.utils.parseEther("0.05");
          beforeEach(async function() {
              deployer = (await getNamedAccounts()).deployer;
              //We assume that the contract has been already deployed
              fundMe = await ethers.getContract("FundMe", deployer);
          });

          it("Allows people to fund and withdraw", async function() {
              await fundMe.fund({ value: sendValue });
              await fundMe.cheaperWithdraw();
              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              );
              assert.equal(endingBalance.toString(), "0");
          });
      });
