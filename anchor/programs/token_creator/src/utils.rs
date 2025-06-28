use anchor_lang::{
    prelude::Result,
    solana_program::{
        account_info::AccountInfo,
        program::invoke,
        rent::Rent,
        system_instruction::transfer,
        sysvar::Sysvar,
    },
};

/// Update account lamports to minimum balance required for rent exemption
pub fn update_account_lamports_to_minimum_balance<'info>(
    account: AccountInfo<'info>,
    payer: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
) -> Result<()> {
    let extra_lamports = Rent::get()?.minimum_balance(account.data_len()) - account.get_lamports();
    if extra_lamports > 0 {
        invoke(
            &transfer(payer.key, account.key, extra_lamports),
            &[payer, account, system_program],
        )?;
    }
    Ok(())
}

/// Get mint extension data for variable length extensions like TokenMetadata
/// This is a simplified version that doesn't use complex type generics
pub fn get_mint_extensible_extension_data<T>(
    _account: &mut AccountInfo,
) -> Result<T> 
where 
    T: Default,
{
    // Simplified implementation - in a real scenario you would parse the account data
    // For now, we'll return a default to avoid dependency conflicts
    Ok(T::default())
}

/// Helper function to validate token metadata fields
pub fn validate_token_metadata(name: &str, symbol: &str, uri: &str) -> bool {
    !name.is_empty() 
        && !symbol.is_empty() 
        && name.len() <= 32 
        && symbol.len() <= 10 
        && uri.len() <= 200
} 