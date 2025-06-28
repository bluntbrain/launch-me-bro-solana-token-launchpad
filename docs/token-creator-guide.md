# Token Creator Program Guide

## Overview

The Token Creator program allows users to create SPL tokens using the Token 2022 standard with metadata extensions. This enables creating tokens with rich metadata including name, symbol, and URI that can contain links to images, websites, social media accounts, and more.

## Features

- **Token 2022 Integration**: Uses the latest SPL Token 2022 program for enhanced functionality
- **Metadata Extension**: Stores token metadata directly on-chain
- **Flexible URI**: Support for any URI including images, websites, social links
- **Mint Authority**: Creator maintains mint authority to mint additional tokens
- **Associated Token Accounts**: Automatically creates associated token accounts

## Token Metadata Structure

When creating a token, you can include metadata in the URI field. Here's an example structure for the JSON metadata:

```json
{
  "name": "My Awesome Token",
  "symbol": "MAT",
  "description": "A revolutionary token for the future",
  "image": "https://example.com/token-image.png",
  "external_url": "https://mytoken.com",
  "attributes": [
    {
      "trait_type": "Type",
      "value": "Utility"
    }
  ],
  "properties": {
    "website": "https://mytoken.com",
    "twitter": "https://twitter.com/mytoken",
    "telegram": "https://t.me/mytoken",
    "discord": "https://discord.gg/mytoken"
  }
}
```

## Instructions

### 1. Create Token

Creates a new token with metadata using Token 2022.

**Parameters:**
- `name`: Token name (max 32 characters)
- `symbol`: Token symbol (max 10 characters)  
- `uri`: Metadata URI (max 200 characters)
- `decimals`: Number of decimal places (0-9)

**Accounts Required:**
- `creator`: The token creator (signer, pays fees)
- `mint`: New mint account (signer, will be created)
- `creator_token_account`: Creator's associated token account (will be created)
- `system_program`: System program
- `associated_token_program`: Associated token program
- `token_program`: Token 2022 program

### 2. Mint Tokens

Mints tokens to a specified recipient.

**Parameters:**
- `amount`: Amount to mint (in base units)

**Accounts Required:**
- `authority`: Mint authority (signer)
- `mint`: The token mint
- `recipient`: Account that will receive tokens
- `recipient_token_account`: Recipient's associated token account
- `system_program`: System program
- `associated_token_program`: Associated token program
- `token_program`: Token 2022 program

## Usage Examples

### Creating a Token

```typescript
import { PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Program } from '@coral-xyz/anchor';

// Create a new mint keypair
const mint = Keypair.generate();
const creator = Keypair.generate(); // Your wallet keypair

// Token metadata
const tokenName = "My Token";
const tokenSymbol = "MTK";
const tokenUri = "https://example.com/metadata.json";
const decimals = 6;

// Find associated token account
const [creatorTokenAccount] = PublicKey.findProgramAddressSync(
  [
    creator.publicKey.toBuffer(),
    TOKEN_2022_PROGRAM_ID.toBuffer(),
    mint.publicKey.toBuffer(),
  ],
  ASSOCIATED_TOKEN_PROGRAM_ID
);

// Create token transaction
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
```

### Minting Tokens

```typescript
// Mint 1000 tokens (with 6 decimals = 1000000000 base units)
const mintAmount = 1000 * Math.pow(10, 6);
const recipient = new PublicKey("RECIPIENT_WALLET_ADDRESS");

// Find recipient's associated token account
const [recipientTokenAccount] = PublicKey.findProgramAddressSync(
  [
    recipient.toBuffer(),
    TOKEN_2022_PROGRAM_ID.toBuffer(),
    mint.publicKey.toBuffer(),
  ],
  ASSOCIATED_TOKEN_PROGRAM_ID
);

// Mint tokens transaction
const tx = await program.methods
  .mintTokens(new anchor.BN(mintAmount))
  .accounts({
    authority: creator.publicKey,
    mint: mint.publicKey,
    recipient: recipient,
    recipientTokenAccount: recipientTokenAccount,
    systemProgram: SystemProgram.programId,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    tokenProgram: TOKEN_2022_PROGRAM_ID,
  })
  .signers([creator])
  .rpc();
```

## Building and Testing

1. **Build the program:**
   ```bash
   cd anchor
   anchor build
   ```

2. **Deploy to local validator:**
   ```bash
   anchor deploy
   ```

3. **Run tests:**
   ```bash
   anchor test
   ```

## Program ID

- **Localnet**: `TokenCreator1111111111111111111111111111111`

## Error Codes

- `TokenNameTooLong`: Token name exceeds 32 characters
- `TokenSymbolTooLong`: Token symbol exceeds 10 characters  
- `TokenUriTooLong`: Token URI exceeds 200 characters
- `InvalidTokenMetadata`: Token metadata validation failed

## Security Considerations

1. **Mint Authority**: The creator retains mint authority by default
2. **Freeze Authority**: The creator has freeze authority over the token
3. **Close Authority**: The creator can close the mint account
4. **Metadata Updates**: Only the creator can update token metadata

## Best Practices

1. **URI Storage**: Store metadata JSON on decentralized storage (IPFS, Arweave)
2. **Image Assets**: Use high-quality images (512x512 minimum for tokens)
3. **Validation**: Always validate input parameters client-side
4. **Testing**: Test thoroughly on devnet before mainnet deployment
5. **Documentation**: Include comprehensive token documentation in metadata 