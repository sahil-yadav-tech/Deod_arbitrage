const ethers = require("ethers");
const colors = require("colors");
const {
  factoryAddress,
  routerAddress,
  fromAddress,
  toAddress,
} = require("./address");
const { erc20ABI, factoryAbi, pairABI, routerAbi, usdtAbi } = require("./abi");
// const approveForBuy = require("./constant/approveForBuy");
const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");

//!PRIVATE KEY
const prv_key =
  "a4f4b4e6c8526f23265bf4a27771b67ee9cc5b6538608b0b4ade1c1d65be89b5";

//!METAMASK ADDRESS
const signer = new ethers.Wallet(prv_key, provider);
console.log(signer.address, "Metamask Address");

const routerInstance = new ethers.Contract(routerAddress, routerAbi, signer);
const token1 = new ethers.Contract(fromAddress, erc20ABI, signer); // USDT
const token2 = new ethers.Contract(toAddress, erc20ABI, signer); // DEOD

//!FETCH PRICE FOR BUY
const priceFetchForBuy = async (amount) => {
  const decimal1 = await token1.decimals();
  const decimal2 = await token2.decimals();
  const amountIn = ethers.parseUnits(amount, decimal1).toString();

  // Fetch the amounts out
  const amountsOut1 = await routerInstance.getAmountsOut(amountIn, [
    fromAddress,
    toAddress,
  ]);

  const getAmountOfUsdt = amountsOut1[0].toString();
  const getAmountOfDeod = amountsOut1[1].toString();

  // Convert the amount to human-readable format
  const getAmountOfDeodInHumanFormat = ethers.formatUnits(
    getAmountOfDeod,
    decimal2
  );
  const getAmountOfUsdtInHumanFormat = ethers.formatUnits(
    getAmountOfUsdt,
    decimal1
  );


  return {
    getAmountOfUsdt,
    getAmountOfDeod,
    getAmountOfUsdtInHumanFormat,
    getAmountOfDeodInHumanFormat,
  };
};

//TODO: MAIN BUY FUNCTION
const buyTokens = async (getAmountOfUsdt, getAmountOfDeod) => {
  console.log(colors.bgBrightYellow("INSIDE BUY TOKEN"));

  const balanceInWei = await provider.getBalance(signer.address);
  console.log("balanceInWeiForBuy", balanceInWei);

  const matic = await ethers.formatEther(balanceInWei);
  console.log("matic for Buy", matic);

  // Check balance of USDT in wallet
  const getBalanceOfUsdtOfWallet = (
    await token1.balanceOf(signer.address)
  ).toString();
  console.log("getBalanceOfUsdtOfWallet", getBalanceOfUsdtOfWallet);

  const getBalanceOfUsdtInHumanFormat = getBalanceOfUsdtOfWallet / 10 ** 6;
  console.log("getBalanceOfUsdtInHumanFormat", getBalanceOfUsdtInHumanFormat);

  const quoteInHumanFormat = getAmountOfUsdt / 10 ** 6;

  // Check if user has enough MATIC and USDT
  if (matic >= 0.4) {
    if (getBalanceOfUsdtOfWallet >= quoteInHumanFormat) {
      console.log(true);
      const buyTokensTx = await routerInstance.swapExactTokensForTokens(
        getAmountOfUsdt,
        getAmountOfDeod,
        [
          "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // USDT
          "0xE77aBB1E75D2913B2076DD16049992FFeACa5235", // DEOD
        ],
        signer.address,
        Math.floor(Date.now() / 1000) + 60 * 20 // 20-minute deadline
      );

      const transaction2 = await provider.waitForTransaction(
        buyTokensTx.hash,
        1,
        150000
      );
      console.log("transaction2", transaction2);
    } else {
      console.log("Insufficient USDT Amount");
    }
  } else {
    console.log("Insufficient MATIC for buying");
  }
};

//TODO: CALLING BUY FUNCTION
const forBuy = async (buyPrice) => {
  // Fetch price data
  const { getAmountOfUsdt, getAmountOfDeod, getAmountOfUsdtInHumanFormat } =
    await priceFetchForBuy("1.1");

  const getAllowance = (
    await token1.allowance(signer.address, routerAddress)
  ).toString();

  console.log(getAllowance, "get Allowance");

  const getAllowanceInHumanFormat = getAllowance / 10 ** 6;
  console.log(getAllowanceInHumanFormat, ", getAllowanceInHumanFormat");

  // Check if allowance is sufficient
  if (getAllowanceInHumanFormat >= getAmountOfUsdtInHumanFormat) {
    try {
      console.log(colors.bgGreen("ALREADY APPROVED for Buy"));
      await buyTokens(getAmountOfUsdt, getAmountOfDeod);
    } catch (error) {
      console.log(error.message);
    }
    console.log("Only buy");
    
  } else {
    console.log("Approve and sell");
    
    // try {
    //   console.log(colors.bgRed("NOT approved for Buy"));
    //   await approveForBuy(1);
    //   await buyTokens(getAmountOfUsdt, getAmountOfDeod);
    // } catch (error) {
    //   console.log(error.message, "Error in buy process");
    // }
  }
};

// Call forBuy
(async () => {
  await forBuy();
})();
