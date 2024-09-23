const ethers = require('ethers');
const axios = require('axios');
// ParaSwap API version
const apiVersion = '6.2';
// Token addresses (DEOD -> USDT)
const srcToken = '0x7f4b7431a4e1b9f375ef0a94224ea4ef09b4f668'; // DEOD
const destToken = '0x55d398326f99059fF775485246999027B3197955'; // USDT
// Parameters for 1 DEOD
const amount = ethers.parseUnits('1', 18).toString();  // 1 DEOD in wei
const network = 56;  // Binance Smart Chain
// Function to fetch the price quote
async function bnbCurrentPrice() {
    try {
        const url = `https://api.paraswap.io/prices/?version=${apiVersion}&srcToken=${srcToken}&destToken=${destToken}&amount=${amount}&srcDecimals=18&destDecimals=18&side=SELL&network=${network}&otherExchangePrices=true`;
        const response = await axios.get(url);
        const priceRoute = response.data.priceRoute;
        // Convert amounts to human-readable format
        const srcAmountInDEOD = ethers.formatUnits(priceRoute.srcAmount, priceRoute.srcDecimals);
        const destAmountInUSDT = ethers.formatUnits(priceRoute.destAmount, priceRoute.destDecimals);
        const priceOfOneDeod = parseFloat((destAmountInUSDT / srcAmountInDEOD).toFixed(6));
        // console.log(`Price of 1 DEOD: ${priceOfOneDeod} USDT In BNB`);
        console.log(`Current price: 1 DEOD = $${priceOfOneDeod} USDT In BNBs`);
        return priceOfOneDeod;
    } catch (error) {
        console.error('Error fetching price:', error);
    }
}
// Run the price fetch function
// getDeodPrice();
module.exports = bnbCurrentPrice;