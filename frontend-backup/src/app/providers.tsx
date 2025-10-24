// frontend/src/app/providers.tsx

"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
// import { metaMask } from 'wagmi/connectors'; // <-- REMOVED
import { useState } from 'react';

import '@rainbow-me/rainbowkit/styles.css';

// Minimal configuration to avoid wallet conflicts
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

const config = getDefaultConfig({
  appName: 'Ascend Protocol',
  projectId: projectId,
  chains: [sepolia],
  // REMOVED the explicit 'connectors' array. 
  // getDefaultConfig now automatically includes WalletConnect, Injected, MetaMask, etc.
});

export function Providers({ children }: { children: React.ReactNode }) {
// ... (rest of the code is unchanged)
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}