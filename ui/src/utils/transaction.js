export function serializeTransaction(tx) {
    const length = tx.transaction.accountUpdates.length;
    let i;
    let blindingValues = [];
    for (i = 0; i < length; i++) {
      const la = tx.transaction.accountUpdates[i].lazyAuthorization;
      if (
        la !== undefined &&
        la.blindingValue !== undefined &&
        la.kind === "lazy-proof"
      )
        blindingValues.push(la.blindingValue.toJSON());
      else blindingValues.push("");
    }
    const serializedTransaction = JSON.stringify(
      {
        tx: tx.toJSON(),
        blindingValues,
        length,
        fee: tx.transaction.feePayer.body.fee.toJSON(),
        sender: tx.transaction.feePayer.body.publicKey.toBase58(),
        nonce: tx.transaction.feePayer.body.nonce.toBigint().toString(),
      },
      null,
      2
    );
    return serializedTransaction;
  }
  

export async function sendTransferTransaction(
  params
  /* {
  serializedTransaction: string,
  signedData: string,
  mintParams: string,
  contractAddress: string,
}*/
) /*: Promise<{ isSent: boolean, hash: string }> */ {
  const {
    serializedTransaction,
    signedData,
    contractAddress,
    transferParams,
    chain,
    name,
  } = params;
  if (DEBUG)
    console.log("sendTransferTransaction", {
      name,
      serializedTransaction,
      signedData,
      contractAddress,
      transferParams,
      chain,
    });

  let args = JSON.stringify({
    contractAddress,
  });

  const transaction = JSON.stringify(
    {
      serializedTransaction,
      signedData,
      transferParams,
      name,
    },
    null,
    2
  );

  let answer = await zkCloudWorkerRequest({
    command: "execute",
    transactions: [transaction],
    task: "transfer",
    args,
    metadata: `transfer NFT @${name}`,
    mode: "async",
  });

  if (DEBUG) console.log(`zkCloudWorker answer:`, answer);
  const jobId = answer?.jobId;
  if (DEBUG) console.log(`jobId:`, jobId);
  return jobId;
}

export function chainId() {
  if (REACT_APP_CHAIN_ID === undefined)
    console.error("REACT_APP_CHAIN_ID is undefined");
  return REACT_APP_CHAIN_ID === "mina:mainnet" ? "mainnet" : "devnet";
}

export async function getNonce(account) {
  try {
    const result = await api.nonce(account);
    console.log("getNonce", result);
    if (result?.success === false) {
      return -1;
    } else {
      return result?.nonce ?? -1;
    }
  } catch (error) {
    console.error(`Error`, error);
    return -1;
  }
}