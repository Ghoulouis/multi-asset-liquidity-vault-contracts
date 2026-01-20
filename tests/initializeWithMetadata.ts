import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { Vault } from "../target/types/vault";
import VaultIDL from "../target/idl/vault.json";
import { expect } from "chai";

// Token Program ID constant
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
// Metaplex Program ID constant
const METAPLEX_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

describe("initializeWithMetadata", () => {
  let admin: Keypair;

  let wallet: Wallet;
  let provider: AnchorProvider;
  let program: Program<Vault>;
  let vaultPda: PublicKey;
  let vaultBump: number;

  beforeEach(async () => {
    program = anchor.workspace.Vault as Program<Vault>;
    provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    wallet = new Wallet(new Keypair());
    admin = new Keypair();
    let airdropSig1 = await provider.connection.requestAirdrop(wallet.publicKey, LAMPORTS_PER_SOL * 100);
    let airdropSig2 =await provider.connection.requestAirdrop(admin.publicKey, LAMPORTS_PER_SOL * 100);
    let airdropSig3 =await provider.connection.requestAirdrop(provider.wallet.publicKey, LAMPORTS_PER_SOL * 100);
    await provider.connection.confirmTransaction(airdropSig1);
    await provider.connection.confirmTransaction(airdropSig2);
    await provider.connection.confirmTransaction(airdropSig3);
 
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
      .rpc();


    //const vaultAccount = await program.account.vault.fetch(vaultPda);
  
  });
});
