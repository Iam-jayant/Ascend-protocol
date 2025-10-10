import axios from 'axios';

// API configuration
const API_BASE_URL = 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token (optional)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    console.log('🌐 API Request - URL:', config.url);
    console.log('🌐 API Request - Token exists:', !!token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🌐 API Request - Authorization header set');
    } else {
      console.log('🌐 API Request - No token, proceeding without auth');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    // Don't auto-redirect on 401 errors - let components handle it
    if (error.response?.status === 401) {
      console.log('🔐 401 Unauthorized - Token may be invalid, but not redirecting');
      // Only clear token, don't redirect
      localStorage.removeItem('accessToken');
    }
    
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  walletAddress: string;
  email?: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Vault {
  id: string;
  address: string;
  checkInPeriod: number;
  gracePeriod: number;
  lastCheckIn: string;
  isTriggered: boolean;
  triggeredAt?: string;
  beneficiaryCount: number;
  totalSharePercentage: number;
  createdAt: string;
  canTrigger?: boolean;
  timeRemaining?: string;
  vaultBalance?: string;
}

export interface Beneficiary {
  id: string;
  walletAddress: string;
  sharePercentage: number;
  email?: string;
  phone?: string;
  name?: string;
  createdAt: string;
}

export interface CreateVaultRequest {
  checkInPeriod: number;
  gracePeriod: number;
}

export interface AddBeneficiaryRequest {
  walletAddress: string;
  sharePercentage: number;
  email?: string;
  phone?: string;
  name?: string;
}

export interface UpdateBeneficiaryRequest {
  sharePercentage: number;
}

export interface ClaimToken {
  claimToken: string;
  vaultAddress: string;
  beneficiaryWallet: string;
  sharePercentage: number;
  triggeredAt: string;
  ownerWallet: string;
  expiresAt: string;
}

export interface BankDetails {
  upiId: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  phone?: string;
}

export interface Payout {
  id: string;
  payoutId: string;
  usdcAmount: string;
  inrAmount: string;
  status: string;
  initiatedAt: string;
}

// Auth API
export const authAPI = {
  // Get nonce for wallet authentication
  getNonce: async (walletAddress: string) => {
    const response = await api.post('/api/auth/nonce', {
      walletAddress,
    });
    return response.data;
  },

  // Verify wallet signature
  verifySignature: async (walletAddress: string, signature: string) => {
    const response = await api.post('/api/auth/verify', {
      walletAddress,
      signature,
    });
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// Vault API
export const vaultAPI = {
  // Create vault
  createVault: async (data: CreateVaultRequest) => {
    console.log('🌐 vaultAPI: Creating vault with data:', data);
    try {
      const response = await api.post('/api/vaults', data);
      console.log('🌐 vaultAPI: Raw response:', response);
      console.log('🌐 vaultAPI: Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('🌐 vaultAPI: Error creating vault:', error);
      throw error;
    }
  },

  // Get user's vaults
  getVaults: async (page = 1, limit = 10) => {
    const response = await api.get(`/api/vaults?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get vault details
  getVault: async (vaultId: string) => {
    const response = await api.get(`/api/vaults/${vaultId}`);
    return response.data;
  },

  // Check in to vault
  checkIn: async (vaultId: string) => {
    const response = await api.post(`/api/vaults/${vaultId}/check-in`);
    return response.data;
  },

  // Add beneficiary
  addBeneficiary: async (vaultId: string, data: AddBeneficiaryRequest) => {
    const response = await api.post(`/api/vaults/${vaultId}/beneficiaries`, data);
    return response.data;
  },

  // Update beneficiary
  updateBeneficiary: async (vaultId: string, beneficiaryId: string, data: UpdateBeneficiaryRequest) => {
    const response = await api.put(`/api/vaults/${vaultId}/beneficiaries/${beneficiaryId}`, data);
    return response.data;
  },

  // Remove beneficiary
  removeBeneficiary: async (vaultId: string, beneficiaryId: string) => {
    const response = await api.delete(`/api/vaults/${vaultId}/beneficiaries/${beneficiaryId}`);
    return response.data;
  },
};

// Claims API
export const claimsAPI = {
  // Validate claim token
  validateClaimToken: async (token: string) => {
    const response = await api.get(`/api/claim/${token}`);
    return response.data;
  },

  // Send OTP
  sendOTP: async (token: string, phone: string) => {
    const response = await api.post(`/api/claim/${token}/send-otp`, { phone });
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (token: string, otpCode: string) => {
    const response = await api.post(`/api/claim/${token}/verify`, { otpCode });
    return response.data;
  },

  // Submit bank details
  submitBankDetails: async (token: string, data: BankDetails) => {
    const response = await api.post(`/api/claim/${token}/bank-details`, data);
    return response.data;
  },

  // Check balance
  getBalance: async (token: string) => {
    const response = await api.get(`/api/claim/${token}/balance`);
    return response.data;
  },

  // Initiate withdrawal
  initiateWithdrawal: async (token: string) => {
    const response = await api.post(`/api/claim/${token}/withdraw`);
    return response.data;
  },

  // Get claim status
  getClaimStatus: async (token: string) => {
    const response = await api.get(`/api/claim/${token}/status`);
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
