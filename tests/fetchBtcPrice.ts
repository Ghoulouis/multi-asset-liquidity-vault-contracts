import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program, Wallet, BN } from "@coral-xyz/anchor";
import { ProgramTestContext, startAnchor } from "solana-bankrun";
import { generateKpAndFund, processTransactionMaybeThrow, startTest } from "./bankrun-utils/common";
import { Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Connection, clusterApiUrl } from "@solana/web3.js";
import { Vault } from "../target/types/vault";
import VaultIDL from "../target/idl/vault.json";
import { expect } from "chai";
import { BTC_USDC_FEED, BTC_USD_FEED_ID_HEX, METAPLEX_PROGRAM_ID, VAULT_PROGRAM_ID } from "./bankrun-utils/constants";

describe("fetchBtcPrice", () => {
  let context: ProgramTestContext;
  let root: Keypair;
  let admin: Keypair;

  let wallet: Wallet;
  let provider: AnchorProvider;
  let program: Program<Vault>;

  beforeEach(async () => {
    root = Keypair.generate();
    context = await startTest(root);
    admin = await generateKpAndFund(context.banksClient, context.payer);
    wallet = new Wallet(admin);
    provider = new AnchorProvider(context.banksClient as any, wallet, {});
    program = new Program<Vault>(VaultIDL as Vault, provider);
  });

  it("should verify price feed account setup", async () => {
    const account = await context.banksClient.getAccount(BTC_USDC_FEED);
    const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
    const accountOnMainnet = await connection.getAccountInfo(BTC_USDC_FEED);
    expect(accountOnMainnet?.data?.toString()).to.equal(Buffer.from(account?.data).toString());
  });

  it("should fetch and return BTC price data", async () => {
    const tx = await program.methods
      .fetchBtcPrice(BTC_USD_FEED_ID_HEX)
      .accounts({
        signer: admin.publicKey,
        priceUpdate: BTC_USDC_FEED,
      })
      .transaction();
    // Get recent blockhash and set fee payer
    const [blockhash] = await context.banksClient.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = admin.publicKey;
    // Sign the transaction
    tx.sign(admin);
    // Process transaction and verify it succeeds
    const transactionMeta = await context.banksClient.tryProcessTransaction(tx);
    // Verify transaction was successful (no errors)
    expect(transactionMeta.result).to.be.null;

    // Parse and verify event was emitted
    const logs = transactionMeta.meta?.logMessages || [];

    // Parse events from logs using EventParser (returns a Generator)
    const eventParser = new anchor.EventParser(program.programId, program.coder);
    const events = Array.from(eventParser.parseLogs(logs));

    // Verify BitcoinPriceFetched event was emitted
    expect(events.length).to.be.greaterThan(0);
    const priceEvent = events.find((e) => e.name === "bitcoinPriceFetched");
    expect(priceEvent).to.not.be.undefined;
    expect(priceEvent?.data.feedIdHex).to.equal(BTC_USD_FEED_ID_HEX);
    // Check if price and conf are BN instances (i64 and u64 are decoded as BN)
    expect(priceEvent?.data.price).to.be.instanceOf(BN);
    expect(priceEvent?.data.conf).to.be.instanceOf(BN);
    // exponent is i32, which might be decoded as number or BN depending on Anchor version
    expect(priceEvent?.data.exponent).to.satisfy((val: any) => typeof val === "number" || val instanceof BN);
  });
});
