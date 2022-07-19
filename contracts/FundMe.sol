/**Get funds from users
 *withdraw funds
 *set a minimum funding value in USD
 **/

//Pragma statements

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

//Import statements

import "./PriceConverter.sol";
import "hardhat/console.sol";

//Errors

error FundMe__NotOwner();

//Interfaces, Libraries and Contracts

//866,591 cost of creation #1
//847,043 cost of creation #2 with just one constant
//823,476 cost of creation #3 with constant and immutable

/** @title A contract for crowd funding
 *  @author Sebastian Zambrano Arango
 *  @notice This contract is to demo a sample funding contract
 *  @dev This implements price feeds as out library
 */
contract FundMe {
    //Type variables

    using PriceConverter for uint256;

    //State variables

    uint256 public constant MINIMUM_USD = 50 * 1e18;
    //Getter price with constant: 21415
    //Getter price without constant: 23515

    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;

    address public immutable i_owner;

    //Getter with immutable: 21508
    //Getter without immutable: 23644

    AggregatorV3Interface public s_priceFeed;

    modifier onlyOwner() {
        /* require (msg.sender == i_owner, "Sender is not owner!");
        _; //This represents doing the rest of the code.
        */

        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**@notice This function funds this contract
     *  @dev ...
     */
    function fund() public payable {
        //Want to be able to set a minimum fund amount in USD
        //msg.value.getConversionRate(); /*This is the same as getConversionRate(msg.value), because of the library */
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "Didn't send enough ETH!"
        ); // 1e18 == 1 * 10 ** 18 == 1000000000000000000
        s_addressToAmountFunded[msg.sender] = msg.value;
        s_funders.push(msg.sender);
    }

    function withdraw() public onlyOwner {
        /* a For is used like: for(<starting index>, <ending index>, <step amount>) {} */
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        //Reset the array
        s_funders = new address[](0); //In the () we set the elements to start with

        //Actually withdraw the funds. It can be done in 3 ways:
        // 1. Transfer
        //msg.sender = address
        //payable(msg.sender) = payable address
        /* payable(msg.sender).transfer(address(this).balance);
        // 2. Send
        bool sendSuccess = payable(msg.sender).send(address(this).balance);
        require(sendSuccess, "Send failed"); */

        // 3. Call
        (bool callSucess, ) = payable(msg.sender).call{
            value: address(this).balance
        }(
            " /* Here we will put the information about the function we wanna call in other contract */ "
        );
        require(callSucess, "Call failed.");
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        //Mappings can't be in memory
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        //The (bool success, ) is because of call return two values, the second is used if the function call
        //calls returns anything, but as it doesn't now, we dont delcare it
        require(success);
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    /**@notice This is a test for the hardhat console.log for solidity
     *  @dev ...
     */

    function getFunder(uint256 index) public view returns (address) {
        console.log("Searching for the founder...");
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
