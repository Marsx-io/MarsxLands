const { ethers } = require('hardhat');

async function main() {
    // Get the ContractFactory and Signers
    const [deployer] = await ethers.getSigners();
  
    console.log('Deploying contracts with the account:', deployer.address);
  
    // Fetch addresses and values for constructor parameters
    const usdtAddress = '0x47F86905EC8fee95Dee6B8587c50ebb53b01CcEd';
    const mxTokenAddress = '0xb6011d31e66eFA98A3E405214234b68D52DA502f'; 
    const baseURI = 'https://marsx.mypinata.cloud/ipfs/QmdjnZJM5ADo6ueBDfLsi2H92B8ixNqu4GiCJZGw5Vyt4U/';    
    const mxPrice = '1000000000000000000000';   // Example: 1000 MX tokens
    const usdtPrice = '1000000000'; // Example: 1000 USDT tokens (assuming 6 decimals)
  
    // Get the contract to deploy
    const CommunitiesERC1155 = await ethers.getContractFactory('MarsxCommunity'); // Replace with your contract name
  
    // Deploy the contract with constructor arguments
    const deployedContract = await CommunitiesERC1155.deploy(
      usdtAddress,
      mxTokenAddress,
      baseURI,
      mxPrice,
      usdtPrice
    );
    // Wait for deployment to finish
    console.log('Contract deployed to:', deployedContract);
  }
  
 // Execute the deployment
main().catch((error) => {
  console.error('Error deploying contract:', error);
  process.exitCode = 1;
});