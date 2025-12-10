// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract Subsidy {
    address public government; // not using now but just in case

    string public title;
    string public description;
    uint256 public initial_balance;

    constructor(
        address _government,
        string memory _title,
        string memory _description,
        uint256 _initial_balance
    ) {
        government = _government;
        title = _title;
        description = _description;
        initial_balance = _initial_balance;
    }
}
