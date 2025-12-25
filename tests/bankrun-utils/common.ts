import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { BanksClient, startAnchor } from "solana-bankrun";
import { VAULT_PROGRAM_ID } from "./constants";
import { BN } from "@coral-xyz/anchor";

export async function startTest(root: Keypair) {
  return startAnchor(
    "./",
    [
      {
        name: "vault",
        programId: new PublicKey(VAULT_PROGRAM_ID),
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
