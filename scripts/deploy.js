const { ethers } = require('hardhat');

async function main() {
    // Get the ContractFactory and Signers
    const [deployer] = await ethers.getSigners();
  
    console.log('Deploying contracts with the account:', deployer.address);
  
    // Fetch addresses and values for constructor parameters
    const mxTokenAddress = '0xb6011d31e66eFA98A3E405214234b68D52DA502f'; 
    const baseURI = "https://marsx-lands.s3.ap-south-1.amazonaws.com/";
    const mintPrice = '1000000000000000000'; // 1 MX token
    const authorizedSignerAddress = "0x550e602C1eaD04C84d0c02171b0CC0cdDfc7b0E4"; // considering as authorizer

    const MarsxLands = await ethers.getContractFactory("MarsxLands");

    // Deploy the contract with constructor arguments
    const marsxlands = await MarsxLands.deploy(
      mxTokenAddress,
      authorizedSignerAddress,
      mintPrice,
      baseURI,
    );

    // Wait for deployment to finish
    console.log('Contract deployed to:', marsxlands);
  }
  
  
 // Execute the deployment
main().catch((error) => {
  console.error('Error deploying contract:', error);
  process.exitCode = 1;
});