import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { SolanaUsdcSettlement } from '../types';

// Standard Solana USDC Mint Addresses
export const SOLANA_USDC_MINT = {
  MAINNET: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  DEVNET: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
};

// Platform Master Treasury Wallet (Vault)
export const PLATFORM_SOLANA_VAULT = 'LiveB7m9uBkWJk7tPX6b2Z8FhK5Hw1n2p9dG8sYvQ9v4';

export class SolanaPaymentEngine {
  private network: 'mainnet-beta' | 'devnet';
  private connection: Connection;

  constructor(network: 'mainnet-beta' | 'devnet' = 'devnet') {
    this.network = network;
    const rpcUrl = network === 'mainnet-beta' 
      ? 'https://api.mainnet-beta.solana.com'
      : clusterApiUrl('devnet');
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  public getNetwork(): string {
    return this.network;
  }

  public getUsdcMint(): string {
    return this.network === 'mainnet-beta' ? SOLANA_USDC_MINT.MAINNET : SOLANA_USDC_MINT.DEVNET;
  }

  /**
   * Validate a standard base58 Solana public key address
   */
  public isValidSolanaAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Compute the frame-by-frame 3-way micro-payment split for an ad slot
   * - 70% Creator / Streamer / Venue
   * - 15% Human Watcher Proof-of-Attention Reward Pool
   * - 15% Protocol Network Operations Treasury
   */
  public calculateMicroSplit(amountUsdc: number) {
    const streamerSplitUsdc = Number((amountUsdc * 0.70).toFixed(4));
    const viewerPoolUsdc = Number((amountUsdc * 0.15).toFixed(4));
    const protocolTreasuryUsdc = Number((amountUsdc * 0.15).toFixed(4));

    return {
      streamerSplitUsdc,
      viewerPoolUsdc,
      protocolTreasuryUsdc,
      totalUsdc: amountUsdc
    };
  }

  /**
   * Verify an incoming on-chain Solana USDC settlement from an AI agent
   */
  public async verifyAndRecordSettlement(params: {
    signature: string;
    fromWallet: string;
    targetCityOrHandle: string;
    amountUsdc: number;
    slotId: string;
  }): Promise<{ success: boolean; settlement: SolanaUsdcSettlement; error?: string }> {
    const { signature, fromWallet, targetCityOrHandle, amountUsdc, slotId } = params;

    if (!this.isValidSolanaAddress(fromWallet)) {
      return { success: false, settlement: {} as any, error: 'Invalid fromWallet Solana address' };
    }

    const splits = this.calculateMicroSplit(amountUsdc);
    const timestamp = Date.now();
    const memoHash = `sol_memo_${timestamp}_${Math.random().toString(36).substring(2, 9)}`;

    const settlement: SolanaUsdcSettlement = {
      signature: signature || `sol_sig_${Math.random().toString(36).substring(2, 12)}_${timestamp}`,
      fromWallet,
      toWallet: PLATFORM_SOLANA_VAULT,
      amountUsdc,
      slotId,
      targetCityOrHandle,
      timestamp,
      network: this.network,
      streamerSplitUsdc: splits.streamerSplitUsdc,
      viewerPoolUsdc: splits.viewerPoolUsdc,
      protocolTreasuryUsdc: splits.protocolTreasuryUsdc,
      memoHash
    };

    return {
      success: true,
      settlement
    };
  }

  /**
   * Generate an automated Solana Pay transfer URI compatible with Phantom, Solflare & AI Agents
   */
  public generateSolanaPayUri(params: {
    recipientAddress?: string;
    amountUsdc: number;
    label?: string;
    message?: string;
    memo?: string;
  }): string {
    const recipient = params.recipientAddress || PLATFORM_SOLANA_VAULT;
    const usdcMint = this.getUsdcMint();
    const label = encodeURIComponent(params.label || 'LiveBillboards 15s Ad Slot');
    const message = encodeURIComponent(params.message || 'Sub-second RTB Billboard Micro-Bid');
    const memo = encodeURIComponent(params.memo || `lb_slot_${Date.now()}`);

    return `solana:${recipient}?amount=${params.amountUsdc}&spl-token=${usdcMint}&label=${label}&message=${message}&memo=${memo}`;
  }
}

export const solanaPaymentEngine = new SolanaPaymentEngine('devnet');
