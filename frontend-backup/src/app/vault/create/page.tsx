"use client";

import { useState, useEffect } from 'react';
import ConnectMetaMaskButton from '@/components/ConnectMetaMaskButton';
import { useAccount, useChainId, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useVaults } from '@/hooks/useVaults';
import { useRouter } from 'next/navigation';

interface Beneficiary {
  id: string;
  email: string;
  phone: string;
  percentage: number;
}

export default function CreateVault() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const router = useRouter();
  const { createVault, loading: vaultLoading, error } = useVaults();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Fetch wallet balance
  const { data: ethBalance, isLoading: ethBalanceLoading } = useBalance({
    address: address,
  });

  // USDC token address on Sepolia (for demo)
  const USDC_ADDRESS = '0x6f14c02fc1f78322cfd7d707ab90f18bad3b54f5'; // Mock USDC address
  
  const { data: usdcBalance, isLoading: usdcBalanceLoading } = useBalance({
    address: address,
    token: USDC_ADDRESS as `0x${string}`,
  });
  
  // Vault configuration
  const [checkInPeriod, setCheckInPeriod] = useState(30);
  const [gracePeriod, setGracePeriod] = useState(7);
  const [timeUnit, setTimeUnit] = useState('days'); // 'days' or 'minutes' for testing
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    { id: '1', email: '', phone: '', percentage: 50 }
  ]);

  const addBeneficiary = () => {
    const newId = (beneficiaries.length + 1).toString();
    setBeneficiaries([...beneficiaries, { id: newId, email: '', phone: '', percentage: 0 }]);
  };

  const removeBeneficiary = (id: string) => {
    if (beneficiaries.length > 1) {
      setBeneficiaries(beneficiaries.filter(b => b.id !== id));
    }
  };

  const updateBeneficiary = (id: string, field: keyof Beneficiary, value: string | number) => {
    setBeneficiaries(beneficiaries.map(b => 
      b.id === id ? { ...b, [field]: value } : b
    ));
  };

  const calculateTotalPercentage = () => {
    return beneficiaries.reduce((total, b) => total + b.percentage, 0);
  };

  const handleCreateVault = async () => {
    // Temporarily bypass wallet connection check for testing
    // if (!isConnected) return;
    
    console.log('🚀 Starting vault creation...');
    console.log('🔌 Wallet connected:', isConnected);
    console.log('📍 Wallet address:', address);
    
    setLoading(true);
    try {
      // Create vault with backend
      const vaultData = {
        checkInPeriod: timeUnit === 'minutes' 
          ? checkInPeriod * 60 // Convert minutes to seconds
          : checkInPeriod * 24 * 60 * 60, // Convert days to seconds
        gracePeriod: timeUnit === 'minutes'
          ? gracePeriod * 60 // Convert minutes to seconds  
          : gracePeriod * 24 * 60 * 60, // Convert days to seconds
        timeUnit: timeUnit // Include time unit for backend
      };
      
      console.log('📦 Vault data:', vaultData);
      
      const result = await createVault(vaultData);
      console.log('✅ Vault creation result:', result);
      
      if (result && result.vault) {
        // Add beneficiaries one by one
        for (const beneficiary of beneficiaries) {
          if (beneficiary.email && beneficiary.phone && beneficiary.percentage > 0) {
            console.log('👥 Adding beneficiary:', beneficiary);
            await addBeneficiaryToVault(result.vault.id, beneficiary);
          }
        }
        
        console.log('🎯 Redirecting to dashboard...');
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        console.error('❌ Invalid result structure:', result);
      }
    } catch (error) {
      console.error('❌ Error creating vault:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBeneficiaryToVault = async (vaultId: string, beneficiary: Beneficiary) => {
    // This would be implemented in the useVaults hook
    // For now, we'll just log it
    console.log('Adding beneficiary to vault:', vaultId, beneficiary);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-8">Please connect your wallet to create a vault</p>
          <ConnectButton />
          <div className="mt-4">
            <p className="text-sm text-gray-500">Or continue without wallet connection (demo mode)</p>
            <button
              onClick={() => setStep(1)}
              className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Continue Demo
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center">
              <ConnectButton />
              <ConnectMetaMaskButton />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className="font-medium">Configuration</span>
            </div>
            <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className="font-medium">Beneficiaries</span>
            </div>
            <div className={`w-16 h-0.5 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
              <span className="font-medium">Review</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          {/* Step 1: Configuration */}
          {step === 1 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Vault Configuration</h2>
              
              {/* Wallet Balance Section */}
              {isConnected && address && (
                <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Your Wallet Balance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">ETH Balance</p>
                          {ethBalanceLoading ? (
                            <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>
                          ) : (
                            <p className="text-lg font-semibold text-gray-900">
                              {ethBalance ? `${parseFloat(ethBalance.formatted).toFixed(4)} ETH` : '0 ETH'}
                            </p>
                          )}
                        </div>
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">Ξ</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">USDC Balance</p>
                          {usdcBalanceLoading ? (
                            <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>
                          ) : (
                            <p className="text-lg font-semibold text-gray-900">
                              {usdcBalance ? `${parseFloat(usdcBalance.formatted).toFixed(2)} USDC` : '0 USDC'}
                            </p>
                          )}
                        </div>
                        <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600">$</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>How it works:</strong> Your vault will track your wallet balance. 
                      If the deadman switch is triggered, your current wallet balance will be 
                      automatically distributed to your beneficiaries based on their share percentages.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="space-y-6">
                {/* Time Unit Selector */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-yellow-800 mb-2">Testing Mode</h3>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="timeUnit"
                        value="days"
                        checked={timeUnit === 'days'}
                        onChange={(e) => setTimeUnit(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-yellow-700">Production (Days)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="timeUnit"
                        value="minutes"
                        checked={timeUnit === 'minutes'}
                        onChange={(e) => setTimeUnit(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-yellow-700">Testing (Minutes)</span>
                    </label>
                  </div>
                  <p className="text-xs text-yellow-600 mt-2">
                    Use minutes for testing deadman switch functionality quickly
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in Period ({timeUnit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={timeUnit === 'minutes' ? "60" : "365"}
                    value={checkInPeriod}
                    onChange={(e) => setCheckInPeriod(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={timeUnit === 'minutes' ? "5" : "30"}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    How often you need to check in to keep the vault active
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grace Period ({timeUnit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={timeUnit === 'minutes' ? "30" : "30"}
                    value={gracePeriod}
                    onChange={(e) => setGracePeriod(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={timeUnit === 'minutes' ? "2" : "7"}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Extra time after missing a check-in before the vault triggers
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">How it works:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• You must check in every {checkInPeriod} {timeUnit} to keep the vault active</li>
                    <li>• If you miss a check-in, you have {gracePeriod} {timeUnit} to catch up</li>
                    <li>• After the grace period, the vault will automatically distribute assets to beneficiaries</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Next: Add Beneficiaries
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Beneficiaries */}
          {step === 2 && (
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Beneficiaries</h2>
                <button
                  onClick={addBeneficiary}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Beneficiary
                </button>
              </div>

              <div className="space-y-4">
                {beneficiaries.map((beneficiary) => (
                  <div key={beneficiary.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Beneficiary {beneficiary.id}
                      </h3>
                      {beneficiaries.length > 1 && (
                        <button
                          onClick={() => removeBeneficiary(beneficiary.id)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors duration-200"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={beneficiary.email}
                          onChange={(e) => updateBeneficiary(beneficiary.id, 'email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="family@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={beneficiary.phone}
                          onChange={(e) => updateBeneficiary(beneficiary.id, 'phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="+91 9876543210"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Percentage (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={beneficiary.percentage}
                          onChange={(e) => updateBeneficiary(beneficiary.id, 'percentage', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="50"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total Percentage:</span>
                  <span className={`text-lg font-bold ${calculateTotalPercentage() === 100 ? 'text-green-600' : 'text-red-600'}`}>
                    {calculateTotalPercentage()}%
                  </span>
                </div>
                {calculateTotalPercentage() !== 100 && (
                  <p className="text-sm text-red-600 mt-1">
                    Total percentage must equal 100%
                  </p>
                )}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={calculateTotalPercentage() !== 100}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Next: Review
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Create Vault</h2>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Vault Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Check-in Period:</span>
                      <p className="text-lg font-semibold text-gray-900">{checkInPeriod} days</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Grace Period:</span>
                      <p className="text-lg font-semibold text-gray-900">{gracePeriod} days</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Beneficiaries ({beneficiaries.length})</h3>
                  <div className="space-y-3">
                    {beneficiaries.map((beneficiary) => (
                      <div key={beneficiary.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-900">{beneficiary.email}</p>
                          <p className="text-sm text-gray-600">{beneficiary.phone}</p>
                        </div>
                        <span className="text-lg font-semibold text-blue-600">{beneficiary.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">Important:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Make sure to check in regularly to keep your vault active</li>
                    <li>• You can add more beneficiaries later</li>
                    <li>• Vault settings can be updated after creation</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateVault}
                  disabled={loading}
                  className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Vault...' : 'Create Vault'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
