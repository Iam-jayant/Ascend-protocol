"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircleIcon, ExclamationTriangleIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { claimsAPI, ClaimToken, BankDetails, Payout } from '@/lib/api';

interface ClaimData extends ClaimToken {
  status: 'pending' | 'verified' | 'completed';
}

export default function ClaimPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    upiId: '',
    bankAccountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    phone: ''
  });
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const fetchClaimData = async () => {
      try {
        const response = await claimsAPI.validateClaimToken(token);
        if (response.success) {
          setClaimData({
            ...response.data,
            status: 'pending'
          });
        } else {
          setClaimData(null);
        }
      } catch (error) {
        console.error('Error fetching claim data:', error);
        setClaimData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchClaimData();
  }, [token]);

  const handleSendOTP = async () => {
    if (!claimData) return;
    
    setVerifying(true);
    try {
      const response = await claimsAPI.sendOTP(token, claimData.beneficiaryWallet);
      if (response.success) {
        setOtpSent(true);
      } else {
        throw new Error(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyOTP = async () => {
    setVerifying(true);
    try {
      const response = await claimsAPI.verifyOTP(token, otp);
      if (response.success) {
        setStep(2);
      } else {
        throw new Error(response.message || 'Failed to verify OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmitBankDetails = async () => {
    setVerifying(true);
    try {
      const response = await claimsAPI.submitBankDetails(token, bankDetails);
      if (response.success) {
        setStep(3);
      } else {
        throw new Error(response.message || 'Failed to submit bank details');
      }
    } catch (error) {
      console.error('Error submitting bank details:', error);
    } finally {
      setVerifying(false);
    }
  };

  const handleWithdraw = async () => {
    setVerifying(true);
    try {
      const response = await claimsAPI.initiateWithdrawal(token);
      if (response.success) {
        setStep(4);
      } else {
        throw new Error(response.message || 'Failed to initiate withdrawal');
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading claim details...</p>
        </div>
      </div>
    );
  }

  if (!claimData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Claim Token</h1>
          <p className="text-gray-600">The claim token you provided is invalid or has expired.</p>
        </div>
      </div>
    );
  }

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
                    <p className="text-xl font-bold text-blue-900">{claimData.sharePercentage / 100}%</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-700">Beneficiary Wallet:</span>
                    <p className="text-sm text-blue-900 font-mono">{claimData.beneficiaryWallet}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-700">Vault Address:</span>
                    <p className="text-sm text-blue-900 font-mono">{claimData.vaultAddress}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-700">Expires:</span>
                    <p className="text-sm text-blue-900">
                      {new Date(claimData.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beneficiary Wallet
                  </label>
                  <input
                    type="text"
                    value={claimData.beneficiaryWallet}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                    />
                    <button
                      onClick={handleSendOTP}
                      disabled={verifying || otpSent}
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {verifying ? 'Sending...' : otpSent ? 'Sent' : 'Send OTP'}
                    </button>
                  </div>
                  {otpSent && (
                    <p className="text-sm text-green-600 mt-1">
                      Verification code sent to your registered phone number
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={handleVerifyOTP}
                  disabled={!otp || otp.length !== 6 || verifying}
                  className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {verifying ? 'Verifying...' : 'Verify & Continue'}
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
                    value={bankDetails.upiId}
                    onChange={(e) => setBankDetails({...bankDetails, upiId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      value={bankDetails.accountHolderName}
                      onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your Full Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={bankDetails.bankAccountNumber}
                      onChange={(e) => setBankDetails({...bankDetails, bankAccountNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      value={bankDetails.phone}
                      onChange={(e) => setBankDetails({...bankDetails, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={bankDetails.ifscCode}
                      onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitBankDetails}
                  disabled={!bankDetails.upiId || !bankDetails.accountHolderName || !bankDetails.bankAccountNumber || !bankDetails.ifscCode || verifying}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {verifying ? 'Saving...' : 'Save & Continue'}
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
                    <p className="text-2xl font-bold text-green-900">{claimData.sharePercentage / 100}%</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-green-700">Amount to Receive:</span>
                    <p className="text-2xl font-bold text-green-900">₹{Math.floor(parseFloat(claimData.sharePercentage) * 1000)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-green-700">UPI ID:</span>
                    <p className="text-sm text-green-900 font-mono">{bankDetails.upiId}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-green-700">Account Holder:</span>
                    <p className="text-sm text-green-900">{bankDetails.accountHolderName}</p>
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

              <div className="flex justify-center">
                <button
                  onClick={handleWithdraw}
                  disabled={verifying}
                  className="px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  <BanknotesIcon className="w-6 h-6 mr-2" />
                  {verifying ? 'Processing Withdrawal...' : 'Withdraw Now'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="p-8 text-center">
              <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Withdrawal Initiated!</h2>
              <p className="text-gray-600 mb-8">
                Your inheritance withdrawal has been processed successfully. 
                You will receive the funds in your UPI account within 24-48 hours.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Transaction Details</h3>
                <div className="text-sm text-green-800 space-y-1">
                  <p>Amount: ₹{Math.floor(parseFloat(claimData.sharePercentage) * 1000)}</p>
                  <p>UPI ID: {bankDetails.upiId}</p>
                  <p>Transaction ID: TXN{Date.now()}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                You will receive SMS and email notifications once the transfer is complete.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
