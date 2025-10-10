"use client";

import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ArrowLeftIcon, PlusIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useVaults } from '@/hooks/useVaults';
import { useParams } from 'next/navigation';

interface Beneficiary {
  id: string;
  email: string;
  phone: string;
  percentage: number;
}

export default function VaultDetails() {
  const { address, isConnected } = useAccount();
  const params = useParams();
  const vaultId = params.id as string;
  const { getVault, loading, error } = useVaults();
  const [vault, setVault] = useState<any>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(true);

  // USDC token address for balance checking
  const USDC_ADDRESS = '0x6f14c02fc1f78322cfd7d707ab90f18bad3b54f5';
  
  // Fetch vault balance (if vault address is available)
  const { data: vaultEthBalance, isLoading: vaultEthBalanceLoading } = useBalance({
    address: vault?.address as `0x${string}`,
  });

  const { data: vaultUsdcBalance, isLoading: vaultUsdcBalanceLoading } = useBalance({
    address: vault?.address as `0x${string}`,
    token: USDC_ADDRESS as `0x${string}`,
  });

  useEffect(() => {
    if (vaultId) {
      loadVaultDetails();
    }
  }, [vaultId]);

  const loadVaultDetails = async () => {
    try {
      setLoadingDetails(true);
      const result = await getVault(vaultId);
      console.log('Vault details loaded:', result);
      
      if (result && result.vault) {
        setVault(result.vault);
        setBeneficiaries(result.beneficiaries || []);
      }
    } catch (error) {
      console.error('Error loading vault details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getVaultStatus = (vault: any) => {
    if (vault.isTriggered) {
      return { status: 'triggered', color: 'bg-red-100 text-red-800', text: 'Triggered' };
    }
    
    const lastCheckIn = new Date(vault.lastCheckIn);
    const now = new Date();
    const daysSinceCheckIn = Math.floor((now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceCheckIn > vault.checkInPeriod + vault.gracePeriod) {
      return { status: 'expired', color: 'bg-red-100 text-red-800', text: 'Expired' };
    } else if (daysSinceCheckIn > vault.checkInPeriod) {
      return { status: 'warning', color: 'bg-yellow-100 text-yellow-800', text: 'Warning' };
    } else {
      return { status: 'active', color: 'bg-green-100 text-green-800', text: 'Active' };
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
            Please connect your wallet to view vault details
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (loadingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading vault details...</p>
        </div>
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Vault Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The vault you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Link href="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const status = getVaultStatus(vault);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Vault #{vault.id.slice(0, 8)}
              </h1>
              <p className="text-gray-600">
                Manage your crypto inheritance vault
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
              {status.text}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vault Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Vault Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Vault Address</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{vault.address}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Check-in Period</label>
                <p className="mt-1 text-sm text-gray-900">{vault.checkInPeriod} days</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Grace Period</label>
                <p className="mt-1 text-sm text-gray-900">{vault.gracePeriod} days</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Check-in</label>
                <p className="mt-1 text-sm text-gray-900">{new Date(vault.lastCheckIn).toLocaleDateString()}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Created</label>
                <p className="mt-1 text-sm text-gray-900">{new Date(vault.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Check-in Button */}
            <div className="mt-6">
              <button
                className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                onClick={() => {
                  // TODO: Implement check-in functionality
                  console.log('Check-in clicked for vault:', vault.id);
                }}
              >
                <CheckIcon className="w-5 h-5 inline mr-2" />
                Check In
              </button>
            </div>

            {/* Trigger Vault Button (for testing) */}
            {!vault.isTriggered && (
              <div className="mt-4">
                <button
                  className="w-full px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
                  onClick={async () => {
                    try {
                      console.log('Triggering vault:', vault.id);
                      const response = await fetch(`/api/vaults/${vault.id}/trigger`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                      });
                      
                      if (response.ok) {
                        alert('Vault triggered! Email notifications sent to beneficiaries.');
                        // Reload vault details
                        loadVaultDetails();
                      } else {
                        alert('Failed to trigger vault');
                      }
                    } catch (error) {
                      console.error('Error triggering vault:', error);
                      alert('Error triggering vault');
                    }
                  }}
                >
                  🚨 Trigger Vault (Testing)
                </button>
              </div>
            )}

            {/* Send Credentials Button (for testing) */}
            <div className="mt-4">
              <button
                className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                onClick={async () => {
                  try {
                    console.log('Sending withdrawal credentials for vault:', vault.id);
                    const response = await fetch(`/api/vaults/${vault.id}/send-credentials`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        beneficiaryEmail: 'test@example.com',
                        claimToken: `claim-${Date.now()}`,
                        amount: '1000.00'
                      }),
                    });
                    
                    if (response.ok) {
                      alert('Withdrawal credentials sent via email!');
                    } else {
                      alert('Failed to send credentials');
                    }
                  } catch (error) {
                    console.error('Error sending credentials:', error);
                    alert('Error sending credentials');
                  }
                }}
              >
                📧 Send Test Credentials
              </button>
            </div>
          </div>

          {/* Beneficiaries */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Beneficiaries</h2>
              <button
                className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                onClick={() => {
                  // TODO: Implement add beneficiary functionality
                  console.log('Add beneficiary clicked for vault:', vault.id);
                }}
              >
                <PlusIcon className="w-4 h-4 inline mr-1" />
                Add
              </button>
            </div>

            {beneficiaries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No beneficiaries added yet</p>
                <button
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  onClick={() => {
                    // TODO: Implement add beneficiary functionality
                    console.log('Add first beneficiary clicked for vault:', vault.id);
                  }}
                >
                  Add First Beneficiary
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {beneficiaries.map((beneficiary) => (
                  <div key={beneficiary.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{beneficiary.email}</h3>
                        <p className="text-sm text-gray-600">{beneficiary.phone}</p>
                        <p className="text-sm text-blue-600 font-medium">{beneficiary.percentage}%</p>
                      </div>
                      <button
                        className="p-1 text-red-600 hover:text-red-800 transition-colors duration-200"
                        onClick={() => {
                          // TODO: Implement remove beneficiary functionality
                          console.log('Remove beneficiary clicked:', beneficiary.id);
                        }}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Blockchain Data */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Vault Balance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ETH Balance</label>
                  {vaultEthBalanceLoading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-20 rounded mt-1"></div>
                  ) : (
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {vaultEthBalance ? `${parseFloat(vaultEthBalance.formatted).toFixed(4)} ETH` : '0 ETH'}
                    </p>
                  )}
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">Ξ</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">USDC Balance</label>
                  {vaultUsdcBalanceLoading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-20 rounded mt-1"></div>
                  ) : (
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {vaultUsdcBalance ? `${parseFloat(vaultUsdcBalance.formatted).toFixed(2)} USDC` : '0 USDC'}
                    </p>
                  )}
                </div>
                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">$</span>
                </div>
              </div>
            </div>
          </div>
          
          {vault.timeRemaining && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">Time Remaining</h3>
              <p className="text-lg font-semibold text-yellow-900">{vault.timeRemaining}</p>
            </div>
          )}
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">How Inheritance Works</h3>
            <p className="text-sm text-blue-700 mb-2">
              Your vault tracks your wallet balance. When the deadman switch is triggered:
            </p>
            <ul className="text-xs text-blue-600 space-y-1 ml-4">
              <li>• Your current wallet balance is fetched automatically</li>
              <li>• Funds are distributed to beneficiaries based on their share percentages</li>
              <li>• No need to transfer funds to the vault beforehand</li>
              <li>• Works with ETH, USDC, and other tracked tokens</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
