"use client";

import { useState } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, BanknotesIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function StaticClaimPage() {
  const [step, setStep] = useState(1);

  // Mock claim data for demonstration
  const mockClaimData = {
    claimToken: 'test-token-123',
    sharePercentage: 50,
    beneficiaryWallet: '0x1111111111111111111111111111111111111111',
    vaultAddress: '0x1234567890123456789012345678901234567890',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    amount: '1000.00'
  };

  const mockBankDetails = {
    upiId: 'test@paytm',
    accountHolderName: 'Test Beneficiary',
    bankAccountNumber: '1234567890',
    ifscCode: 'SBIN0001234',
    phone: '+91 9876543210'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ascend Protocol
            </span>
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
              <span className="font-medium">Verify</span>
            </div>
            <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className="font-medium">Bank Details</span>
            </div>
            <div className={`w-16 h-0.5 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
              <span className="font-medium">Withdraw</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          {/* Step 1: Verification */}
          {step === 1 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Claim Your Inheritance</h1>
                <p className="text-gray-600">You have been designated as a beneficiary for a crypto inheritance vault</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Inheritance Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-blue-700">Your Share:</span>
                    <p className="text-xl font-bold text-blue-900">{mockClaimData.sharePercentage}%</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-700">Amount:</span>
                    <p className="text-xl font-bold text-blue-900">₹{mockClaimData.amount}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-700">Beneficiary Wallet:</span>
                    <p className="text-sm text-blue-900 font-mono">{mockClaimData.beneficiaryWallet}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-700">Vault Address:</span>
                    <p className="text-sm text-blue-900 font-mono">{mockClaimData.vaultAddress}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-700">Claim Token:</span>
                    <p className="text-sm text-blue-900 font-mono">{mockClaimData.claimToken}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-700">Expires:</span>
                    <p className="text-sm text-blue-900">
                      {new Date(mockClaimData.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-600 mr-2" />
                  <h4 className="text-sm font-medium text-green-800">Claim Verified Successfully</h4>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your claim token has been validated. You can proceed to provide your bank details.
                </p>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Continue to Bank Details
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Bank Details */}
          {step === 2 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Bank Details for UPI Payout</h2>
                <p className="text-gray-600">Provide your bank details to receive the inheritance via UPI</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    value={mockBankDetails.upiId}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    placeholder="yourname@paytm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={mockBankDetails.accountHolderName}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      placeholder="Your Full Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={mockBankDetails.bankAccountNumber}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      placeholder="1234567890"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={mockBankDetails.phone}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={mockBankDetails.ifscCode}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      placeholder="SBIN0001234"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Security Notice:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Your bank details are encrypted and stored securely</li>
                  <li>• We only use this information for UPI payouts</li>
                  <li>• You can update these details anytime</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex items-center">
                  <ClockIcon className="w-6 h-6 text-blue-600 mr-2" />
                  <h4 className="text-sm font-medium text-blue-800">Demo Mode</h4>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  This is a static demonstration. Bank details are pre-filled for display purposes.
                </p>
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
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Continue to Withdrawal
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Withdrawal */}
          {step === 3 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Withdraw</h2>
                <p className="text-gray-600">Review your inheritance details and initiate withdrawal</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-green-600 mr-3" />
                  <h3 className="text-lg font-semibold text-green-900">Inheritance Ready</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-green-700">Your Share:</span>
                    <p className="text-2xl font-bold text-green-900">{mockClaimData.sharePercentage}%</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-green-700">Amount to Receive:</span>
                    <p className="text-2xl font-bold text-green-900">₹{mockClaimData.amount}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-green-700">UPI ID:</span>
                    <p className="text-sm text-green-900 font-mono">{mockBankDetails.upiId}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-green-700">Account Holder:</span>
                    <p className="text-sm text-green-900">{mockBankDetails.accountHolderName}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Withdrawal Process:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Your crypto will be converted to INR using current market rates</li>
                  <li>• Funds will be transferred to your UPI ID within 24-48 hours</li>
                  <li>• You&apos;ll receive SMS and email notifications for the transaction</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mr-2" />
                  <h4 className="text-sm font-medium text-yellow-800">Demo Mode</h4>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  This is a static demonstration. The withdrawal functionality is not implemented yet.
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  disabled
                  className="px-8 py-4 bg-gray-400 text-white font-semibold rounded-lg cursor-not-allowed flex items-center"
                >
                  <BanknotesIcon className="w-6 h-6 mr-2" />
                  Withdrawal (Coming Soon)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Demo Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">📧 Email Integration Working!</h3>
          <p className="text-sm text-blue-700">
            The email service is fully functional. You received this claim page link via email. 
            The next steps (OTP verification, bank details submission, and withdrawal processing) 
            are not yet implemented but the UI flow is complete.
          </p>
        </div>
      </div>
    </div>
  );
}
