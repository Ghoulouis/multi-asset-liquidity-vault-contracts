use anchor_lang::prelude::*;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("5ErtphMo5EUnJFuZZ7N17dVN8o2KCBKYxn9dBYLo24B1");

#[program]
pub mod vault {
    use super::*;
    pub fn initialize_without_metadata(ctx: Context<InitializeVaultWithoutMetadata>) -> Result<()> {
        initialize_vault_without_metadata(ctx).unwrap();
        Ok(())
    }
}
