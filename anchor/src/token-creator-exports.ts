// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';

// The programId for the token creator program
export const PROGRAM_ID = new PublicKey('TokenCreator1111111111111111111111111111111');

// This is a helper function to get the program ID for the token creator program depending on the cluster.
export function getTokenCreatorProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return PROGRAM_ID;
  }
}

// Token creation arguments interface
export interface CreateTokenArgs {
  name: string;
  symbol: string;
  uri: string;
  decimals: number;
}

// Helper function to validate token metadata
export function validateTokenMetadata(name: string, symbol: string, uri: string): boolean {
  return (
    name.length > 0 &&
    name.length <= 32 &&
    symbol.length > 0 &&
    symbol.length <= 10 &&
    uri.length <= 200
  );
} 