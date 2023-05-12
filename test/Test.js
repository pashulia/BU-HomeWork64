const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { PANIC_CODES } = require("@nomicfoundation/hardhat-chai-matchers/panic")
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HomeWork2", function () {
    async function deploy() {
        const str = "Hello";
        const [owner, user, otherAccount] = await ethers.getSigners();
        const HomeWork2 = await ethers.getContractFactory("HomeWork2");
        const homeWork2 = await HomeWork2.deploy(str);
        await homeWork2.deployed();
        return { homeWork2, str, owner, user, otherAccount };
    }

    describe("Deployment", function () {
        it("Check string", async () => {
            const { homeWork2, str } = await loadFixture(deploy);
            expect(str).to.equal(await homeWork2.getStr());
        })
        it("Check owner", async () => {
            const { homeWork2, owner } = await loadFixture(deploy);
            expect(owner.address).to.equal(await homeWork2.owner());
        })
    });

    describe("sendEther", function () {
        describe("sendEther", () => {
            it("sendEther", async () => {
                const { homeWork2, user } = await loadFixture(deploy);
                const eth = ethers.utils.parseUnits("1.0", "ether");
                const value = ethers.utils.parseUnits("0.5", "ether");
                await expect(homeWork2.sendEther(user.address, value, { value: eth }))
                .to.changeEtherBalances(
                    [user, homeWork2.address],
                    [value, eth.sub(value)]
                )
            })
        })
    })

    describe("SetNumber", function () {
        describe("SetNumber1", function () {
            it("Not owner", async () => {
                const { homeWork2, otherAccount } = await loadFixture(deploy);
                const number = 200;
                await expect(homeWork2.connect(otherAccount).setNumber1(number))
                .revertedWith("You are not owner")
            })
            it("SetNumber1", async () => {
                const { homeWork2 } = await loadFixture(deploy);
                const number = 200;
                await expect(homeWork2.setNumber1(number))
                .not.to.be.reverted
                expect(number).to.equal(await homeWork2.getNumber());
            })
        })
        describe("SetNumber2", function () {
          it("SetNumber2", async () => {
              const { homeWork2 } = await loadFixture(deploy);
              const number = 300;
              await expect(homeWork2.setNumber2(number))
              .not.to.be.reverted
              expect(number).to.equal(await homeWork2.getNumber());
          })
          it("RevertError", async () => {
              const { homeWork2, otherAccount } = await loadFixture(deploy);
              const number = 400;
              const res = homeWork2.connect(otherAccount).setNumber2(number);
              await expect(res).to.be.revertedWithCustomError(homeWork2, "NotOwner").withArgs(otherAccount.address);
          })
        })
    });

    describe("Devision", function () {
        describe("Requires", function () {
            it("Devision by zero", async () => {
                const { homeWork2 } = await loadFixture(deploy);
                const [a, b] = [1, 0];
                await expect(homeWork2.division(a, b))
                .to.revertedWithPanic(PANIC_CODES.DIVISION_BY_ZERO)
            })
        })
        describe("Division", function () {
            it("Check result", async () => {
                const { homeWork2 } = await loadFixture(deploy);
                const [a, b] = [100, 33];
                const result = (a - (a % b)) / b;
                const tx = await homeWork2.division(a, b);
                await tx.wait();
                expect(await homeWork2.result()).to.equal(result);
            })
        })
        
    })

    describe("SetData", function () {
        describe("SetData", function () {
            it("Check array", async () => {
                const { homeWork2 } = await loadFixture(deploy);
                const data = [1, 2, 3, 4, 5];
                await homeWork2.setData(data);
                expect(await homeWork2.getData()).to.deep.equal(data);
            })
        })
    });

    describe("AddPayament", function () {
        describe("Require", function () {
            it("Check sendPayament", async () => {
                const { homeWork2, owner, user } = await loadFixture(deploy);
                const eth = ethers.utils.parseUnits("1.0", "ether");
                const tx = await homeWork2.addPayment(user.address, { value: eth });
                await tx.wait();
                let payament = await homeWork2.getPayment(owner.address);
                expectPayament = { value: eth, target: user.address };
                returnPayament = { value: payament.value, target: payament.target };
                expect(expectPayament).to.deep.equal(returnPayament);
                await expect(homeWork2.addPayment(user.address, { value: eth }))
                .to.revertedWith("You've already made a payment");
            })
        })
        describe("Check SendPayament", function () {
            it("Check change balance", async () => {
                const { homeWork2, owner, user } = await loadFixture(deploy);
                const eth = ethers.utils.parseUnits("1.0", "ether");
                await expect(homeWork2.addPayment(user.address, { value: eth }))
                .to.changeEtherBalances(
                    [owner.address, homeWork2.address],
                    [eth.mul(-1), eth]
                )
            })
            it("Check change payaments", async () => {
                const { homeWork2, owner, user } = await loadFixture(deploy);
                const eth = ethers.utils.parseUnits("1.0", "ether");
                const tx = await homeWork2.addPayment(user.address, { value: eth });
                await tx.wait();
                let payament = await homeWork2.getPayment(owner.address);
                expectPayament = { value: eth, target: user.address };
                returnPayament = { value: payament.value, target: payament.target };
                expect(expectPayament).to.deep.equal(returnPayament);
            })
        })
        describe("Event", function () {
            it("Check AddPayment", async () => {
                const { homeWork2, owner, user } = await loadFixture(deploy);
                const eth = ethers.utils.parseUnits("1.0", "ether");
                await expect(homeWork2.addPayment(user.address, { value: eth }))
                .to.emit(homeWork2, "AddPayment")
                .withArgs(eth, owner.address, user.address)
            })
        })
    });

    describe("SendPayament", function () {
        describe("Require", function () {
            it("Check sendPayament", async () => {
                const { homeWork2, owner, user } = await loadFixture(deploy);
                await expect(homeWork2.sendPayment(owner.address))
                .to.revertedWith("There are no payments for you");
            })
        })
        describe("SendPayament", function () {
            it("Check change balance", async () => {
                const { homeWork2, owner, user } = await loadFixture(deploy);
                const eth = ethers.utils.parseUnits("1.0", "ether");
                const tx = await homeWork2.addPayment(user.address, { value: eth });
                await tx.wait();
                await expect(homeWork2.connect(user).sendPayment(owner.address))
                .to.changeEtherBalances(
                    [homeWork2.address, user.address],
                    [eth.mul(-1), eth]
                )
            })
            it("Check change payaments", async () => {
                const { homeWork2, owner, user } = await loadFixture(deploy);
                const eth = ethers.utils.parseUnits("1.0", "ether");
                let tx = await homeWork2.addPayment(user.address, { value: eth });
                await tx.wait();
                tx = await homeWork2.connect(user).sendPayment(owner.address);
                tx.wait();
                const payment = await homeWork2.getPayment(owner.address);
                ecpectPayment = { value: 0, target: ethers.constants.AddressZero };
                returnPayment = { value: payment.value, target: payment.target }; 
                expect(ecpectPayment).to.deep.equal(returnPayment);
            })
        })
        describe("Event", function () {
            it("Check GetPayment", async () => {
                const { homeWork2, owner, user } = await loadFixture(deploy);
                const eth = ethers.utils.parseUnits("1.0", "ether");
                let tx = await homeWork2.addPayment(user.address, { value: eth });
                await tx.wait();
                await expect(homeWork2.connect(user).sendPayment(owner.address))
                .to.emit(homeWork2, "GetPayment")
                .withArgs(eth, owner.address, user.address)
            })
        })
    });
});
