const hre = require("hardhat");

async function sleep(ms) {
  return new Promise((resolve) => {
      setTimeout(resolve, ms)    
  })
}

async function main() {
  // Deploy NFT contract
  const nftContract = await hre.ethers.deployContract("CryptoDevsNFT");
  await nftContract.waitForDeployment();
  console.log("CryptoDevsNFT deployed to: ", nftContract.target )

  // Deploy the Fake MarketPlace Contract
  const fakeNFTMarketPlaceContract = await hre.ethers.deployContract("FakeNFTMarketplace");
  await fakeNFTMarketPlaceContract.waitForDeployment();
  console.log("FakeNFTMarketplace depoyed to: ", fakeNFTMarketPlaceContract.target);

  // Deploy the DAO account
  const amount = hre.ethers.parseEther("0.2")
  const daoContract = await hre.ethers.deployContract("CryptoDevsDAO", [
    fakeNFTMarketPlaceContract.target,
    nftContract.target
  ], {value: amount});

  // // Sleep for 30 seconds to let Etherscan catch up with the deployments
  await sleep(30 * 1000);

  // verify the NFT Contract
  await hre.run("verify:verify", {
    address: nftContract.target,
    constructorArguments: [],
  });

  // verify the Fake Market Place Contract
  await hre.run("verify:verify", {
    address: fakeNFTMarketPlaceContract.target,
    constructorArguments: [],
  })

  // Verify DAO contract
  await hre.run("verify:verify", {
    address: daoContract.target,
    constructorArguments: [
      fakeNFTMarketPlaceContract.target,
      nftContract.target,
    ],
  })
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
})