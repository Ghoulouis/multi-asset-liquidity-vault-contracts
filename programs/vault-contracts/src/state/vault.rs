use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub authority: Pubkey,
    pub lp_mint: Pubkey,
    pub total_lp_supply: u64,
    pub num_assets: u8,
    pub admin: Pubkey,
    pub bump: u8,
}

impl Vault {
    // Size calculation: 8 (discriminator) + 32 (authority) + 32 (lp_mint) + 8 (total_lp_supply) + 1 (num_assets) + 32 (admin) + 1 (bump) = 114
    pub const SIZE: usize = 114;
}
