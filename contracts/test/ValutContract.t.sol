// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "../lib/forge-std/src/Test.sol";
import "../src/ValutContract.sol";
import {ERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {console} from "../lib/forge-std/src/console.sol";

// Mock ERC20 contract for testing
contract ERC20Mock is ERC20 {
    constructor() ERC20("Mock Token", "MTK") {}
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract ValutContractTest is Test {
    ValutContract valut;
    ERC20Mock mockToken;
    
    address owner = address(0x1);
    address nonOwner = address(0x2);
    address valutOfframpAddress = address(0x3);
    address newValutOfframpAddress = address(0x4);
    uint256 depositAmount = 1000 * 10**18; // 1000 tokens
    
    function setUp() public {
        // Deploy mock token
        mockToken = new ERC20Mock();
        mockToken.mint(address(this), depositAmount);
        
        // Deploy direct contract
        valut = new ValutContract(owner, valutOfframpAddress);
        
        // Transfer tokens to the contract
        mockToken.transfer(address(valut), depositAmount);
    }
    
    function testInitialState() public {
        assertEq(valut.owner(), owner);
        assertEq(valut.valutOfframpAddress(), valutOfframpAddress);
    }
    
    function testWithdrawTokens() public {
        // Check initial balances
        assertEq(mockToken.balanceOf(address(valut)), depositAmount);
        assertEq(mockToken.balanceOf(valutOfframpAddress), 0);
        
        // Withdraw tokens
        vm.prank(owner);
        valut.withdrawTokens(address(mockToken), depositAmount);
        
        // Check balances after withdrawal
        assertEq(mockToken.balanceOf(address(valut)), 0);
        assertEq(mockToken.balanceOf(valutOfframpAddress), depositAmount);
    }
    
    function testWithdrawTokensNotOwner() public {
        vm.prank(nonOwner);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", nonOwner));
        valut.withdrawTokens(address(mockToken), depositAmount);
    }
    
    function testWithdrawTokensZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert("ValutContract: token is zero address");
        valut.withdrawTokens(address(0), depositAmount);
    }
    
    function testWithdrawTokensZeroAmount() public {
        vm.prank(owner);
        vm.expectRevert("ValutContract: amount must be greater than zero");
        valut.withdrawTokens(address(mockToken), 0);
    }
    
    function testUpdateValutOfframpAddress() public {
        vm.prank(owner);
        valut.updateValutOfframpAddress(newValutOfframpAddress);
        assertEq(valut.valutOfframpAddress(), newValutOfframpAddress);
    }
    
    function testUpdateValutOfframpAddressNotOwner() public {
        vm.prank(nonOwner);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", nonOwner));
        valut.updateValutOfframpAddress(newValutOfframpAddress);
    }
    
    function testUpdateValutOfframpAddressZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert("ValutContract: zero address");
        valut.updateValutOfframpAddress(address(0));
    }
}
