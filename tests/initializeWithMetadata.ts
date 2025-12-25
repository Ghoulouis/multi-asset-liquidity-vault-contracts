import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { ProgramTestContext } from "solana-bankrun";
import { generateKpAndFund, processTransactionMaybeThrow, startTest } from "./bankrun-utils/common";
import { Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { Vault } from "../target/types/vault";
import VaultIDL from "../target/idl/vault.json";
import { expect } from "chai";

// Token Program ID constant
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
// Metaplex Program ID constant
const METAPLEX_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

describe("vault-contracts-2", () => {
  let context: ProgramTestContext;
  let root: Keypair;
  let admin: Keypair;

  let wallet: Wallet;
  let provider: AnchorProvider;
  let program: Program<Vault>;
  let vaultPda: PublicKey;
  let vaultBump: number;

  beforeEach(async () => {
    root = Keypair.generate();
    context = await startTest(root);
    admin = await generateKpAndFund(context.banksClient, context.payer);
    wallet = new Wallet(admin);
    provider = new AnchorProvider(context.banksClient as any, wallet, {});
    program = new Program<Vault>(VaultIDL as Vault, provider);
    // Calculate vault PDA
    [vaultPda, vaultBump] = PublicKey.findProgramAddressSync([Buffer.from("vault")], program.programId);
  });

  it("should initialize the vault with metadata", async () => {
    // Get admin's public key
    const adminPubkey = admin.publicKey;

    // Create LP mint keypair (will be initialized by Anchor)
    const lpMintKeypair = Keypair.generate();
    const lpMint = lpMintKeypair.publicKey;

    // Calculate metadata PDA
    const [metadataAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("metadata"), METAPLEX_PROGRAM_ID.toBuffer(), lpMint.toBuffer()],
      METAPLEX_PROGRAM_ID
    );

    // Metadata parameters
    const lpName = "Test LP Token";
    const lpSymbol = "TLP";
    const lpUri = "https://example.com/metadata.json";

    // Build the instruction
    const tx = await program.methods
      .initializeWithMetadata({
        lpName: lpName,
        lpSymbol: lpSymbol,
        lpUri: lpUri,
      })
      .accounts({
        authority: adminPubkey,
        lpMint: lpMint,
        // @ts-ignore - metadata_account is a PDA from Metaplex program, Anchor types may not recognize it
        metadata_account: metadataAccount,
        metaflexProgram: METAPLEX_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([admin, lpMintKeypair])
      .transaction();

    // Get recent blockhash and send transaction
    const [blockhash] = await context.banksClient.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = adminPubkey;

    // Sign the transaction
    tx.sign(admin, lpMintKeypair);

    // Execute the transaction using BanksClient
    await processTransactionMaybeThrow(context.banksClient, tx);

    // // Fetch and verify vault account
    // const vaultAccount = await program.account.vault.fetch(vaultPda);

    // expect(vaultAccount.authority.toString()).to.equal(adminPubkey.toString());
    // expect(vaultAccount.lpMint.toString()).to.equal(lpMint.toString());
    // expect(vaultAccount.totalLpSupply.toNumber()).to.equal(0);
    // expect(vaultAccount.numAssets).to.equal(0);
    // expect(vaultAccount.admin.toString()).to.equal(adminPubkey.toString());
    // expect(vaultAccount.bump).to.equal(vaultBump);

    // Verify LP mint account exists
    const lpMintAccount = await context.banksClient.getAccount(lpMint);
    expect(lpMintAccount).to.not.be.null;
    expect(lpMintAccount?.owner.toString()).to.equal(TOKEN_PROGRAM_ID.toString());

    // Verify metadata account exists
    const metadataAccountInfo = await context.banksClient.getAccount(metadataAccount);
    expect(metadataAccountInfo).to.not.be.null;
  });
});
