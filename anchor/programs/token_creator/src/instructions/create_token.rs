use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        token_metadata_initialize, Mint, Token2022, TokenAccount, TokenMetadataInitialize,
    },
};

use crate::{
    update_account_lamports_to_minimum_balance, TokenCreatorError,
};

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct CreateTokenArgs {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub decimals: u8,
}

#[derive(Accounts)]
#[instruction(args: CreateTokenArgs)]
pub struct CreateToken<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        init,
        signer,
        payer = creator,
        mint::token_program = token_program,
        mint::decimals = args.decimals,
        mint::authority = creator,
        mint::freeze_authority = creator,
        extensions::metadata_pointer::authority = creator,
        extensions::metadata_pointer::metadata_address = mint,
        extensions::close_authority::authority = creator,
    )]
    pub mint: Box<InterfaceAccount<'info, Mint>>,
    
    #[account(
        init,
        payer = creator,
        associated_token::token_program = token_program,
        associated_token::mint = mint,
        associated_token::authority = creator,
    )]
    pub creator_token_account: Box<InterfaceAccount<'info, TokenAccount>>,
    
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token2022>,
}

impl<'info> CreateToken<'info> {
    fn initialize_token_metadata(
        &self,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        let cpi_accounts = TokenMetadataInitialize {
            program_id: self.token_program.to_account_info(),
            mint: self.mint.to_account_info(),
            metadata: self.mint.to_account_info(), // metadata account is the mint
            mint_authority: self.creator.to_account_info(),
            update_authority: self.creator.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(self.token_program.to_account_info(), cpi_accounts);
        token_metadata_initialize(cpi_ctx, name, symbol, uri)?;
        Ok(())
    }
}

pub fn create_token_handler(ctx: Context<CreateToken>, args: CreateTokenArgs) -> Result<()> {
    // Validate input lengths
    require!(args.name.len() <= 32, TokenCreatorError::TokenNameTooLong);
    require!(args.symbol.len() <= 10, TokenCreatorError::TokenSymbolTooLong);
    require!(args.uri.len() <= 200, TokenCreatorError::TokenUriTooLong);

    // Initialize token metadata
    ctx.accounts.initialize_token_metadata(
        args.name.clone(),
        args.symbol.clone(),
        args.uri.clone(),
    )?;

    // Transfer minimum rent to mint account
    update_account_lamports_to_minimum_balance(
        ctx.accounts.mint.to_account_info(),
        ctx.accounts.creator.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
    )?;

    msg!("Token created successfully!");
    msg!("Mint: {}", ctx.accounts.mint.key());
    msg!("Name: {}", args.name);
    msg!("Symbol: {}", args.symbol);
    msg!("URI: {}", args.uri);
    msg!("Decimals: {}", args.decimals);

    Ok(())
} 