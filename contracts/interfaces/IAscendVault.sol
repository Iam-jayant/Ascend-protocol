// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IAscendVault
 * @notice Interface for individual Ascend inheritance vaults
 */
interface IAscendVault {
    struct Beneficiary {
        address payable beneficiaryAddress;
        uint256 sharePercentage; // Out of 10000 (100.00%)
        bool isActive;
    }

    event CheckedIn(address indexed owner, uint256 newDeadline);
    event VaultTriggered(address indexed owner, uint256 triggeredAt);
    event BeneficiaryAdded(address indexed beneficiary, uint256 share);
    event BeneficiaryRemoved(address indexed beneficiary);
    event BeneficiaryUpdated(address indexed beneficiary, uint256 newShare);
    event TokenDeposited(address indexed token, uint256 amount);
    event EmergencyWithdrawal(address indexed token, uint256 amount, address indexed to);
    event FundsDistributed(address indexed beneficiary, uint256 amount);

    function checkIn() external;
    function addBeneficiary(address payable _beneficiary, uint256 _sharePercentage) external;
    function removeBeneficiary(address _beneficiary) external;
    function updateBeneficiaryShare(address _beneficiary, uint256 _newShare) external;
    function emergencyWithdraw(address _token) external;
    function trigger() external;
    function distributeFunds(address _usdcAddress) external;
    
    function canTrigger() external view returns (bool);
    function getTimeRemaining() external view returns (uint256);
    function getBeneficiaries() external view returns (Beneficiary[] memory);
    function getVaultBalance(address _token) external view returns (uint256);
}

