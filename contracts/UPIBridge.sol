// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title UPIBridge
 * @notice Tracks crypto-to-fiat conversions for Indian compliance
 * @dev Records payouts for tax reporting under Section 194S
 */
contract UPIBridge {
    //State Variables

    address public admin;
    address public backend; // Authorized backend service

    struct PayoutRecord {
        address vaultAddress;
        address beneficiary;
        uint256 usdcAmount;
        uint256 inrAmount;
        string upiId;
        string razorpayPaymentId;
        uint256 timestamp;
        PayoutStatus status;
    }

    enum PayoutStatus {
        Pending,
        Processing,
        Completed,
        Failed
    }

    // Mapping: payoutId => PayoutRecord
    mapping(bytes32 => PayoutRecord) public payouts;
    
    // Mapping: vaultAddress => payoutIds[]
    mapping(address => bytes32[]) public vaultPayouts;
    
    // Mapping: beneficiary => payoutIds[]
    mapping(address => bytes32[]) public beneficiaryPayouts;

    // Counter for generating unique payout IDs
    uint256 private payoutCounter;

    //Events

    event PayoutRecorded(
        bytes32 indexed payoutId,
        address indexed vaultAddress,
        address indexed beneficiary,
        uint256 usdcAmount,
        uint256 inrAmount,
        string upiId
    );

    event PayoutStatusUpdated(
        bytes32 indexed payoutId,
        PayoutStatus oldStatus,
        PayoutStatus newStatus,
        string razorpayPaymentId
    );

    event BackendUpdated(address indexed oldBackend, address indexed newBackend);

    // errors

    error OnlyAdmin();
    error OnlyBackend();
    error InvalidAddress();
    error PayoutNotFound();
    error InvalidAmount();

    // modifiers

    modifier onlyAdmin() {
        if (msg.sender != admin) revert OnlyAdmin();
        _;
    }

    modifier onlyBackend() {
        if (msg.sender != backend && msg.sender != admin) revert OnlyBackend();
        _;
    }

    // constructor

    constructor() {
        admin = msg.sender;
        backend = msg.sender; // Initially admin is backend
    }

    // core functions

    /**
     * @notice Record a new payout for compliance tracking
     * @param _vaultAddress Vault that triggered payout
     * @param _beneficiary Beneficiary receiving payout
     * @param _usdcAmount Amount in USDC (6 decimals)
     * @param _upiId Beneficiary's UPI ID
     * @return payoutId Unique identifier for this payout
     */
    function recordPayout(
        address _vaultAddress,
        address _beneficiary,
        uint256 _usdcAmount,
        string calldata _upiId
    ) external onlyBackend returns (bytes32 payoutId) {
        if (_vaultAddress == address(0) || _beneficiary == address(0)) revert InvalidAddress();
        if (_usdcAmount == 0) revert InvalidAmount();

        // Generate unique payout ID
        payoutCounter++;
        payoutId = keccak256(abi.encodePacked(
            _vaultAddress,
            _beneficiary,
            _usdcAmount,
            block.timestamp,
            payoutCounter
        ));

        // Calculate INR amount (placeholder exchange rate: 1 USDC = 83 INR)
        // In production, this should use real-time exchange rate
        uint256 inrAmount = _usdcAmount * 83;

        // Store payout record
        payouts[payoutId] = PayoutRecord({
            vaultAddress: _vaultAddress,
            beneficiary: _beneficiary,
            usdcAmount: _usdcAmount,
            inrAmount: inrAmount,
            upiId: _upiId,
            razorpayPaymentId: "",
            timestamp: block.timestamp,
            status: PayoutStatus.Pending
        });

        // Track by vault and beneficiary
        vaultPayouts[_vaultAddress].push(payoutId);
        beneficiaryPayouts[_beneficiary].push(payoutId);

        emit PayoutRecorded(
            payoutId,
            _vaultAddress,
            _beneficiary,
            _usdcAmount,
            inrAmount,
            _upiId
        );

        return payoutId;
    }

    /**
     * @notice Update payout status (called by backend after Razorpay confirmation)
     * @param _payoutId Payout identifier
     * @param _newStatus New status
     * @param _razorpayPaymentId Razorpay transaction ID
     */
    function updatePayoutStatus(
        bytes32 _payoutId,
        PayoutStatus _newStatus,
        string calldata _razorpayPaymentId
    ) external onlyBackend {
        PayoutRecord storage payout = payouts[_payoutId];
        if (payout.timestamp == 0) revert PayoutNotFound();

        PayoutStatus oldStatus = payout.status;
        payout.status = _newStatus;
        
        if (bytes(_razorpayPaymentId).length > 0) {
            payout.razorpayPaymentId = _razorpayPaymentId;
        }

        emit PayoutStatusUpdated(_payoutId, oldStatus, _newStatus, _razorpayPaymentId);
    }

    // admin functions

    /**
     * @notice Set authorized backend service address
     * @param _newBackend New backend address
     */
    function setBackend(address _newBackend) external onlyAdmin {
        if (_newBackend == address(0)) revert InvalidAddress();
        
        address oldBackend = backend;
        backend = _newBackend;
        
        emit BackendUpdated(oldBackend, _newBackend);
    }

    /**
     * @notice Transfer admin rights
     * @param _newAdmin New admin address
     */
    function transferAdmin(address _newAdmin) external onlyAdmin {
        if (_newAdmin == address(0)) revert InvalidAddress();
        admin = _newAdmin;
    }

    // view functions

    /**
     * @notice Get payout details
     * @param _payoutId Payout identifier
     * @return Payout record
     */
    function getPayout(bytes32 _payoutId) external view returns (PayoutRecord memory) {
        return payouts[_payoutId];
    }

    /**
     * @notice Get all payouts for a vault
     * @param _vaultAddress Vault address
     * @return Array of payout IDs
     */
    function getVaultPayouts(address _vaultAddress) external view returns (bytes32[] memory) {
        return vaultPayouts[_vaultAddress];
    }

    /**
     * @notice Get all payouts for a beneficiary
     * @param _beneficiary Beneficiary address
     * @return Array of payout IDs
     */
    function getBeneficiaryPayouts(address _beneficiary) external view returns (bytes32[] memory) {
        return beneficiaryPayouts[_beneficiary];
    }

    /**
     * @notice Generate tax report for a vault (Section 194S compliance)
     * @param _vaultAddress Vault address
     * @return totalPayouts Total amount paid out
     * @return tdsAmount Tax deducted at source (1% of total)
     */
    function getTaxReport(address _vaultAddress) external view returns (
        uint256 totalPayouts,
        uint256 tdsAmount
    ) {
        bytes32[] memory payoutIds = vaultPayouts[_vaultAddress];
        
        for (uint256 i = 0; i < payoutIds.length; i++) {
            PayoutRecord memory payout = payouts[payoutIds[i]];
            if (payout.status == PayoutStatus.Completed) {
                totalPayouts += payout.inrAmount;
            }
        }

        // Calculate 1% TDS as per Section 194S
        tdsAmount = (totalPayouts * 100) / 10000;

        return (totalPayouts, tdsAmount);
    }

    /**
     * @notice Get pending payouts count for backend processing
     * @return count Number of pending payouts
     */
    function getPendingPayoutsCount() external view returns (uint256 count) {
        // Note: This is a simplified version. In production, you'd maintain a separate array
        // of pending payouts for efficiency
        return 0; // Placeholder
    }
}
