// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract SecureStorage {
    address private owner;
    bytes[] private blocks;

    event OwnerSet(address indexed oldOwner, address indexed newOwner);

    modifier isOwner() {
        require(msg.sender == owner, 'Caller is not owner');
        _;
    }

    constructor() {
        owner = msg.sender; // 'msg.sender' is sender of current call, contract deployer for a constructor
        emit OwnerSet(address(0), owner);
    }

    function changeOwner(address newOwner) public isOwner {
        emit OwnerSet(owner, newOwner);
        owner = newOwner;
    }

    function getOwner() external view returns (address) {
        return owner;
    }

    function newBlock(bytes memory hash) public isOwner {
        blocks.push(hash);
    }

    function getBlock(uint256 index) public view returns (bytes memory) {
        return blocks[index];
    }

    function getLength() public view returns (uint256) {
        return blocks.length;
    }
}
