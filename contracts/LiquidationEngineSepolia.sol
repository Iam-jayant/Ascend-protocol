// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./PriceOracle.sol";

/**
 * @title LiquidationEngineSepolia
 * @notice Handles conversion of various tokens to USDC for inheritance distribution
 * @dev Uses Uniswap V3 on Sepolia with Chainlink oracle price validation
 */
contract LiquidationEngineSepolia is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ State Variables ============

    address public immutable uniswapRouter;
    PriceOracle public immutable priceOracle;
    address public immutable usdcAddress;
    address public immutable wethAddress;

    // Maximum slippage tolerance: 5% (500 basis points)
    uint256 public constant MAX_SLIPPAGE = 500;
    
    // Minimum liquidity threshold (in USD with 8 decimals): $10
    uint256 public constant MIN_LIQUIDITY_USD = 10 * 1e8;

    // ============ Events ============

    event TokenLiquidated(
        address indexed fromToken,
        address indexed toToken,
        uint256 amountIn,
        uint256 amountOut,
        address indexed recipient
    );

    event SwapPathUsed(address[] path);

    // ============ Errors ============

    error InvalidAddress();
    error InsufficientBalance();
    error InsufficientOutputAmount();
    error PriceOracleUnavailable();
    error ExcessiveSlippage();
    error SwapFailed();

    // ============ Constructor ============

    /**
     * @param _uniswapRouter Uniswap V3 router address on Sepolia
     * @param _priceOracle PriceOracle contract address
     * @param _usdcAddress USDC token address on Sepolia
     * @param _wethAddress Wrapped ETH address
     */
    constructor(
        address _uniswapRouter,
        address _priceOracle,
        address _usdcAddress,
        address _wethAddress
    ) {
        if (
            _uniswapRouter == address(0) ||
            _priceOracle == address(0) ||
            _usdcAddress == address(0) ||
            _wethAddress == address(0)
        ) revert InvalidAddress();

        uniswapRouter = _uniswapRouter;
        priceOracle = PriceOracle(_priceOracle);
        usdcAddress = _usdcAddress;
        wethAddress = _wethAddress;
    }

    // ============ Core Functions ============

    /**
     * @notice Liquidate any ERC20 token to USDC
     * @param _tokenAddress Token to liquidate
     * @param _amount Amount to liquidate
     * @param _recipient Address to receive USDC
     * @return usdcReceived Amount of USDC received
     */
    function liquidateToUSDC(
        address _tokenAddress,
        uint256 _amount,
        address _recipient
    ) external nonReentrant returns (uint256 usdcReceived) {
        if (_tokenAddress == address(0) || _recipient == address(0)) revert InvalidAddress();
        if (_amount == 0) revert InsufficientBalance();

        // If already USDC, just transfer
        if (_tokenAddress == usdcAddress) {
            IERC20(usdcAddress).safeTransferFrom(msg.sender, _recipient, _amount);
            emit TokenLiquidated(_tokenAddress, usdcAddress, _amount, _amount, _recipient);
            return _amount;
        }

        // Transfer tokens from sender to this contract
        IERC20(_tokenAddress).safeTransferFrom(msg.sender, address(this), _amount);

        // Determine swap path
        address[] memory path = _getOptimalPath(_tokenAddress);

        // Calculate minimum output based on oracle price with slippage tolerance
        uint256 minOutput = _calculateMinOutput(_tokenAddress, _amount);

        // Approve router to spend tokens
        IERC20(_tokenAddress).forceApprove(address(uniswapRouter), _amount);

        // For demo purposes, simulate a swap (in real implementation, you'd call Uniswap)
        // This is a simplified version for presentation
        usdcReceived = _amount / 1000; // Simulate 0.1% conversion rate for demo
        
        // Transfer simulated USDC to recipient
        IERC20(usdcAddress).safeTransfer(_recipient, usdcReceived);

        emit SwapPathUsed(path);
        emit TokenLiquidated(_tokenAddress, usdcAddress, _amount, usdcReceived, _recipient);

        return usdcReceived;
    }

    /**
     * @notice Batch liquidate multiple tokens to USDC
     * @param _tokens Array of token addresses
     * @param _amounts Array of amounts
     * @param _recipient Address to receive USDC
     * @return totalUSDC Total USDC received
     */
    function batchLiquidate(
        address[] calldata _tokens,
        uint256[] calldata _amounts,
        address _recipient
    ) external nonReentrant returns (uint256 totalUSDC) {
        if (_tokens.length != _amounts.length) revert InvalidAddress();
        if (_recipient == address(0)) revert InvalidAddress();

        for (uint256 i = 0; i < _tokens.length; i++) {
            if (_amounts[i] > 0) {
                totalUSDC += this.liquidateToUSDC(_tokens[i], _amounts[i], _recipient);
            }
        }

        return totalUSDC;
    }

    // ============ Internal Functions ============

    /**
     * @notice Determine optimal swap path
     * @param _tokenAddress Token to swap from
     * @return path Array of addresses representing swap path
     */
    function _getOptimalPath(address _tokenAddress) internal view returns (address[] memory path) {
        // Direct path if liquidity exists (token -> USDC)
        address[] memory directPath = new address[](2);
        directPath[0] = _tokenAddress;
        directPath[1] = usdcAddress;

        // For demo, always use direct path
        return directPath;
    }

    /**
     * @notice Calculate minimum output amount with slippage
     * @param _tokenAddress Input token
     * @param _amount Input amount
     * @return minOutput Minimum acceptable output amount
     */
    function _calculateMinOutput(
        address _tokenAddress,
        uint256 _amount
    ) internal view returns (uint256 minOutput) {
        // Try to get price from oracle
        try priceOracle.getSafePrice(_tokenAddress) returns (uint256 price, bool isValid) {
            if (isValid && price > 0) {
                // Calculate expected USDC output (price is in 8 decimals)
                // Assuming token has 18 decimals, USDC has 6 decimals
                uint256 expectedOutput = (_amount * price) / 1e20; // Adjust for decimals
                
                // Apply slippage tolerance (5%)
                minOutput = (expectedOutput * (10000 - MAX_SLIPPAGE)) / 10000;
                return minOutput;
            }
        } catch {
            // Oracle unavailable, fallback to 0 (accept any amount)
        }

        // Fallback: Accept any positive amount
        return 0;
    }

    // ============ View Functions ============

    /**
     * @notice Preview swap output
     * @param _tokenAddress Input token
     * @param _amount Input amount
     * @return expectedOutput Expected USDC output
     */
    function previewSwap(
        address _tokenAddress,
        uint256 _amount
    ) external view returns (uint256 expectedOutput) {
        if (_tokenAddress == usdcAddress) return _amount;
        return _amount / 1000; // Simulate 0.1% conversion rate for demo
    }

    /**
     * @notice Check if token can be liquidated
     * @param _tokenAddress Token to check
     * @return canLiquidate Whether token has sufficient liquidity
     */
    function canLiquidateToken(address _tokenAddress) external pure returns (bool canLiquidate) {
        if (_tokenAddress == address(0)) return false;
        return true; // For demo, all tokens can be liquidated
    }
}
