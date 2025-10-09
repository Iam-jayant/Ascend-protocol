// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IAscendVault.sol";

/**
 * @title AscendVault
 * @notice Individual inheritance vault for crypto asset management
 * @dev Core contract implementing deadman switch with multi-beneficiary support
 */
contract AscendVault is IAscendVault, ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public immutable owner;
    uint256 public lastCheckIn;
    uint256 public immutable checkInPeriod;
    uint256 public immutable gracePeriod;
    bool public isTriggered;

    Beneficiary[] private beneficiaries;
    mapping(address => uint256) private beneficiaryIndex; // 1-based indexing (0 = not exists)

    //errors

    error OnlyOwner();
    error OnlyBeforeTriggered();
    error OnlyAfterTriggered();
    error InvalidAddress();
    error InvalidSharePercentage();
    error TotalShareExceeds100();
    error BeneficiaryAlreadyExists();
    error BeneficiaryNotFound();
    error DeadlineNotReached();
    error NoBeneficiaries();
    error NoFundsToDistribute();

    //modifiers

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    modifier onlyBeforeTriggered() {
        if (isTriggered) revert OnlyBeforeTriggered();
        _;
    }

    modifier onlyAfterTriggered() {
        if (!isTriggered) revert OnlyAfterTriggered();
        _;
    }

    //constructor

    constructor(
        address _owner,
        uint256 _checkInPeriod,
        uint256 _gracePeriod
    ) {
        if (_owner == address(0)) revert InvalidAddress();
        if (_checkInPeriod == 0) revert InvalidSharePercentage();

        owner = _owner;
        checkInPeriod = _checkInPeriod;
        gracePeriod = _gracePeriod;
        lastCheckIn = block.timestamp;
        isTriggered = false;
    }

    //Core Functions

    /**
     * @notice Owner resets the deadman switch timer */
    function checkIn() external onlyOwner onlyBeforeTriggered {
        lastCheckIn = block.timestamp;
        emit CheckedIn(owner, lastCheckIn + checkInPeriod + gracePeriod);
    }

    /**
     * @notice Add a new beneficiary to the vault
     * @param _beneficiary Wallet address of beneficiary
     * @param _sharePercentage Percentage share (100.00% = 10000)
     * @param _upiId Encrypted UPI ID for fiat payout
     */
    function addBeneficiary(
        address payable _beneficiary,
        uint256 _sharePercentage,
        string calldata _upiId
    ) external onlyOwner onlyBeforeTriggered {
        if (_beneficiary == address(0)) revert InvalidAddress();
        if (_sharePercentage == 0 || _sharePercentage > 10000) revert InvalidSharePercentage();
        if (beneficiaryIndex[_beneficiary] != 0) revert BeneficiaryAlreadyExists();

        // Check total shares don't exceed 100%
        uint256 totalShares = _getTotalShares();
        if (totalShares + _sharePercentage > 10000) revert TotalShareExceeds100();

        beneficiaries.push(
            Beneficiary({
                beneficiaryAddress: _beneficiary,
                sharePercentage: _sharePercentage,
                upiId: _upiId,
                isActive: true
            })
        );

        beneficiaryIndex[_beneficiary] = beneficiaries.length; // 1-based index

        emit BeneficiaryAdded(_beneficiary, _sharePercentage, _upiId);
    }

    /**
     * @notice Remove a beneficiary from the vault
     * @param _beneficiary Address to remove
     */
    function removeBeneficiary(address _beneficiary) external onlyOwner onlyBeforeTriggered {
        uint256 index = beneficiaryIndex[_beneficiary];
        if (index == 0) revert BeneficiaryNotFound();

        uint256 arrayIndex = index - 1;
        uint256 lastIndex = beneficiaries.length - 1;

        // Move last element to the deleted position
        if (arrayIndex != lastIndex) {
            Beneficiary memory lastBeneficiary = beneficiaries[lastIndex];
            beneficiaries[arrayIndex] = lastBeneficiary;
            beneficiaryIndex[lastBeneficiary.beneficiaryAddress] = index;
        }

        beneficiaries.pop();
        delete beneficiaryIndex[_beneficiary];

        emit BeneficiaryRemoved(_beneficiary);
    }

    /**
     * @notice Update beneficiary's share percentage
     * @param _beneficiary Address to update
     * @param _newShare New share percentage
     */
    function updateBeneficiaryShare(
        address _beneficiary,
        uint256 _newShare
    ) external onlyOwner onlyBeforeTriggered {
        uint256 index = beneficiaryIndex[_beneficiary];
        if (index == 0) revert BeneficiaryNotFound();
        if (_newShare == 0 || _newShare > 10000) revert InvalidSharePercentage();

        uint256 arrayIndex = index - 1;
        uint256 oldShare = beneficiaries[arrayIndex].sharePercentage;
        uint256 totalShares = _getTotalShares();

        // Check new total doesn't exceed 100%
        if (totalShares - oldShare + _newShare > 10000) revert TotalShareExceeds100();

        beneficiaries[arrayIndex].sharePercentage = _newShare;

        emit BeneficiaryUpdated(_beneficiary, _newShare);
    }

    /**
     * @notice Owner can withdraw funds before trigger
     * @param _token Token address to withdraw
     */
    function emergencyWithdraw(address _token) external onlyOwner onlyBeforeTriggered nonReentrant {
        if (_token == address(0)) revert InvalidAddress();

        IERC20 token = IERC20(_token);
        uint256 balance = token.balanceOf(address(this));
        
        if (balance > 0) {
            token.safeTransfer(owner, balance);
            emit EmergencyWithdrawal(_token, balance, owner);
        }
    }

    /**
     * @notice Anyone can trigger the vault after deadline
     */
    function trigger() external {
        if (isTriggered) revert OnlyBeforeTriggered();
        if (!canTrigger()) revert DeadlineNotReached();

        isTriggered = true;
        emit VaultTriggered(owner, block.timestamp);
    }

    /**
     * @notice Distribute USDC to all beneficiaries after trigger
     * @param _usdcAddress USDC token address on Polygon
     */
    function distributeFunds(address _usdcAddress) external onlyAfterTriggered nonReentrant {
        if (_usdcAddress == address(0)) revert InvalidAddress();
        if (beneficiaries.length == 0) revert NoBeneficiaries();

        IERC20 usdc = IERC20(_usdcAddress);
        uint256 totalBalance = usdc.balanceOf(address(this));
        
        if (totalBalance == 0) revert NoFundsToDistribute();

        // Distribute to each beneficiary based on share percentage
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            Beneficiary memory beneficiary = beneficiaries[i];
            
            if (beneficiary.isActive && beneficiary.sharePercentage > 0) {
                uint256 amount = (totalBalance * beneficiary.sharePercentage) / 10000;
                
                if (amount > 0) {
                    usdc.safeTransfer(beneficiary.beneficiaryAddress, amount);
                    emit FundsDistributed(beneficiary.beneficiaryAddress, amount);
                }
            }
        }
    }

    //View Functions

    /**
     * @notice Check if vault can be triggered
     */
    function canTrigger() public view returns (bool) {
        if (isTriggered) return false;
        return block.timestamp >= lastCheckIn + checkInPeriod + gracePeriod;
    }

    /**
     * @notice Time remaining until vault can be triggered
     */
    function getTimeRemaining() public view returns (uint256) {
        if (isTriggered) return 0;
        
        uint256 deadline = lastCheckIn + checkInPeriod + gracePeriod;
        if (block.timestamp >= deadline) return 0;
        
        return deadline - block.timestamp;
    }

    /**
     * @notice Get all beneficiaries
     */
    function getBeneficiaries() external view returns (Beneficiary[] memory) {
        return beneficiaries;
    }

    /**
     * @notice Get vault balance for a token
     */
    function getVaultBalance(address _token) external view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }

    /**
     * @notice Get total allocated shares
     */
    function _getTotalShares() private view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            if (beneficiaries[i].isActive) {
                total += beneficiaries[i].sharePercentage;
            }
        }
        return total;
    }

    // Receive Function
    /**
     * @notice Allow vault to receive MATIC
     */
    receive() external payable {
        emit TokenDeposited(address(0), msg.value);
    }
}