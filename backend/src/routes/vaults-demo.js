import express from 'express';
import { validatePagination } from '../middleware/validation.js';
import EmailService from '../services/emailService.js';

const router = express.Router();
const emailService = new EmailService();

// In-memory storage for demo vaults
let demoVaults = [
  {
    id: 'vault-1',
    ownerAddress: '0x1234567890123456789012345678901234567890',
    assets: ['USDC', 'ETH'],
    beneficiaries: [
      { walletAddress: '0x1111111111111111111111111111111111111111', share: 50 },
      { walletAddress: '0x2222222222222222222222222222222222222222', share: 50 }
    ],
    checkInPeriod: 30,
    gracePeriod: 7,
    lastCheckIn: new Date().toISOString(),
    isTriggered: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vault-2',
    ownerAddress: '0x1234567890123456789012345678901234567890',
    assets: ['USDT', 'BTC'],
    beneficiaries: [
      { walletAddress: '0x3333333333333333333333333333333333333333', share: 100 }
    ],
    checkInPeriod: 15,
    gracePeriod: 3,
    lastCheckIn: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    isTriggered: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
  }
];

// POST /api/vaults - Create new vault (demo version without auth)
router.post('/', async (req, res) => {
  try {
    const { checkInPeriod, gracePeriod, timeUnit } = req.body;

    // Generate a mock vault ID
    const vaultId = `vault-${Date.now()}`;
    const vaultAddress = `0x${Math.random().toString(16).substr(2, 40)}`;

    // Create mock vault data
    const mockVault = {
      id: vaultId,
      address: vaultAddress,
      checkInPeriod: checkInPeriod,
      gracePeriod: gracePeriod,
      timeUnit: timeUnit || 'days',
      lastCheckIn: new Date().toISOString(),
      isTriggered: false,
      beneficiaryCount: 0,
      totalSharePercentage: 0,
      createdAt: new Date().toISOString()
    };

    // Add to in-memory storage
    demoVaults.unshift(mockVault);

    console.log('🎯 Demo vault created:', mockVault);

    // Send vault created email notification (if email is provided)
    try {
      // In a real implementation, you'd get the owner's email from the request
      const ownerEmail = req.body.ownerEmail || 'test@example.com';
      await emailService.sendVaultCreatedConfirmation(mockVault, ownerEmail);
      console.log('📧 Vault created email sent');
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      // Don't fail the vault creation if email fails
    }

    res.status(201).json({
      success: true,
      message: `Vault created successfully (${timeUnit || 'days'} mode)`,
      data: {
        vault: mockVault
      }
    });

  } catch (error) {
    console.error('Demo vault creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create vault'
    });
  }
});

// GET /api/vaults - Get mock vaults (no auth required for demo)
router.get('/', validatePagination, async (req, res) => {
  try {
    const { page, limit, offset } = req.pagination;

    // Return mock vault data for demo (no authentication required)
    const mockVaults = demoVaults;

    res.json({
      success: true,
      data: {
        vaults: mockVaults,
        pagination: {
          page,
          limit,
          total: mockVaults.length,
          totalPages: Math.ceil(mockVaults.length / limit)
        }
      },
      message: 'Vaults retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching vaults:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vaults'
    });
  }
});

// GET /api/vaults/:id - Get vault details (demo version without auth)
router.get('/:id', async (req, res) => {
  try {
    const vaultId = req.params.id;
    console.log('🔍 Getting vault details for:', vaultId);

    // Find vault in demo vaults
    const vault = demoVaults.find(v => v.id === vaultId);
    
    if (!vault) {
      return res.status(404).json({
        success: false,
        message: 'Vault not found'
      });
    }

    // Mock beneficiaries for demo
    const mockBeneficiaries = [
      {
        id: 'ben-1',
        walletAddress: '0x1111111111111111111111111111111111111111',
        sharePercentage: 50,
        email: 'beneficiary1@example.com',
        phone: '+91 9876543210',
        name: 'John Doe',
        createdAt: new Date().toISOString()
      },
      {
        id: 'ben-2',
        walletAddress: '0x2222222222222222222222222222222222222222',
        sharePercentage: 50,
        email: 'beneficiary2@example.com',
        phone: '+91 9876543211',
        name: 'Jane Smith',
        createdAt: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: {
        vault: {
          id: vault.id,
          address: vault.address,
          checkInPeriod: vault.checkInPeriod,
          gracePeriod: vault.gracePeriod,
          lastCheckIn: vault.lastCheckIn,
          isTriggered: vault.isTriggered,
          triggeredAt: vault.triggeredAt,
          beneficiaryCount: mockBeneficiaries.length,
          totalSharePercentage: mockBeneficiaries.reduce((sum, b) => sum + b.sharePercentage, 0),
          createdAt: vault.createdAt,
          vaultBalance: '1000.00', // Mock balance
          timeRemaining: '25 days' // Mock time remaining
        },
        beneficiaries: mockBeneficiaries
      }
    });

  } catch (error) {
    console.error('Get vault details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get vault details'
    });
  }
});

// POST /api/vaults/:id/trigger - Trigger vault and send notifications
router.post('/:id/trigger', async (req, res) => {
  try {
    const vaultId = req.params.id;
    console.log(`🚨 Triggering vault: ${vaultId}`);

    // Find vault in demo vaults
    const vault = demoVaults.find(v => v.id === vaultId);
    
    if (!vault) {
      return res.status(404).json({
        success: false,
        message: 'Vault not found'
      });
    }

    // Update vault status
    vault.isTriggered = true;
    vault.triggeredAt = new Date().toISOString();

    // Mock beneficiaries for demo
    const mockBeneficiaries = [
      {
        id: 'ben-1',
        walletAddress: '0x1111111111111111111111111111111111111111',
        sharePercentage: 50,
        email: 'beneficiary1@example.com',
        phone: '+91 9876543210',
        name: 'John Doe',
        createdAt: new Date().toISOString()
      },
      {
        id: 'ben-2',
        walletAddress: '0x2222222222222222222222222222222222222222',
        sharePercentage: 50,
        email: 'beneficiary2@example.com',
        phone: '+91 9876543211',
        name: 'Jane Smith',
        createdAt: new Date().toISOString()
      }
    ];

    // Send email notifications to beneficiaries
    try {
      await emailService.sendVaultTriggeredNotification(vault, mockBeneficiaries);
      console.log('📧 Vault triggered notifications sent');
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      // Don't fail the trigger if email fails
    }

    res.json({
      success: true,
      message: 'Vault triggered and notifications sent successfully',
      data: {
        vault: vault,
        beneficiaries: mockBeneficiaries,
        triggeredAt: vault.triggeredAt
      }
    });

  } catch (error) {
    console.error('Trigger vault error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger vault'
    });
  }
});

// POST /api/vaults/:id/send-credentials - Send withdrawal credentials
router.post('/:id/send-credentials', async (req, res) => {
  try {
    const vaultId = req.params.id;
    const { beneficiaryEmail, claimToken, amount } = req.body;

    console.log(`📧 Sending withdrawal credentials for vault: ${vaultId}`);

    // Mock claim data
    const claimData = {
      claimToken: claimToken || `claim-${Date.now()}`,
      amount: amount || '1000.00',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    };

    const beneficiary = {
      email: beneficiaryEmail || 'beneficiary@example.com',
      name: 'Beneficiary',
      sharePercentage: 50
    };

    // Send withdrawal credentials email
    try {
      await emailService.sendWithdrawalCredentials(claimData, beneficiary);
      console.log('📧 Withdrawal credentials sent');
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      throw emailError;
    }

    res.json({
      success: true,
      message: 'Withdrawal credentials sent successfully',
      data: {
        claimData,
        beneficiary
      }
    });

  } catch (error) {
    console.error('Send credentials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send withdrawal credentials'
    });
  }
});

export default router;