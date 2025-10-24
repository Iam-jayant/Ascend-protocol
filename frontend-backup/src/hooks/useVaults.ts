import { useState, useEffect, useCallback, useRef } from 'react';
import { vaultAPI, Vault, Beneficiary, CreateVaultRequest, AddBeneficiaryRequest, UpdateBeneficiaryRequest } from '@/lib/api';

export function useVaults() {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchTime = useRef<number>(0);
  const THROTTLE_MS = 3000; // 3 seconds between requests

  // Fetch vaults with throttling
  const fetchVaults = useCallback(async (page = 1, limit = 10) => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime.current;
    
    if (timeSinceLastFetch < THROTTLE_MS) {
      console.log('📦 Throttling vault fetch request (too soon)...');
      return { vaults: [] };
    }

    lastFetchTime.current = now;
    setLoading(true);
    setError(null);

    try {
      console.log('📦 Fetching vaults...');
      const response = await vaultAPI.getVaults(page, limit);
      console.log('📦 Vaults response:', response);
      
      if (response.success) {
        setVaults(response.data.vaults);
        return response.data;
      } else {
        console.log('📦 Vaults fetch failed:', response.message);
        setError(response.message || 'Failed to fetch vaults');
        setVaults([]); // Set empty array instead of throwing
        return { vaults: [] };
      }
    } catch (err: any) {
      console.log('📦 Vaults fetch error:', err);
      const errorMessage = err.message || 'Failed to fetch vaults';
      setError(errorMessage);
      setVaults([]); // Set empty array instead of throwing
      return { vaults: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create vault
  const createVault = async (data: CreateVaultRequest) => {
    console.log('🔧 useVaults: Starting vault creation with data:', data);
    setLoading(true);
    setError(null);

    try {
      console.log('📡 useVaults: Calling vaultAPI.createVault...');
      const response = await vaultAPI.createVault(data);
      console.log('📡 useVaults: API response:', response);
      
      if (response.success) {
        console.log('✅ useVaults: Vault created successfully, updating state...');
        // Add new vault to list
        setVaults(prev => [response.data.vault, ...prev]);
        console.log('✅ useVaults: Returning data:', response.data);
        return response.data;
      } else {
        console.error('❌ useVaults: API returned success: false');
        throw new Error(response.message || 'Failed to create vault');
      }
    } catch (err: any) {
      console.error('❌ useVaults: Error occurred:', err);
      const errorMessage = err.message || 'Failed to create vault';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get vault details
  const getVault = async (vaultId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await vaultAPI.getVault(vaultId);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch vault');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch vault';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Check in to vault
  const checkIn = async (vaultId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await vaultAPI.checkIn(vaultId);
      if (response.success) {
        // Update vault in list
        setVaults(prev => prev.map(vault => 
          vault.id === vaultId 
            ? { ...vault, lastCheckIn: response.data.lastCheckIn }
            : vault
        ));
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to check in');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to check in';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Add beneficiary
  const addBeneficiary = async (vaultId: string, data: AddBeneficiaryRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await vaultAPI.addBeneficiary(vaultId, data);
      if (response.success) {
        // Refresh vaults to get updated beneficiary count
        await fetchVaults();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to add beneficiary');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add beneficiary';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update beneficiary
  const updateBeneficiary = async (vaultId: string, beneficiaryId: string, data: UpdateBeneficiaryRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await vaultAPI.updateBeneficiary(vaultId, beneficiaryId, data);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update beneficiary');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update beneficiary';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Remove beneficiary
  const removeBeneficiary = async (vaultId: string, beneficiaryId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await vaultAPI.removeBeneficiary(vaultId, beneficiaryId);
      if (response.success) {
        // Refresh vaults to get updated beneficiary count
        await fetchVaults();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to remove beneficiary');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to remove beneficiary';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    vaults,
    loading,
    error,
    fetchVaults,
    createVault,
    getVault,
    checkIn,
    addBeneficiary,
    updateBeneficiary,
    removeBeneficiary,
  };
}
