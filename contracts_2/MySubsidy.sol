// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./User.sol";
import "./Vendor.sol";
import "./MockMYRc.sol";

contract MySubsidy {
    // user
    //      register
    //      add subsidy wallet to user
    // vendor
    //      register
    //      add allowed subsidy
    //      remove allowed subsidy
    // subsidy
    //      register

    address government;
    MockMYRc myrc;

    mapping(string => address) userICMapping;
    mapping(address => bool) userExists;
    mapping(address => bool) vendorExists;
    mapping(address => bool) subsidyExists;
    User[] public users;
    Vendor[] public vendors;
    Subsidy[] public subsidies;

    constructor(address _myrc) {
        government = msg.sender;
        myrc = MockMYRc(_myrc);
    }

    modifier onlyGovernment() {
        require(msg.sender == government, "Only government authorized");
        _;
    }

    function registerUser(string calldata _IC) external onlyGovernment {
        require(
            userICMapping[_IC] == address(0),
            "This IC has already been registered."
        );

        User user = new User(address(this), _IC);
        users.push(user);
        userExists[address(user)] = true;
        userICMapping[_IC] = address(user);
    }

    function registerVendor(string calldata _name) external onlyGovernment {
        Vendor vendor = new Vendor(address(this), _name);
        vendors.push(vendor);
        vendorExists[address(vendor)] = true;
    }

    function allowSubsidy(address subsidy, address vendorAddress) external onlyGovernment {
        require(vendorExists[vendorAddress], "Vendor does not exist");
        Vendor vendor = Vendor(vendorAddress);

        vendor.allowSubsidy(subsidy);
    }

    // #region payment
    function pay(
        address vendorAddress,
        address userAddress,
        address subsidyAddress,
        uint256 amount
    ) public {
        require(userExists[userAddress], "User does not exist");
        require(vendorExists[vendorAddress], "Vendor does not exist");

        User user = User(userAddress);
        Vendor vendor = Vendor(vendorAddress);

        user.consumeSubsidy(subsidyAddress, amount);
        vendor.receiveFunds(subsidyAddress, amount);
    }

    function cashOut(
        address vendorAddress
    ) external onlyGovernment {
        // mints X MYRc on vendor's address
        require(vendorExists[vendorAddress], "Vendor does not exist");
        Vendor vendor = Vendor(vendorAddress);
        uint256 amount = vendor.resetBalance();
        myrc.mint(vendorAddress, amount);
    }
    // #endregion

    // #region subsidy
    function registerSubsidy(
        string memory _title,
        string memory _description,
        uint256 _initial_balance
    ) external onlyGovernment {
        Subsidy subsidy = new Subsidy(
            address(this),
            _title,
            _description,
            _initial_balance
        );
        subsidies.push(subsidy);
        subsidyExists[address(subsidy)] = true;
    }

    function distributeSubsidyByIC(
        address subsidy,
        string[] calldata userICs
    ) external {
        require(subsidyExists[subsidy], "Subsidy doesn't exist");

        for (uint i = 0; i < userICs.length; i++) {
            string memory IC = userICs[i];
            require(userICMapping[IC] != address(0), "IC not registered");
            // should i be doing this in a loop?

            User user = User(userICMapping[IC]);
            user.addSubsidy(Subsidy(subsidy));
        }
    }

    function distributeSubsidy(
        address subsidy,
        address[] calldata userAddresses
    ) external {
        require(subsidyExists[subsidy], "Subsidy doesn't exist");

        for (uint i = 0; i < userAddresses.length; i++) {
            address userAddress = userAddresses[i];
            require(userExists[userAddress], "User does not exist");

            User user = User(userAddress);
            user.addSubsidy(Subsidy(subsidy));
        }
    }
    // #endregion
}
