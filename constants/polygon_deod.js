const ethers = require("ethers");
const { routerAddress, fromAddress, toAddress } = require("../Exchanges/POLYGON/address");
const { routerAbi } = require("../Exchanges/POLYGON/abi");
const { erc20ABI } = require("../Exchanges/POLYGON/abi");

//!PRIVATE KEY
const prv_key = "32e6767e9f60c6ffa36bb825c25ebe75b8ecd9d0a29eb6bf3221c112d68733a0";
const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");
//!METAMASK ADDRESS
const signer = new ethers.Wallet(prv_key, provider);
console.log(signer.address, "Metamask Address");

const routerInstance = new ethers.Contract(routerAddress, routerAbi, signer);
const token1 = new ethers.Contract(fromAddress, erc20ABI, signer); // USDT
const token2 = new ethers.Contract(toAddress, erc20ABI, signer); // DEOD

const polygonCurrentPrice = async () => {
  try {
    const decimal1 = await token1.decimals(); // USDT decimals (generally 6 for USDT)
    const decimal2 = await token2.decimals(); // DEOD decimals

    // Amount in DEOD to check the price (1 DEOD)
    const amountInDeod = ethers.parseUnits("1", decimal2);

    // Fetch the amount of USDT for 1 DEOD
    let amountsOut = await routerInstance.getAmountsOut(amountInDeod, [
      toAddress, // from DEOD
      fromAddress, // to USDT
    ]);

    // Convert the amount ofof USDT from smallest units to human-readable format
    const usdtAmountFor1Deod = ethers.formatUnits(amountsOut[1], decimal1);
    console.log(`Current price: 1 DEOD = $${usdtAmountFor1Deod} USDT In POLYGON`);
    return usdtAmountFor1Deod;
  } catch (error) {
    console.error("Error fetching current price:", error);
  }
};

// fetchCurrentPriceInDollars();
module.exports = polygonCurrentPrice;
