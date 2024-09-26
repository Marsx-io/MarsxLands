// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";


contract MarsxLands is ERC721, Ownable(msg.sender), ReentrancyGuard {
    
    using ECDSA for bytes32;
    IERC20 public mxToken;

    mapping(uint256 => bool) private _mintedTokens;
    uint256 public mintPrice; // MX Token with 18 decimals
    
    uint256 public maxLandPerCommunity = 1000000;
    mapping(uint256 => uint256) public communityLandCount; // Tracks the number of lands minted for each community
    address private authorizedSigner;
    mapping(address => uint256) public nonces;

    
    string private _baseTokenURI; // Base URI for all token metadata


    event LandMinted(address indexed buyer, uint256 communityId, uint256 tokenId);
    event AuthorizedSignerUpdated(address indexed oldSigner, address indexed newSigner);
    event BaseTokenURIUpdated(string oldURI, string newURI);
    event SetPrice(uint256 oldPrica, uint256 newPrice);

    
    constructor(
            address _mxTokenAddress, 
            address _authorizedSigner,
            uint256 _mintPrice,
            string memory baseURI
        ) ERC721("MarsX-Skylanders", "MXL") {
            mxToken = IERC20(_mxTokenAddress);
            authorizedSigner = _authorizedSigner;
            mintPrice = _mintPrice;
            _baseTokenURI = baseURI;
    }

    // Function to mint lands
    function buyLand(
            uint256 communityId,
            uint256[] calldata tokenIds,
            uint256 nonce,
            bytes calldata signature
        ) external nonReentrant {

         // Verify signature
        bytes32 hash = keccak256(abi.encodePacked(authorizedSigner, communityId, tokenIds, nonce));
        bytes32 ethSignedMessage = MessageHashUtils.toEthSignedMessageHash(hash);  
        require(ECDSA.recover(ethSignedMessage, signature) == authorizedSigner, "Invalid signature");
        require(nonce == nonces[msg.sender], "Invalid nonce");

        nonces[msg.sender]++;   // Increment nonce for the sender

        require(tokenIds.length > 0, "Must mint at least one token");
        require(communityLandCount[communityId] + tokenIds.length <= maxLandPerCommunity, "Exceeds maximum land supply");

        uint256 totalPrice = mintPrice * tokenIds.length;
        require(mxToken.transferFrom(msg.sender, address(this), totalPrice), "MX Token transfer failed");

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(!_exists(tokenId), "Token already minted");
            _mint(msg.sender, tokenId);
            _mintedTokens[tokenId] = true;
            communityLandCount[communityId] ++;
            emit LandMinted(msg.sender, communityId, tokenId);
        }

    }

     function _exists(uint256 tokenId) internal view returns (bool) {
        return _mintedTokens[tokenId];
    }

     // Function to override the base token URI for all tokens
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    // Function to return the full token URI including tokenId and .json
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 
            ? string(abi.encodePacked(baseURI, Strings.toString(tokenId), ".json")) 
            : "";
    }

    // Public function to set the base token URI (onlyOwner)
    function setBaseTokenURI(string calldata baseURI) external onlyOwner {
        emit BaseTokenURIUpdated(_baseTokenURI, baseURI);
        _baseTokenURI = baseURI;
    }

    function getNonce(address user) external view returns (uint256) {
        return nonces[user];
    }

    // Function to update the authorized signer
    function setAuthorizedSigner(address newSigner) external onlyOwner {
        require(newSigner != address(0), "Invalid Address");
        emit AuthorizedSignerUpdated(authorizedSigner, newSigner);
        authorizedSigner = newSigner;
    }

    // Owner function to set/change the ERC20 token price
    function setPrice(uint256 newPrice) external onlyOwner {
        emit SetPrice(mintPrice, newPrice);
        mintPrice = newPrice;
    }

    // Function to withdraw MX tokens (onlyOwner)
    function withdrawMX(address to, uint256 amount) external onlyOwner {
        require(mxToken.transfer(to, amount), "Withdrawal failed");
    }
}
