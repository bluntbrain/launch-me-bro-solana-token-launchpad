use anchor_lang::prelude::*;

pub mod instructions;
pub mod utils;
pub use instructions::*;
pub use utils::*;

declare_id!("TokenCreator1111111111111111111111111111111");

#[program]
pub mod token_creator {
    use super::*;

    /// Create a new token with metadata using Token 2022
    pub fn create_token(
        ctx: Context<CreateToken>,
        args: CreateTokenArgs,
    ) -> Result<()> {
        instructions::create_token_handler(ctx, args)
    }

    /// Mint tokens to a specified account
    pub fn mint_tokens(
        ctx: Context<MintTokens>,
        amount: u64,
    ) -> Result<()> {
        instructions::mint_tokens_handler(ctx, amount)
    }
}

#[error_code]
pub enum TokenCreatorError {
    #[msg("Token name is too long (max 32 characters)")]
    TokenNameTooLong,
    #[msg("Token symbol is too long (max 10 characters)")]
    TokenSymbolTooLong,
    #[msg("Token URI is too long (max 200 characters)")]
    TokenUriTooLong,
    #[msg("Invalid token metadata")]
    InvalidTokenMetadata,
} 