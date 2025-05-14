// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import {IERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title ValutContract
 * @dev This contract manages the withdrawal of ERC20 tokens to a specified ValutOfframp address.
 */
contract ValutContract is Ownable {
    using SafeERC20 for IERC20;

    // Address of the ValutOfframp contract
    address public valutOfframpAddress;

    // Events
    event TokensWithdrawn(address indexed token, uint256 amount, address indexed to);
    event ValutOfframpAddressUpdated(address indexed oldAddress, address indexed newAddress);

    /**
     * @dev Constructor to initialize the contract with an owner and the ValutOfframp address
     * @param initialOwner The initial owner of the contract
     * @param _valutOfframpAddress The initial ValutOfframp address
     */
    constructor(address initialOwner, address _valutOfframpAddress) Ownable(initialOwner) {
        require(_valutOfframpAddress != address(0), "ValutContract: zero address");
        valutOfframpAddress = _valutOfframpAddress;
        
        emit ValutOfframpAddressUpdated(address(0), _valutOfframpAddress);
    }

    /**
     * @dev Withdraws ERC20 tokens to the ValutOfframp address
     * @param token The ERC20 token to withdraw
     * @param amount The amount of tokens to withdraw
     */
    function withdrawTokens(address token, uint256 amount) external onlyOwner {
        require(token != address(0), "ValutContract: token is zero address");
        require(amount > 0, "ValutContract: amount must be greater than zero");
        require(valutOfframpAddress != address(0), "ValutContract: offramp not set");

        IERC20(token).safeTransfer(valutOfframpAddress, amount);
        
        emit TokensWithdrawn(token, amount, valutOfframpAddress);
    }

    /**
     * @dev Updates the ValutOfframp address
     * @param newValutOfframpAddress The new ValutOfframp address
     */
    function updateValutOfframpAddress(address newValutOfframpAddress) external onlyOwner {
        require(newValutOfframpAddress != address(0), "ValutContract: zero address");
        
        address oldAddress = valutOfframpAddress;
        valutOfframpAddress = newValutOfframpAddress;
        
        emit ValutOfframpAddressUpdated(oldAddress, newValutOfframpAddress);
    }
}
