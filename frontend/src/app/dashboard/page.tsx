"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useVaults } from '@/hooks/useVaults';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { vaults, loading: vaultsLoading, fetchVaults } = useVaults();

  // Fetch vaults when wallet is connected (no authentication required)
  useEffect(() => {
    if (isConnected && address) {
      console.log('📦 Dashboard: Wallet connected, fetching vaults...');
      
      // Add a small delay to prevent rapid calls
      const timeoutId = setTimeout(() => {
        fetchVaults().catch((error) => {
          console.log('📦 Dashboard: Failed to fetch vaults:', error);
          // Don't redirect, just show error
        });
      }, 1000); // 1 second delay
      
      return () => clearTimeout(timeoutId);
    }
  }, [isConnected, address, fetchVaults]);

  const getVaultStatus = (vault: any) => {
    if (vault.isTriggered) {
      return { status: 'triggered', color: 'status-expired', text: 'Triggered' };
    }
    
    const lastCheckIn = new Date(vault.lastCheckIn);
    const now = new Date();
    const daysSinceCheckIn = Math.floor((now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceCheckIn > vault.checkInPeriod + vault.gracePeriod) {
      return { status: 'expired', color: 'status-expired', text: 'Expired' };
    } else if (daysSinceCheckIn > vault.checkInPeriod) {
      return { status: 'warning', color: 'status-warning', text: 'Warning' };
    } else {
      return { status: 'active', color: 'status-active', text: 'Active' };
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to access the dashboard
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (vaultsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vaults...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  Ascend Protocol
                </span>
              </Link>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your crypto inheritance vaults
          </p>
        </div>

        {/* Create Vault Button */}
        <div className="mb-8">
          <Link 
            href="/vault/create" 
            className="btn-primary inline-block"
          >
            Create New Vault
          </Link>
        </div>

        {/* Vaults List */}
        <div className="space-y-4">
          {vaults.length === 0 ? (
            <div className="card text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Vaults Found
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first crypto inheritance vault to get started.
              </p>
              <Link href="/vault/create" className="btn-primary">
                Create Vault
              </Link>
            </div>
          ) : (
            vaults.map((vault: any) => {
              const status = getVaultStatus(vault);
              return (
                <div key={vault.id} className="card">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Vault #{vault.id.slice(0, 8)}
                        </h3>
                        <span className={status.color}>
                          {status.text}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Address: {vault.vaultAddress}</p>
                        <p>Check-in Period: {vault.checkInPeriod} days</p>
                        <p>Grace Period: {vault.gracePeriod} days</p>
                        <p>Last Check-in: {new Date(vault.lastCheckIn).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link 
                        href={`/vault/${vault.id}`}
                        className="btn-secondary text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}