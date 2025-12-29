use anchor_lang::prelude::*;
pub type VaultResult<T = ()> = std::result::Result<T, ErrorCode>;

#[error_code]
pub enum ErrorCode {
    #[msg("Unable To Load Oracles")]
    UnableToLoadOracle,
    #[msg("Math Overflow")]
    MathOverflow,
    #[msg("Math Error")]
    MathError,
    #[msg("Division By Zero")]
    DivisionByZero,
    #[msg("Casting Failure")]
    CastingFailure,
    #[msg("Multiple larger than oracle precision")]
    MultipleLargerThanOraclePrecision,
    #[msg("Invalid Oracle")]
    InvalidOracle,
}
