// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "../lib/forge-std/src/Script.sol";
import {ValutContract} from "../src/ValutContract.sol";
import {console} from "../lib/forge-std/src/console.sol";

contract DeployValut is Script {
    function run() external {
        // Read deployment parameters from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address valutOfframpAddress = vm.envAddress("VALUT_OFFRAMP_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy contract directly
        ValutContract valut = new ValutContract(
            vm.addr(deployerPrivateKey),
            valutOfframpAddress
        );
        console.log("ValutContract deployed at:", address(valut));
        
        // Log information for verification
        console.log("Contract owner:", valut.owner());
        console.log("ValutOfframp address:", valut.valutOfframpAddress());
        
        vm.stopBroadcast();
    }
}
