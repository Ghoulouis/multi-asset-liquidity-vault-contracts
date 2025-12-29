use anchor_lang::prelude::*;
pub mod error;
pub mod ids;
pub mod instructions;
pub mod math;
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

    pub fn initialize_with_metadata(
        ctx: Context<InitializeVaultWithMetadata>,
        params: InitializeVaultMetadataParams,
    ) -> Result<()> {
        initialize_vault_with_metadata(ctx, params).unwrap();
        Ok(())
    }

    pub fn fetch_btc_price(ctx: Context<FetchBitcoinPrice>, feed_id_hex: String) -> Result<()> {
        fetch_pyth_btc_price(ctx, feed_id_hex).unwrap();
        Ok(())
    }
}
