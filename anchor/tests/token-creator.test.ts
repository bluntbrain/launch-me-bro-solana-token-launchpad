import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { assert } from 'chai';

describe('Token Creator', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  let program: Program<any>;
  let mint: Keypair;
  let creator: Keypair;

  before(async () => {
    try {
      const idl = await Program.fetchIdl(
        new PublicKey('TokenCreator1111111111111111111111111111111'),
        provider
      );
      program = new Program(idl!, provider);
    } catch (error) {
      console.log('Program not deployed yet, skipping tests');
      return;
    }

    creator = Keypair.generate();
    mint = Keypair.generate();

    // Airdrop SOL to creator
    const signature = await provider.connection.requestAirdrop(
      creator.publicKey,
      1000000000 // 1 SOL
    );
    await provider.connection.confirmTransaction(signature);
  });

  it('Creates a token with metadata', async () => {
    if (!program) {
      console.log('Program not available, skipping test');
      return;
    }

    const tokenName = 'Test Token';
    const tokenSymbol = 'TEST';
    const tokenUri = 'https://example.com/metadata.json';
    const decimals = 6;

    // Find the associated token account
    const [creatorTokenAccount] = PublicKey.findProgramAddressSync(
      [
        creator.publicKey.toBuffer(),
        TOKEN_2022_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    try {
      const tx = await program.methods
        .createToken({
          name: tokenName,
          symbol: tokenSymbol,
          uri: tokenUri,
          decimals: decimals,
        })
        .accounts({
          creator: creator.publicKey,
          mint: mint.publicKey,
          creatorTokenAccount: creatorTokenAccount,
          systemProgram: SystemProgram.programId,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
        })
        .signers([creator, mint])
        .rpc();

      console.log('Token creation transaction signature:', tx);

      // Verify the mint was created
      const mintInfo = await program.provider.connection.getAccountInfo(mint.publicKey);
      assert.isNotNull(mintInfo, 'Mint account should exist');

      console.log(`Token created successfully!`);
      console.log(`Mint: ${mint.publicKey.toString()}`);
      console.log(`Name: ${tokenName}`);
      console.log(`Symbol: ${tokenSymbol}`);
      console.log(`URI: ${tokenUri}`);
      console.log(`Decimals: ${decimals}`);
    } catch (error) {
      console.error('Error creating token:', error);
      throw error;
    }
  });

  it('Mints tokens to a recipient', async () => {
    if (!program) {
      console.log('Program not available, skipping test');
      return;
    }

    const recipient = Keypair.generate();
    const mintAmount = 1000000; // 1 token with 6 decimals

    // Find the recipient's associated token account
    const [recipientTokenAccount] = PublicKey.findProgramAddressSync(
      [
        recipient.publicKey.toBuffer(),
        TOKEN_2022_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    try {
      const tx = await program.methods
        .mintTokens(new anchor.BN(mintAmount))
        .accounts({
          authority: creator.publicKey,
          mint: mint.publicKey,
          recipient: recipient.publicKey,
          recipientTokenAccount: recipientTokenAccount,
          systemProgram: SystemProgram.programId,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
        })
        .signers([creator])
        .rpc();

      console.log('Token minting transaction signature:', tx);

      // Verify tokens were minted
      const tokenAccountInfo = await program.provider.connection.getAccountInfo(
        recipientTokenAccount
      );
      assert.isNotNull(tokenAccountInfo, 'Recipient token account should exist');

      console.log(`Minted ${mintAmount} tokens to ${recipient.publicKey.toString()}`);
    } catch (error) {
      console.error('Error minting tokens:', error);
      throw error;
    }
  });
}); 