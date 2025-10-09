// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AscendVault.sol";

/**
 * @title AscendFactory
 * @notice Factory contract for deploying individual Ascend vaults
 * @dev Gas-efficient vault deployment with user tracking
 */
contract AscendFactory {
    // state Variables
    address[] public allVaults;
    mapping(address => address[]) public userVaults; // user => vaults[]

    // Default parameters (can be customized per vault)
    uint256 public constant DEFAULT_CHECK_IN_PERIOD = 30 days;
    uint256 public constant DEFAULT_GRACE_PERIOD = 7 days;

    // events

    event VaultCreated(
        address indexed owner,
        address indexed vaultAddress,
        uint256 checkInPeriod,
        uint256 gracePeriod,
        uint256 vaultIndex
    );

    // errors

    error InvalidCheckInPeriod();
    error InvalidOwner();

    // functions

    /**
     * @notice Create a new vault with default parameters
     * @return vaultAddress The address of the newly created vault
     */
    function createVault() external returns (address vaultAddress) {
        return createVaultWithParams(DEFAULT_CHECK_IN_PERIOD, DEFAULT_GRACE_PERIOD);
    }

    /**
     * @notice Create a new vault with custom parameters
     * @param _checkInPeriod Time between required check-ins
     * @param _gracePeriod Extra time before trigger after check-in deadline
     * @return vaultAddress The address of the newly created vault
     */
    function createVaultWithParams(
        uint256 _checkInPeriod,
        uint256 _gracePeriod
    ) public returns (address vaultAddress) {
        if (_checkInPeriod == 0) revert InvalidCheckInPeriod();
        if (msg.sender == address(0)) revert InvalidOwner();

        // Deploy new vault
        AscendVault newVault = new AscendVault(
            msg.sender,
            _checkInPeriod,
            _gracePeriod
        );

        vaultAddress = address(newVault);

        // Track vault
        allVaults.push(vaultAddress);
        userVaults[msg.sender].push(vaultAddress);

        emit VaultCreated(
            msg.sender,
            vaultAddress,
            _checkInPeriod,
            _gracePeriod,
            allVaults.length - 1
        );

        return vaultAddress;
    }

    //view functions

    /**
     * @notice Get all vaults created by a user
     * @param _user User address
     * @return Array of vault addresses
     */
    function getUserVaults(address _user) external view returns (address[] memory) {
        return userVaults[_user];
    }

    /**
     * @notice Get total number of vaults created
     * @return Total vault count
     */
    function getTotalVaults() external view returns (uint256) {
        return allVaults.length;
    }

    /**
     * @notice Get vault at specific index
     * @param _index Index in allVaults array
     * @return Vault address
     */
    function getVaultAtIndex(uint256 _index) external view returns (address) {
        require(_index < allVaults.length, "Index out of bounds");
        return allVaults[_index];
    }

    /**
     * @notice Get user's vault count
     * @param _user User address
     * @return Number of vaults owned by user
     */
    function getUserVaultCount(address _user) external view returns (uint256) {
        return userVaults[_user].length;
    }
}

