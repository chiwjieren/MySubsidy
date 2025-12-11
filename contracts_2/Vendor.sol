// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./Subsidy.sol";

contract Vendor {
    // vendor
    //      register
    //      add allowed subsidy
    //      remove allowed subsidy
    //      cash out

    address public government;
    string name;

    mapping(address => bool) public allowedSubsidies;
    address[] public subsidies;

    uint256 balance;

    modifier onlyGovernment() {
        require(msg.sender == government, "Only government authorized");
        _;
    }

    constructor(address _government, string memory _name) {
        government = _government;
        name = _name;
    }

    function allowSubsidy(address subsidy) public onlyGovernment {
        require(!allowedSubsidies[subsidy], "Subsidy already allowed");
        allowedSubsidies[subsidy] = true;
        subsidies.push(subsidy);
    }

    function disallowSubsidy(address subsidy) public onlyGovernment {
        require(allowedSubsidies[subsidy], "Subsidy not allowed");
        allowedSubsidies[subsidy] = false;

        for (uint i = 0; i < subsidies.length; i++) {
            if (subsidies[i] == subsidy) {
                subsidies[i] = subsidies[subsidies.length - 1];
                subsidies.pop();
                break;
            }
        }
    }

    function checkAllowedSubsidy(address subsidy) public view returns (bool) {
        return allowedSubsidies[subsidy];
    }

    function checkAllowedSubsidyMultiple(
        address[] calldata subsidyAddresses
    ) external view returns (address[] memory) {
        address[] memory temp = new address[](subsidyAddresses.length);

        // evm pmo
        uint count = 0;
        for (uint i = 0; i < subsidyAddresses.length; i++) {
            address subsidy = subsidyAddresses[i];

            if (allowedSubsidies[subsidy]) {
                temp[count] = subsidy;
                count++;
            }
        }

        address[] memory result = new address[](count);
        for (uint i = 0; i < count; i++) {
            result[i] = temp[i];
        }
        return result;
    }

    function getAllSubsidies() public view returns (address[] memory) {
        return subsidies;
    }

    // #region payment
    function receiveFunds(
        address subsidy,
        uint256 amount
    ) public onlyGovernment {
        // check if can use that subsidy for this vendor
        require(
            allowedSubsidies[subsidy],
            "Vendor does not accept this subsidy"
        );

        // mint myrc tokens here
        balance += amount;
    }

    function resetBalance() public onlyGovernment returns (uint256) {
        uint256 b = balance;
        balance = 0;
        return b;
    }
    // #endregion
}
