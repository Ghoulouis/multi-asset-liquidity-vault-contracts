use crate::error::{ErrorCode, VaultResult};
use anchor_lang::prelude::*;
use std::panic::Location;
pub trait SafeMath {
    fn safe_add(self, other: Self) -> VaultResult<Self>
    where
        Self: Sized;
    fn safe_sub(self, other: Self) -> VaultResult<Self>
    where
        Self: Sized;
    fn safe_mul(self, other: Self) -> VaultResult<Self>
    where
        Self: Sized;
    fn safe_div(self, other: Self) -> VaultResult<Self>
    where
        Self: Sized;
}

macro_rules! impl_safe_math {
    ($t:ty) => {
        impl SafeMath for $t {
            #[track_caller]
            #[inline(always)]
            fn safe_add(self, other: Self) -> VaultResult<Self> {
                match self.checked_add(other) {
                    Some(result) => Ok(result),
                    None => {
                        let caller = Location::caller();
                        msg!("Math error thrown at {}:{}", caller.file(), caller.line());
                        Err(ErrorCode::MathOverflow)
                    }
                }
            }
            #[track_caller]
            #[inline(always)]
            fn safe_sub(self, other: Self) -> VaultResult<Self> {
                match self.checked_sub(other) {
                    Some(result) => Ok(result),
                    None => {
                        let caller = Location::caller();
                        msg!("Math error thrown at {}:{}", caller.file(), caller.line());
                        Err(ErrorCode::MathOverflow)
                    }
                }
            }

            #[track_caller]
            #[inline(always)]
            fn safe_mul(self, other: Self) -> VaultResult<Self> {
                match self.checked_mul(other) {
                    Some(result) => Ok(result),
                    None => {
                        let caller = Location::caller();
                        msg!("Math error thrown at {}:{}", caller.file(), caller.line());
                        Err(ErrorCode::MathOverflow)
                    }
                }
            }

            #[track_caller]
            #[inline(always)]
            fn safe_div(self, other: Self) -> VaultResult<Self> {
                match self.checked_div(other) {
                    Some(result) => Ok(result),
                    None => {
                        let caller = Location::caller();
                        msg!("Math error thrown at {}:{}", caller.file(), caller.line());
                        Err(ErrorCode::MathError)
                    }
                }
            }
        }
    };
}

impl_safe_math!(u128);
impl_safe_math!(u64);
impl_safe_math!(u32);
impl_safe_math!(u16);
impl_safe_math!(u8);

impl_safe_math!(i128);
impl_safe_math!(i64);
impl_safe_math!(i32);
impl_safe_math!(i16);
impl_safe_math!(i8);
