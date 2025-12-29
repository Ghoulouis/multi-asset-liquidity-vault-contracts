import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
} from "@solana/web3.js";
import { BanksClient, startAnchor } from "solana-bankrun";
import { BTC_USDC_FEED, METAPLEX_PROGRAM_ID, VAULT_PROGRAM_ID } from "./constants";
import { BN } from "@coral-xyz/anchor";
import fs from "fs";

export async function startTest(root: Keypair) {
  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
  const btcFeedAccountInfo = await connection.getAccountInfo(BTC_USDC_FEED);
  return startAnchor(
    "./",
    [
      {
        name: "vault",
        programId: new PublicKey(VAULT_PROGRAM_ID),
      },
      {
        name: "mpl_token_metadata",
        programId: new PublicKey(METAPLEX_PROGRAM_ID),
      },
    ],
    [
      {
        address: root.publicKey,
        info: {
          executable: false,
          owner: SystemProgram.programId,
          lamports: LAMPORTS_PER_SOL * 100,
          data: new Uint8Array(),
        },
      },
      {
        address: BTC_USDC_FEED,
        info: {
          executable: false,
          owner: btcFeedAccountInfo?.owner || SystemProgram.programId,
          lamports: btcFeedAccountInfo?.lamports || 1000000,
          data: btcFeedAccountInfo?.data || new Uint8Array(),
        },
      },
    ]
  );
}

export async function processTransactionMaybeThrow(banksClient: BanksClient, transaction: Transaction) {
  const transactionMeta = await banksClient.tryProcessTransaction(transaction);
  if (transactionMeta.result && transactionMeta.result.length > 0) {
    throw Error(transactionMeta.result);
  }
}

export async function generateKpAndFund(banksClient: BanksClient, rootKeypair: Keypair): Promise<Keypair> {
  const kp = Keypair.generate();
  await transferSol(banksClient, rootKeypair, kp.publicKey, new BN(100 * LAMPORTS_PER_SOL));
  return kp;
}

export async function transferSol(banksClient: BanksClient, from: Keypair, to: PublicKey, amount: BN) {
  const systemTransferIx = SystemProgram.transfer({
    fromPubkey: from.publicKey,
    toPubkey: to,
    lamports: BigInt(amount.toString()),
  });

  let transaction = new Transaction();
  const [recentBlockhash] = await banksClient.getLatestBlockhash();
  transaction.recentBlockhash = recentBlockhash;
  transaction.add(systemTransferIx);
  transaction.sign(from);

  await banksClient.processTransaction(transaction);
}
