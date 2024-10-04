# Mars-X Skylanders Smart Contract

## Overview

The **MarsxLands** smart [contract](https://amoy.polygonscan.com/address/0x180D6367f2888F8b2aDe7623362022F2Ed98639c#code) is an ERC721-based contract designed to manage the minting and sale of digital lands using the ERC20 MX token. Each community in the platform can have a maximum of 100,000 lands, and users can buy these lands by providing a valid signature and paying the mint price in MX tokens. The contract also implements various features for ownership control, security, and flexibility in setting prices and managing token metadata.

## Features

- **Minting Lands**: Allows users to mint lands for specific communities by paying with the MX token.
- **Signature Verification**: Ensures that only authorized transactions can proceed using ECDSA signature validation.
- **Non-reentrancy Protection**:  Uses `ReentrancyGuard` to prevent reentrancy attacks.
- **Dynamic Price Setting**: Owners can update the mint price of lands.
- **Token Metadata Management:**: Supports the retrieval and update of metadata URIs.
- **MX Token Withdrawals**: Owners can withdraw accumulated MX tokens from the contract.
- **Nonce Management**: Tracks nonces for secure and unique transaction validation.
- **Community-Based Minting**: Each community has 100,000 land NFTs available for minting.

## Contract Details

- **Name**: MarsX-Skylanders
- **Symbol**: MXL
- **Token Standards**: ERC721
- **Supported Tokens**:
  - MX: 18 decimals
- **Dependencies**:
  - OpenZeppelin Contracts (`ERC721`, `Ownable`, `ReentrancyGuard`)
  - `IERC20` for MX token integration
  - ECDSA utilities for signature verification



## Constructor

```solidity
constructor(
 address _mxTokenAddress, // Address of the deployed MX ERC20 token.
 address _authorizedSigner, // The address allowed to sign minting transactions.
 uint256 _mintPrice, // Initial mint price for each land in MX tokens.
 string memory baseURI, // The base URI for metadata (e.g., `https://metadata.marsx.com/`).
)
```


## Contract Variables

- **`IERC20 public mxToken`**  
  The instance of the ERC20 token contract used for transactions within the `MarsxLands` contract. This variable allows the contract to interact with the MX token.

- **`mapping(uint256 => bool) private _mintedTokens`**  
  A mapping that tracks whether a specific token ID has been minted. The key is the token ID, and the value is a boolean indicating if it has been minted (`true`) or not (`false`).

- **`uint256 public mintPrice`**  
  The price to mint a single land in MX tokens, represented with 18 decimal places.

- **`uint256 public maxLandPerCommunity`**  
  The maximum number of lands that can be minted for a single community, set to `1000000` by default.

- **`mapping(uint256 => uint256) public communityLandCount`**  
  A mapping that tracks the number of lands minted for each community. The key is the community ID, and the value is the count of minted lands for that community.

- **`address private authorizedSigner`**  
  The address of the authorized signer that can create valid signatures for minting transactions. This ensures that only authorized users can confirm minting requests.

- **`mapping(address => uint256) public nonces`**  
  A mapping that keeps track of the nonce for each user. This is used to prevent replay attacks by ensuring that each transaction has a unique nonce.

- **`string private _baseTokenURI`**  
  The base URI for all token metadata, which can be updated by the contract owner. This is used to construct the full URI for each token's metadata.


### Events

- **`event LandMinted(address indexed buyer, uint256 communityId, uint256 tokenId)`**  
  Emitted when a land is successfully minted. This event provides the following information:
  - **`buyer`**: The address of the buyer who purchased the land.
  - **`communityId`**: The ID of the community to which the minted land belongs.
  - **`tokenId`**: The unique identifier for the minted land.

- **`event AuthorizedSignerUpdated(address indexed oldSigner, address indexed newSigner)`**  
  Emitted when the authorized signer is updated. This event indicates changes to the signer’s address:
  - **`oldSigner`**: The previous address of the authorized signer.
  - **`newSigner`**: The new address of the authorized signer.

- **`event BaseTokenURIUpdated(string oldURI, string newURI)`**  
  Emitted when the base token URI is updated. This event captures the change in the base URI used for token metadata:
  - **`oldURI`**: The previous base URI before the update.
  - **`newURI`**: The new base URI that will be used moving forward.

- **`event SetPrice(uint256 oldPrice, uint256 newPrice)`**  
  Emitted when the mint price is changed. This event records the update in the cost of minting:
  - **`oldPrice`**: The previous price (in MX tokens) before the change.
  - **`newPrice`**: The updated price (in MX tokens) for minting a land.




## Functions

### `buyLand(uint256 communityId, uint256[] calldata tokenIds, uint256 nonce, bytes calldata signature)`
Allows users to mint multiple lands for a community by paying with MX tokens. 

**Parameters**:
- `communityId` (uint256): The ID of the community for which the lands are being minted.
- `tokenIds` (uint256[]): An array of token IDs to be minted.
- `nonce` (uint256): A unique nonce for the buyer's address, used to prevent replay attacks.
- `signature` (bytes): A valid ECDSA signature from the authorized signer to confirm the transaction.

**Reverts**:
- If the signature is invalid.
- If the nonce does not match the expected value for the user.
- If the number of token IDs exceeds the maximum allowed for the community.
- If the total MX token transfer fails.
- If any of the token IDs have already been minted.

**Events Emitted**:
- `LandMinted(address indexed buyer, uint256 communityId, uint256 tokenId)`: Emitted for each successful minting of land.

---

### `setBaseTokenURI(string calldata baseURI) external onlyOwner`
Sets the base URI for the token metadata, which can be updated by the contract owner.

**Parameters**:
- `baseURI` (string): The new base URI for the token metadata.

**Events Emitted**:
- `BaseTokenURIUpdated(string oldURI, string newURI)`: Emitted when the base URI is updated.

---

### `getNonce(address user) external view returns (uint256)`
Returns the current nonce for the specified user address. This is useful for clients to track the nonce value required for signature creation.

**Parameters**:
- `user` (address): The address of the user whose nonce is being requested.

**Returns**:
- `uint256`: The current nonce value for the specified user.

---

### `setAuthorizedSigner(address newSigner) external onlyOwner`
Updates the authorized signer address. This is the address that can create valid signatures for minting transactions.

**Parameters**:
- `newSigner` (address): The new authorized signer address.

**Reverts**:
- If the new signer address is the zero address.

**Events Emitted**:
- `AuthorizedSignerUpdated(address indexed oldSigner, address indexed newSigner)`: Emitted when the authorized signer is updated.

---

### `setPrice(uint256 newPrice) external onlyOwner`
Allows the contract owner to update the mint price for land NFTs.

**Parameters**:
- `newPrice` (uint256): The new price for minting each land in MX tokens.

**Events Emitted**:
- `SetPrice(uint256 oldPrice, uint256 newPrice)`: Emitted when the mint price is updated.

---

### `withdrawMX(address to, uint256 amount) external onlyOwner`
Allows the contract owner to withdraw MX tokens from the contract.

**Parameters**:
- `to` (address): The address to which the withdrawn MX tokens will be sent.
- `amount` (uint256): The amount of MX tokens to withdraw.

**Reverts**:
- If the withdrawal fails (e.g., insufficient balance).

---

### `_baseURI() internal view virtual override returns (string memory)`
Overrides the default base URI function for the ERC721 standard.

**Returns**:
- `string`: The base URI for token metadata.

---

### `tokenURI(uint256 tokenId) public view virtual override returns (string memory)`
Returns the full token URI for a specific token ID, including the token ID and the `.json` suffix for metadata.

**Parameters**:
- `tokenId` (uint256): The ID of the token for which to retrieve the URI.

**Returns**:
- `string`: The complete token URI for the specified token ID.



## Security Considerations

### Reentrancy
- The `buyLand` function is protected by the `nonReentrant` modifier, preventing reentrant calls and ensuring that funds cannot be manipulated during a token transfer.

### Signature Verification
- The contract verifies the signature using ECDSA to ensure that only authorized requests can mint lands. Invalid signatures will revert the transaction, maintaining the integrity of the minting process.

### Nonce Management
- Nonces are used to prevent replay attacks. Each time a user mints lands, their nonce is incremented, ensuring that each signature can only be used once.


### Input Validation
- The contract checks various conditions before minting lands:
  - Ensures that the user is minting at least one token.
  - Validates that the total minted lands do not exceed the maximum supply for the community.
  - Confirms that the specified token IDs have not been previously minted.


**License**
This project is licensed under the MIT License.


### Usage

1. Ensure you have the appropriate version of Solidity set up.
2. Deploy the contract with the required parameters.
3. Interact with the contract functions as needed for minting and managing NFTs.

### Installation

```bash
git clone
cd root
npm install
```
### Compile, Test and Deploy

```shell

npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network testnet
npx hardhat verify --network testnet <contractaddress> <_mxTokenAddress> <_authorizedSigner> <_mintPrice> <baseURI>

```