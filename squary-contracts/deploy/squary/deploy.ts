import { deployContract } from "../utils";

// This script is used to deploy an NFT contract
// as well as verify it on Block Explorer if possible for the network
export default async function (hre: any) {
  const [signer] = await hre.ethers.getSigners();
  if (!signer) {
    throw new Error(
      "⛔️ No signer found in the current network configuration!"
    );
  }

  await deployContract("Squary");
}
