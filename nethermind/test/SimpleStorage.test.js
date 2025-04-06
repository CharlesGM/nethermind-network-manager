const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleStorage", function () {
  let simpleStorage;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await SimpleStorage.deploy();
  });

  describe("Basic functionality", function () {
    it("Should return the initial value as 0", async function () {
      expect(await simpleStorage.getValue()).to.equal(0);
    });

    it("Should set the value correctly", async function () {
      const newValue = 42;
      await simpleStorage.setValue(newValue);
      expect(await simpleStorage.getValue()).to.equal(newValue);
    });

    it("Should emit ValueChanged event when value is updated", async function () {
      const newValue = 100;
      await expect(simpleStorage.setValue(newValue))
        .to.emit(simpleStorage, "ValueChanged")
        .withArgs(newValue);
    });
  });
}); 