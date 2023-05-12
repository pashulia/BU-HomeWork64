// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.19;

contract HomeWork2 {

    struct Payment{
        uint256 value;
        address target;
    }

    uint256 number;
    uint256 public result;
    address public owner;
    string str;
    
    uint256[] data;
    mapping(address => Payment) payments;
    
    error NotOwner(address adr);

    event AddPayment(uint256 value, address sender, address target);
    event GetPayment(uint256 value, address sender, address target);

    constructor(string memory _str){
        owner = msg.sender;
        str = _str;
    }

    receive() external payable{}

    function sendEther(address adr, uint256 value) public payable returns(bool){
        return payable(adr).send(value);
    }

    function setNumber1(uint256 _number) public {
        require(msg.sender == owner, "You are not owner");
        number = _number;
    }

    function setNumber2(uint256 _number) public {
        if(msg.sender != owner){
            revert NotOwner(msg.sender);
        }
        number = _number;
    }

    function division(uint256 a, uint256 b) public {
        result = a / b;
    }

    function setData(uint256[] calldata _data) public {
        for(uint256 i = 0; i < _data.length; i++){
            data.push(_data[i]);
        }
    }

    function addPayment(address target) public payable {
        require(payments[msg.sender].value == 0, "You've already made a payment");
        payments[msg.sender] = Payment(msg.value, target);
        emit AddPayment(msg.value, msg.sender, target);
    }

    function sendPayment(address sender) public returns(bool) {
        Payment memory payment = payments[sender];
        require(payment.target == msg.sender, "There are no payments for you");
        bool successful = payable(payment.target).send(payment.value);
        delete payments[sender];
        emit GetPayment(payment.value, sender, payment.target);
        return successful;
    }

    function getNumber() public view returns(uint256){
        return number;
    }

    function getStr() public view returns(string memory){
        return str;
    }

    function getData() public view returns(uint256[] memory){
        return data;
    }

    function getPayment(address sender) public view returns(Payment memory){
        return payments[sender];
    }
}