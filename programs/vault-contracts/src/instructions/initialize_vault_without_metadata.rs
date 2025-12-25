use crate::state::vault::Vault;
use {
    anchor_lang::prelude::*,
    anchor_spl::token::{Mint, Token},
};

#[derive(Accounts)]
pub struct InitializeVaultWithoutMetadata<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
      init,
      seeds = [b"vault"],
      bump,
      payer = authority,
      space = Vault::SIZE)]
    pub vault: Account<'info, Vault>,
    #[account(
      init,
      payer = authority,
      mint::decimals = 9,
      mint::authority = vault,
    )]
    pub lp_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn initialize_vault_without_metadata(
    ctx: Context<InitializeVaultWithoutMetadata>,
) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    vault.authority = ctx.accounts.authority.key();
    vault.lp_mint = ctx.accounts.lp_mint.key();
    vault.total_lp_supply = 0;
    vault.num_assets = 0;
    vault.admin = ctx.accounts.authority.key();
    vault.bump = ctx.bumps.vault;

    Ok(())
}
