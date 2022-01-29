require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-ethers");

require("dotenv").config();

const rinkebyUrl = process.env.RINKEBY_URL;
const privateKey = process.env.PRIVATE_KEY;


module.exports = {
  solidity: "0.8.3",
  settings: {
    optimizer: {
      enabled: true
    }
  },
  networks: {
    rinkeby: {
      url: rinkebyUrl,
      accounts: [`0x${privateKey}`]
    }
  }
};
