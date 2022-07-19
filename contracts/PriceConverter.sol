//This is going to be a library

//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        // As we interact with a contract outside from ours as said well need both
        //the addres and the ABI
        //Address: 0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
        //ABI: The contract imported
        //Put the variables and after errased them just for stiking it to my mind
        (, int256 price, , , ) = priceFeed.latestRoundData();
        //Will return ETH in terms of USD
        //110800000000 (Solidity does not work with decimals)
        return uint256(price * 1e10); //1**10 == 10000000000
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        //1107_000000000000000000 = ETH / USD price
        //1_000000000000000000 ETH

        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        return ethAmountInUsd;
    }
}
