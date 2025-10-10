import { useState, useEffect, useRef } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { authAPI, User } from '@/lib/api';

export function useAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authAttemptRef = useRef<boolean>(false);

  // Check if user is authenticated
  const isAuthenticated = !!user && isConnected;

  // Authenticate with wallet signature
  const authenticate = async () => {
    if (!address || !isConnected) {
      throw new Error('Wallet not connected');
    }

    if (loading || authAttemptRef.current) {
      return; // Prevent multiple authentication attempts
    }

    authAttemptRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('🔐 Starting authentication for:', address);
      
      // 1. Get nonce from backend
      console.log('📡 Requesting nonce...');
      const nonceResponse = await authAPI.getNonce(address);
      console.log('📡 Nonce response:', nonceResponse);
      
      if (!nonceResponse.success) {
        throw new Error(nonceResponse.message || 'Failed to get nonce');
      }

      // 2. Sign the nonce message
      console.log('✍️ Signing message...');
      const signature = await signMessageAsync({
        message: nonceResponse.nonce
      });
      console.log('✍️ Signature received:', signature);

      // 3. Verify signature with backend
      console.log('🔍 Verifying signature...');
      const verifyResponse = await authAPI.verifySignature(address, signature);
      console.log('🔍 Verify response:', verifyResponse);
      
      if (!verifyResponse.success) {
        throw new Error(verifyResponse.message || 'Failed to verify signature');
      }

      // 4. Store JWT token
      localStorage.setItem('accessToken', verifyResponse.token);
      console.log('💾 Token stored');

      // 5. Set user
      setUser(verifyResponse.user);
      console.log('✅ Authentication successful');

      return verifyResponse;
    } catch (err: any) {
      console.error('❌ Authentication error:', err);

      // Handle specific error types
      if (err.message?.includes('User rejected')) {
        throw new Error('Please sign the message to authenticate');
      } else if (err.message?.includes('Request failed with status code 500')) {
        throw new Error('Server error. Please try again.');
      } else if (err.message?.includes('Request failed with status code 429')) {
        throw new Error('Too many requests. Please wait a moment.');
      }

      const errorMessage = err.message || 'Authentication failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
      authAttemptRef.current = false;
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Clear tokens
      localStorage.removeItem('accessToken');
      
      // Clear user state
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check existing authentication
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      console.log('🔍 Checking auth - Token exists:', !!token);
      console.log('🔍 Checking auth - Token value:', token ? token.substring(0, 20) + '...' : 'null');
      console.log('🔍 Checking auth - isConnected:', isConnected);
      console.log('🔍 Checking auth - address:', address);
      
      if (token && isConnected && address) {
        try {
          console.log('🔍 Checking existing authentication...');
          const response = await authAPI.getMe();
          console.log('🔍 Auth check response:', response);
          if (response.success) {
            console.log('✅ Existing authentication valid');
            setUser(response.user);
          } else {
            console.log('❌ Existing authentication invalid, clearing token');
            localStorage.removeItem('accessToken');
            setUser(null);
          }
        } catch (err) {
          console.log('❌ Authentication check failed, clearing token:', err);
          localStorage.removeItem('accessToken');
          setUser(null);
        }
      } else if (!isConnected) {
        // Clear user when wallet disconnects
        console.log('🔌 Wallet disconnected, clearing user state');
        setUser(null);
        localStorage.removeItem('accessToken');
      }
    };

    // Only check auth when wallet connection status changes
    if (isConnected !== undefined) {
      checkAuth();
    }
  }, [isConnected, address]); // Added address dependency

  // Clear user when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }, [isConnected]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    authenticate,
    logout,
  };
}
