// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * @title PriceOracle
 * @notice Aggregates price feeds from Chainlink for token valuation
 * @dev Used by LiquidationEngine to prevent price manipulation
 */
contract PriceOracle {
    // state variables

    address public admin;
    
    // Token => Chainlink price feed address
    mapping(address => address) public priceFeeds;
    
    // Maximum age of price data (2 hours)
    uint256 public constant MAX_PRICE_AGE = 2 hours;
    
    // Maximum deviation allowed between successive prices (20%)
    uint256 public constant MAX_PRICE_DEVIATION = 2000; // 20% in basis points

    // events

    event PriceFeedSet(address indexed token, address indexed priceFeed);
    event PriceFeedRemoved(address indexed token);
    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);

    // errors

    error OnlyAdmin();
    error InvalidAddress();
    error PriceFeedNotSet();
    error StalePrice();
    error InvalidPrice();

    // modifiers

    modifier onlyAdmin() {
        if (msg.sender != admin) revert OnlyAdmin();
        _;
    }

    // constructor

    constructor() {
        admin = msg.sender;
    }

    // admin functions

    /**
     * @notice Set Chainlink price feed for a token
     * @param _token Token address
     * @param _priceFeed Chainlink aggregator address
     */
    function setPriceFeed(address _token, address _priceFeed) external onlyAdmin {
        if (_token == address(0) || _priceFeed == address(0)) revert InvalidAddress();
        
        priceFeeds[_token] = _priceFeed;
        emit PriceFeedSet(_token, _priceFeed);
    }

    /**
     * @notice Remove price feed for a token
     * @param _token Token address
     */
    function removePriceFeed(address _token) external onlyAdmin {
        if (_token == address(0)) revert InvalidAddress();
        
        delete priceFeeds[_token];
        emit PriceFeedRemoved(_token);
    }

    /**
     * @notice Transfer admin rights
     * @param _newAdmin New admin address
     */
    function transferAdmin(address _newAdmin) external onlyAdmin {
        if (_newAdmin == address(0)) revert InvalidAddress();
        
        address oldAdmin = admin;
        admin = _newAdmin;
        emit AdminTransferred(oldAdmin, _newAdmin);
    }

    // view functions

    /**
     * @notice Get latest price for a token in USD (8 decimals)
     * @param _token Token address
     * @return price Price in USD with 8 decimals
     */
    function getTokenPrice(address _token) external view returns (uint256 price) {
        address priceFeedAddress = priceFeeds[_token];
        if (priceFeedAddress == address(0)) revert PriceFeedNotSet();

        AggregatorV3Interface priceFeed = AggregatorV3Interface(priceFeedAddress);
        
        (
            uint80 roundId,
            int256 answer,
            ,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();

        // Check price is not stale
        if (updatedAt < block.timestamp - MAX_PRICE_AGE) revert StalePrice();
        
        // Check round is complete
        if (answeredInRound < roundId) revert InvalidPrice();
        
        // Check price is positive
        if (answer <= 0) revert InvalidPrice();

        return uint256(answer);
    }

    /**
     * @notice Check if price feed is set for a token
     * @param _token Token address
     * @return True if price feed exists
     */
    function hasPriceFeed(address _token) external view returns (bool) {
        return priceFeeds[_token] != address(0);
    }

    /**
     * @notice Get price feed decimals
     * @param _token Token address
     * @return decimals Number of decimals in price feed
     */
    function getPriceFeedDecimals(address _token) external view returns (uint8 decimals) {
        address priceFeedAddress = priceFeeds[_token];
        if (priceFeedAddress == address(0)) revert PriceFeedNotSet();

        AggregatorV3Interface priceFeed = AggregatorV3Interface(priceFeedAddress);
        return priceFeed.decimals();
    }

    /**
     * @notice Get safe price with staleness check
     * @param _token Token address
     * @return price Price in USD
     * @return isValid Whether price is valid and fresh
     */
    function getSafePrice(address _token) external view returns (uint256 price, bool isValid) {
        address priceFeedAddress = priceFeeds[_token];
        if (priceFeedAddress == address(0)) {
            return (0, false);
        }

        AggregatorV3Interface priceFeed = AggregatorV3Interface(priceFeedAddress);
        
        try priceFeed.latestRoundData() returns (
            uint80 roundId,
            int256 answer,
            uint256,
            uint256 updatedAt,
            uint80 answeredInRound
        ) {
            // Check all validity conditions
            if (
                updatedAt >= block.timestamp - MAX_PRICE_AGE &&
                answeredInRound >= roundId &&
                answer > 0
            ) {
                return (uint256(answer), true);
            }
            return (0, false);
        } catch {
            return (0, false);
        }
    }
}

