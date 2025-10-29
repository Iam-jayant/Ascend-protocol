import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected, metaMask } from 'wagmi/connectors';

// Simplified configuration for better performance - only Sepolia
export const ASCEND_ADDRESSES = {
  [sepolia.id]: {
    factory: "0xa3C193E814D17fB7536450DebcEC3bF8FA65C5cF",
    priceOracle: "0x1cad2202F3c916209D7cF54c9E0Fef67e75b3997",
    liquidationEngine: "0xc34E4E65023613f7b841E08b10eBDCC33EAcE541",
    upiBridge: "0x988708C9aBaE80Ece464ad573DBc0b78F1981A4e",
  },
};

export function getAscendAddressesForChain(chainId: number) {
  return ASCEND_ADDRESSES[chainId as keyof typeof ASCEND_ADDRESSES] || ASCEND_ADDRESSES[sepolia.id];
}

export const wagmiConfig = createConfig({
  chains: [sepolia], // Only Sepolia for better performance
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [sepolia.id]: http("https://ethereum-sepolia.publicnode.com"),
  },
});
