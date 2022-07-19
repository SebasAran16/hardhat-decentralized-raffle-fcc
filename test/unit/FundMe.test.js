const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function() {
          let fundMe;
          let deployer;
          let mockV3Aggregator;
          const sendValue = ethers.utils.parseEther("1"); //Equals 1 ETH
          //Which is 1000000000000000000
          beforeEach(async function() {
              //Deploy our fundMe contract using hardhat-deploy
              //To get addressess too:
              //const accounts = await ethers.getSigners();
              //const accountZero = accounts[0];
              deployer = (await getNamedAccounts()).deployer; //let deloyer will wait and
              //equal the value of deployer from getNamedAccounts
              await deployments.fixture(["all"]); //Will deploy eveerithing that has the <all> tag
              //A.K.A Both contracts
              fundMe = await ethers.getContract("FundMe", deployer);
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              );
          });
          describe("constructor", async function() {
              it("Sets the aggregator addresses correctly", async function() {
                  const response = await fundMe.getPriceFeed();
                  assert.equal(response, mockV3Aggregator.address);
              });
          });
          /*describe("receive", async function() {
            it("");
        });
        describe("fallback", async function() {
            it("");
        }); */
          describe("fund", async function() {
              it("Fails if we do not send enough ETH", async function() {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Didn't send enough ETH!"
                  );
              });
              it("Updates the amount funded data structure", async function() {
                  await fundMe.fund({ value: sendValue });
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  );
                  assert.equal(response.toString(), sendValue.toString());
              });
              it("Fails if the funder was not pushed into the array", async function() {
                  await fundMe.fund({ value: sendValue });
                  funder = await fundMe.getFunder(0);
                  assert.equal(deployer, funder.toString());
              });
          });
          describe("withdraw", async function() {
              beforeEach(async function() {
                  await fundMe.fund({ value: sendValue });
              });
              it("Withdraw ETH from a single funder", async function() {
                  //Arrange
                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  );
                  //Act
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt; //taken out from the transactionReceipt
                  //check it by debugging the code
                  const gasCost = gasUsed.mul(effectiveGasPrice); //.mul as they are both big numbers

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  );
                  //Assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });
              it("Allow us to withdraw with multiple getFunder", async function() {
                  //Arrange
                  const accounts = await ethers.getSigners();
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );
                      fundMeConnectedContract.fund({ value: sendValue });
                  }

                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  //Act
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  //Assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  //Make sure that getFunder are reset correctly
                  await expect(fundMe.getFunder({ value: 0 })).to.be.reverted;

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });
              it("Only allows the owner to withdraw", async function() {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  );
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner");
              });
              it("Cheaper withdraw ETH from a single funder", async function() {
                  //Arrange
                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  );
                  //Act
                  const transactionResponse = await fundMe.cheaperWithdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt; //taken out from the transactionReceipt
                  //check it by debugging the code
                  const gasCost = gasUsed.mul(effectiveGasPrice); //.mul as they are both big numbers

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  );
                  //Assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });
              it("Cheaper withdraw testing (Multiple)", async function() {
                  //Arrange
                  const accounts = await ethers.getSigners();
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );
                      fundMeConnectedContract.fund({ value: sendValue });
                  }

                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  //Act
                  const transactionResponse = await fundMe.cheaperWithdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  //Assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  //Make sure that getFunder are reset correctly
                  await expect(fundMe.getFunder({ value: 0 })).to.be.reverted;

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });
          });
      });
