// backend/src/services/vaultMonitoringService.js

import cron from 'node-cron';
import { getVaultContract, contracts, getSigner, SEPOLIA_CONFIG } from '../config/blockchain';
// NOTE: Assuming your emailService and database service exist
import { sendInheritanceTriggerEmail } from './emailService'; 
// NOTE: Replace '../config/database' with your actual database file path (e.g., '../config/database-supabase')
import * as db from '../config/database'; 

// --- CRITICAL CONFIGURATION ---
// The USDC address the distributeFunds function in AscendVault is designed to handle
const USDC_ADDRESS = SEPOLIA_CONFIG.contracts.usdc;

/**
 * Executes the on-chain trigger and distribution transactions.
 * Requires the backend signer (hot wallet) to be initialized and funded with Sepolia ETH for gas.
 * @param {string} vaultAddress - The address of the AscendVault contract.
 */
async function triggerAndDistribute(vaultAddress) {
  const vaultContract = getVaultContract(vaultAddress);
  const signer = getSigner();
  
  if (!signer) {
    console.error('❌ MONITORING: Cannot trigger vault. Backend signer is not initialized.');
    return;
  }

  try {
    // 1. Call trigger()
    console.log(`[${vaultAddress}] Attempting to call trigger()...`);
    let tx = await vaultContract.trigger();
    await tx.wait();
    console.log(`[${vaultAddress}] ✅ Vault triggered. TX: ${tx.hash}`);

    // 2. Call distributeFunds(USDC_ADDRESS)
    console.log(`[${vaultAddress}] Attempting to call distributeFunds(${USDC_ADDRESS})...`);
    tx = await vaultContract.distributeFunds(USDC_ADDRESS);
    await tx.wait();
    console.log(`[${vaultAddress}] ✅ Funds distributed (USDC only). TX: ${tx.hash}`);

    // 3. Update database state
    // NOTE: Replace this with actual database logic (e.g., Supabase query)
    await db.updateVaultStatus(vaultAddress, 'triggered_distributed'); 
    console.log(`[${vaultAddress}] ✅ Database updated.`);
    
    // 4. Retrieve beneficiary data and send emails
    const vaultData = await db.getVaultBeneficiaries(vaultAddress); // Fetch beneficiaries from DB
    
    for (const beneficiary of vaultData.beneficiaries) {
      const claimLink = `${process.env.FRONTEND_URL}/claim?vault=${vaultAddress}&email=${encodeURIComponent(beneficiary.email)}`;
      const usdcShare = (vaultData.usdcBalance * beneficiary.percentage / 10000).toFixed(2); // Mock share calculation
      
      await sendInheritanceTriggerEmail(
        beneficiary.email,
        vaultAddress,
        usdcShare, // This amount is for the email only (demo)
        beneficiary.walletAddress, // This is the wallet that received the funds
        claimLink
      );
      console.log(`[${vaultAddress}] 📧 Email sent to ${beneficiary.email}`);
    }

  } catch (error) {
    console.error(`❌ MONITORING ERROR for vault ${vaultAddress}:`, error.message);
    // Attempt to update database status to failed/error if needed
    // await db.updateVaultStatus(vaultAddress, 'trigger_failed');
  }
}

/**
 * Main monitoring loop run by cron scheduler.
 */
async function checkVaultsForTrigger() {
  console.log(`--- MONITORING SERVICE RUN: ${new Date().toISOString()} ---`);
  
  // NOTE: Replace this mock function with actual database logic (e.g., Supabase query)
  // The database query should return all ACTIVE, non-triggered vaults.
  const activeVaults = await db.getActiveVaults(); 

  for (const vault of activeVaults) {
    const vaultAddress = vault.vaultAddress;
    const vaultContract = getVaultContract(vaultAddress);

    try {
      // Read current on-chain status
      const isTriggered = await vaultContract.isTriggered();
      if (isTriggered) {
        // Vault was triggered by someone else or a previous run failed to update DB
        await db.updateVaultStatus(vaultAddress, 'triggered_external');
        continue;
      }
      
      const canTrigger = await vaultContract.canTrigger();
      
      if (canTrigger) {
        console.log(`[${vaultAddress}] 🚨 DEADLINE REACHED. Initiating trigger flow.`);
        await triggerAndDistribute(vaultAddress);
      } else {
        const timeRemaining = await vaultContract.getTimeRemaining();
        console.log(`[${vaultAddress}] Active. Remaining: ${timeRemaining.toString()} seconds.`);
      }
    } catch (error) {
      console.error(`❌ MONITORING READ ERROR for vault ${vaultAddress}:`, error.message);
    }
  }
  console.log('-------------------------------------------');
}

/**
 * Initializes and starts the vault monitoring service.
 * Runs every minute to check all active vaults.
 */
export function startVaultMonitoring() {
  // Runs every minute. Use '*/1 * * * *' for production demo. 
  // You might want to use '*/5 * * * *' (every 5 minutes) to save gas/API calls.
  cron.schedule('*/1 * * * *', checkVaultsForTrigger, {
    scheduled: true,
    timezone: "Etc/UTC" // Important for consistency
  });
  console.log('⏱️  Vault Monitoring Service Scheduled to run every minute.');
}

// NOTE: You must also expose the necessary database functions in your database file:
// - db.getActiveVaults()
// - db.updateVaultStatus(vaultAddress, newStatus)
// - db.getVaultBeneficiaries(vaultAddress)
// And ensure your main backend/src/server.js calls startVaultMonitoring().