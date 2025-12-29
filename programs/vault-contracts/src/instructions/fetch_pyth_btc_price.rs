use anchor_lang::prelude::*;
use pyth_solana_receiver_sdk::price_update::{get_feed_id_from_hex, PriceUpdateV2};

#[derive(Accounts)]
#[instruction()]
pub struct FetchBitcoinPrice<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    // /// CHECK: This account is used for the price feed
    // #[account(address = Pubkey::from_str_const(BTC_USDC_FEED) @ FeedError::InvalidPriceFeed)]
    // pub price_feed: UncheckedAccount<'info>,
    pub price_update: Account<'info, PriceUpdateV2>,
}

#[error_code]
pub enum FeedError {
    #[msg("Invalid Price Feed")]
    InvalidPriceFeed,
}

#[event]
pub struct BitcoinPriceFetched {
    pub price: i64,
    pub conf: u64,
    pub exponent: i32,
    pub feed_id_hex: String,
}

pub fn fetch_pyth_btc_price(ctx: Context<FetchBitcoinPrice>, feed_id_hex: String) -> Result<()> {
    let price_update = &ctx.accounts.price_update;

    // Maximum age in seconds (60 seconds = 1 minute)
    // Using a reasonable value instead of u64::MAX to avoid TryFromIntError
    let maximum_age = 60u64;

    let feed_id = get_feed_id_from_hex(&feed_id_hex)?;
    let price = price_update.get_price_no_older_than(&Clock::get()?, maximum_age, &feed_id)?;

    msg!(
        "BTC/USD price: ({} +- {} * 10^{})",
        price.price,
        price.conf,
        price.exponent
    );

    emit!(BitcoinPriceFetched {
        price: price.price,
        conf: price.conf,
        exponent: price.exponent,
        feed_id_hex: feed_id_hex.clone(),
    });

    Ok(())
}
