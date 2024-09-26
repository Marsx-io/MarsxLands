import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";


describe("MarsxLands", function () {
  async function deployMarsxLandsFixture() {

    const [owner, addr1, addr2] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("ERC20Mock");
    const mxToken = await MockERC20.deploy("MX Token", "MX", 18); // Mock MX Token with 18 decimals

    const MarsxLands = await ethers.getContractFactory("MarsxLands");
    const baseURI = "https://marsx.mypinata.cloud/ipfs/";
    const mintPrice = '1000000000000000000'; // 1 MX token
    const authorizedSigner = owner
    
    const marsxlands = await MarsxLands.deploy(
      mxToken,
      authorizedSigner,
      mintPrice,
      baseURI,
    );

    // Fund some MX tokens to addr1 for testing
    await mxToken.transfer(addr1.address, '10000000000000000000'); // 10 MX

    return { marsxlands, mxToken, owner, addr1, addr2, mintPrice, baseURI };
  }

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      const { marsxlands } = await loadFixture(deployMarsxLandsFixture);

      expect(await marsxlands.name()).to.equal("MarsX-Skylanders");
      expect(await marsxlands.symbol()).to.equal("MXL");
    });

    it("Should set the correct mint price", async function () {
      const { marsxlands, mintPrice } = await loadFixture(deployMarsxLandsFixture);

      expect(await marsxlands.mintPrice()).to.equal(mintPrice);
    });


  });

  describe("Minting Lands", function () {
    it("Should mint land tokens successfully with valid signature", async function () {

      const { marsxlands, owner, addr1, mintPrice, mxToken } = await loadFixture(deployMarsxLandsFixture);

      const communityId = 1;
      const tokenIds = [1]; // Token IDs to mint
      const nonce = await marsxlands.getNonce(addr1.address);

      // Generate a valid signature
      const messageHash = ethers.solidityPackedKeccak256(
        ["address", "uint256", "uint256[]", "uint256"],
        [owner.address, communityId, tokenIds, nonce]
      );

      const signature = await owner.signMessage(ethers.getBytes(messageHash));

      // Approve the LandNFT contract to spend addr1's MX tokens
      await mxToken.connect(addr1).approve(marsxlands, mintPrice);

      // Mint the land tokens
      await marsxlands.connect(addr1).buyLand(communityId, tokenIds, nonce, signature);

      // Check balances and ownership
      expect(await marsxlands.ownerOf(1)).to.equal(addr1.address);
      // expect(await marsxlands.ownerOf(2)).to.equal(addr1.address);
      // expect(await marsxlands.ownerOf(3)).to.equal(addr1.address);

      // Check community land count
      expect(await marsxlands.communityLandCount(communityId)).to.equal(1);
    });


    
    it("Should get the Token URI", async function () {
      const { marsxlands } = await loadFixture(deployMarsxLandsFixture);

      expect(await marsxlands.tokenURI(1)).to.equal("https://marsx.mypinata.cloud/ipfs/1.json");
    });


    it("Should fail to mint with an invalid signature", async function () {
      const { marsxlands, owner, addr2, addr1 } = await loadFixture(deployMarsxLandsFixture);

      const communityId = 1;
      const tokenIds = [2];
      const nonce = await marsxlands.getNonce(addr1.address);

      // Generate a valid signature
      const messageHash = ethers.solidityPackedKeccak256(
        ["address", "uint256", "uint256[]", "uint256"],
        [owner.address, communityId, tokenIds, nonce]
      );

      const invalidSignature = await addr2.signMessage(ethers.getBytes(messageHash));

      // Try to mint with the invalid signature
      await expect(
        marsxlands.connect(addr1).buyLand(communityId, tokenIds, nonce, invalidSignature)
      ).to.be.revertedWith("Invalid signature");
    });
  })


    it("Should fail if the MX token transfer fails", async function () {
      const { marsxlands, owner, addr1, mxToken, mintPrice } = await loadFixture(deployMarsxLandsFixture);

      const communityId = 1;
      const tokenIds = [3];
      const nonce = await marsxlands.getNonce(addr1.address);

      // Generate a valid signature
      const messageHash = ethers.solidityPackedKeccak256(
        ["address", "uint256", "uint256[]", "uint256"],
        [owner.address, communityId, tokenIds, nonce]
      );

      const signature = await owner.signMessage(ethers.getBytes(messageHash));

      // await mxToken.connect(addr1).approve(marsxlands, mintPrice);

      // Do not approve the MX token, leading to a transfer failure
      await expect(
        marsxlands.connect(addr1).buyLand(communityId, tokenIds, nonce, signature)
      ).to.be.reverted;
    });



  describe("Admin Functions", function () {

    it("Should update the authorized signer", async function () {
      const { marsxlands, owner, addr1 } = await loadFixture(deployMarsxLandsFixture);

      // Track the transaction and verify the emitted event
      await expect(marsxlands.connect(owner).setAuthorizedSigner(addr1.address))
        .to.emit(marsxlands, "AuthorizedSignerUpdated")
        .withArgs(owner.address, addr1.address); // The event should emit old and new signer addresses
    });

  
    it("Should update the mint price", async function () {
      const { marsxlands, owner } = await loadFixture(deployMarsxLandsFixture);
      const newPrice = '2000000000000000000'; // New price 2 MX
      await marsxlands.connect(owner).setPrice(newPrice);
      expect(await marsxlands.mintPrice()).to.equal(newPrice);
    });

    it("Should allow owner to withdraw MX tokens", async function () {
      const { marsxlands, owner, addr1, mxToken } = await loadFixture(deployMarsxLandsFixture);

      const initialBalance : bigint = await mxToken.balanceOf(owner.address);
      const mintPrice: bigint = BigInt('1000000000000000000');

      // Transfer some MX tokens to the LandNFT contract
      await mxToken.connect(addr1).transfer(marsxlands, mintPrice);

      // Withdraw tokens to owner
      await marsxlands.connect(owner).withdrawMX(owner.address, mintPrice);
      const finalBalance : bigint  = await mxToken.balanceOf(owner.address);

      expect(finalBalance).to.equal(initialBalance + mintPrice);
    });

  })

  });