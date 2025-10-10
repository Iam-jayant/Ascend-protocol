import express from 'express';
import { query } from '../config/database-supabase.js';

const router = express.Router();

// Mock auth routes for demo purposes
router.post('/nonce', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required'
      });
    }

    // Generate a mock nonce
    const nonce = Math.random().toString(36).substring(2, 15);
    
    res.json({
      success: true,
      data: {
        nonce,
        message: 'Sign this message to authenticate'
      }
    });
  } catch (error) {
    console.error('Error generating nonce:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;
    
    if (!walletAddress || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address and signature are required'
      });
    }

    // Mock verification - always return success for demo
    const token = 'mock-jwt-token-' + Date.now();
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: 'user-' + Date.now(),
          walletAddress,
          email: null,
          phone: null,
          createdAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error verifying signature:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.get('/me', async (req, res) => {
  try {
    // Mock user data
    res.json({
      success: true,
      data: {
        id: 'user-123',
        walletAddress: '0x1234567890123456789012345678901234567890',
        email: null,
        phone: null,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
