require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.19",
  networks: {
    local: {
      url: "http://localhost:8545",
      chainId: 1337,
    }
  }
}; 