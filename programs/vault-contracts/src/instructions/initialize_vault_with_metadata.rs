use crate::{ids::metaplex_program, state::vault::Vault};
use {
    anchor_lang::prelude::*,
    anchor_spl::{
        metadata::{
            create_metadata_accounts_v3, mpl_token_metadata::types::DataV2,
            CreateMetadataAccountsV3, Metadata,
        },
        token::{Mint, Token},
    },
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializeVaultMetadataParams {
    pub lp_name: String,
    pub lp_symbol: String,
    pub lp_uri: String,
}

#[derive(Accounts)]
pub struct InitializeVaultWithMetadata<'info> {
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
    /// CHECK: This account is used for metadata account
    #[account(
      mut,
      seeds = [b"metadata", metaplex_program::id().as_ref(), lp_mint.key().as_ref()],
      bump,
      seeds::program = metaplex_program::id(),
    )]
    pub metadata_account: UncheckedAccount<'info>,
    #[account(address = metaplex_program::id())]
    pub metaflex_program: Program<'info, Metadata>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn initialize_vault_with_metadata(
    ctx: Context<InitializeVaultWithMetadata>,
    params: InitializeVaultMetadataParams,
) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    vault.authority = ctx.accounts.authority.key();
    vault.lp_mint = ctx.accounts.lp_mint.key();
    vault.total_lp_supply = 0;
    vault.num_assets = 0;
    vault.admin = ctx.accounts.authority.key();
    vault.bump = ctx.bumps.vault;

    let vault_seeds: &[&[u8]] = &[b"vault", &[ctx.bumps.vault]];

    create_metadata_accounts_v3(
        CpiContext::new_with_signer(
            ctx.accounts.metaflex_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata_account.to_account_info(),
                mint: ctx.accounts.lp_mint.to_account_info(),
                mint_authority: ctx.accounts.vault.to_account_info(),
                update_authority: ctx.accounts.vault.to_account_info(),
                payer: ctx.accounts.authority.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            &[&vault_seeds],
        ),
        DataV2 {
            name: params.lp_name,
            symbol: params.lp_symbol,
            uri: params.lp_uri,
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        },
        false,
        true,
        None,
    )?;

    Ok(())
}
