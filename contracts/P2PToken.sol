// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract P2PToken is ERC20, Ownable {
    constructor(address initialOwner) ERC20("P2P Token", "P2P") Ownable(initialOwner) {
        _mint(initialOwner, 1690000 * 10 ** decimals()); // Mint 1,690,000 tokens to deployer
    }
}
