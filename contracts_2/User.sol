// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./Subsidy.sol";

contract User {
    // user
    //      register
    //      add subsidy wallet to user
    //      view all subsidy wallets

    address public government;
    string public IC;

    Subsidy[] subsidies;
    mapping(address => uint256) public balance;
    mapping(address => bool) public subsidyExists;

    constructor(address _government, string memory _IC) {
        government = _government;
        IC = _IC;
    }

    modifier onlyGovernment() {
        require(msg.sender == government, "Only government authorized");
        _;
    }

    function addSubsidy(Subsidy subsidy) external onlyGovernment {
        // no checks here
        // some subsidies can be repeatedly redeemed

        balance[address(subsidy)] += subsidy.initial_balance();
        if (!subsidyExists[address(subsidy)]) {
            subsidies.push(subsidy);
            subsidyExists[address(subsidy)] = true;
        }
    }

    function getAllSubsidies() external view returns (Subsidy[] memory) {
        return subsidies;
    }

    function consumeSubsidy(address subsidy, uint256 amount) external {
        require(
            subsidyExists[subsidy],
            "User does not have access to this subsidy"
        );
        require(balance[subsidy] >= amount, "Insufficient subsidy funds");

        balance[subsidy] -= amount;
    }
}
