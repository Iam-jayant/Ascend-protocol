"use client";

import { useConnect } from 'wagmi';
import { metaMask } from 'wagmi/connectors';

export default function ConnectMetaMaskButton() {
  const { connect, connectors, error } = useConnect();

  const handleConnect = async () => {
    try {
      await connect({ connector: metaMask() });
    } catch (err) {
      console.error('MetaMask connect error', err);
    }
  };

  return (
    <button
      onClick={handleConnect}
      className="ml-3 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      title="Connect MetaMask directly"
    >
      Connect MetaMask
    </button>
  );
}
