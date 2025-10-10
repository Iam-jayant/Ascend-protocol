import express from 'express';
import { query } from '../config/database-supabase.js';

const router = express.Router();

// Mock claims routes for demo purposes
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Mock claim token validation
    res.json({
      success: true,
      data: {
        claimToken: token,
        vaultAddress: '0x1234567890123456789012345678901234567890',
        beneficiaryWallet: '0x1111111111111111111111111111111111111111',
        sharePercentage: 50,
        triggeredAt: new Date().toISOString(),
        ownerWallet: '0x2222222222222222222222222222222222222222',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
  } catch (error) {
    console.error('Error validating claim token:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/:token/send-otp', async (req, res) => {
  try {
    const { token } = req.params;
    const { phone } = req.body;
    
    // Mock OTP sending
    res.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/:token/verify', async (req, res) => {
  try {
    const { token } = req.params;
    const { otpCode } = req.body;
    
    // Mock OTP verification
    res.json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/:token/bank-details', async (req, res) => {
  try {
    const { token } = req.params;
    const bankDetails = req.body;
    
    // Mock bank details submission
    res.json({
      success: true,
      message: 'Bank details submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting bank details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.get('/:token/balance', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Mock balance check
    res.json({
      success: true,
      data: {
        balance: '1000.00',
        currency: 'USDC'
      }
    });
  } catch (error) {
    console.error('Error checking balance:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/:token/withdraw', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Mock withdrawal initiation
    res.json({
      success: true,
      message: 'Withdrawal initiated successfully',
      data: {
        transactionId: 'txn-' + Date.now(),
        amount: '1000.00',
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Error initiating withdrawal:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.get('/:token/status', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Mock claim status
    res.json({
      success: true,
      data: {
        status: 'pending',
        amount: '1000.00',
        currency: 'USDC'
      }
    });
  } catch (error) {
    console.error('Error getting claim status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
