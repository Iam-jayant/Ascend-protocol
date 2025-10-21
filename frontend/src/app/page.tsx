"use client";

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Ascend Protocol
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            India&apos;s First Crypto Inheritance Protocol
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Secure your crypto assets for your loved ones with automated inheritance management and UPI payouts.
          </p>

          <div className="space-y-4">
            <Link 
              href="/dashboard" 
              className="btn-primary inline-block"
            >
              Go to Dashboard
            </Link>
            <p className="text-sm text-gray-500">
              Connect your wallet to create and manage your crypto inheritance vaults.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold">🔒</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Dead Man Switch</h3>
            <p className="text-gray-600 text-sm">
              Automated inheritance trigger with configurable check-in periods.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 font-bold">👥</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Multi-Beneficiary</h3>
            <p className="text-gray-600 text-sm">
              Distribute assets among multiple beneficiaries with custom splits.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 font-bold">💰</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">UPI Integration</h3>
            <p className="text-gray-600 text-sm">
              Seamless crypto to INR conversion with direct UPI payouts.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}