const { ethers } = require("ethers"); // Destructure ethers to ensure proper access

// Polygon RPC provider
const providerPolygon = new ethers.JsonRpcProvider("https://polygon-rpc.com");

const calculateGasFees = async (provider) => {
  console.log("Calculating gas fees for Polygon...");
  try {
    // Get current gas fee data
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;

    console.log(
      `Current Gas Price: ${ethers.utils.formatUnits(gasPrice, "gwei")} Gwei`
    );

    // Estimate gas limit for a simple transaction (replace 'recipientAddress' with an actual address)
    const gasEstimate = await provider.estimateGas({
      to: "0x0000000000000000000000000000000000000000", // Replace with an actual address
      value: ethers.utils.parseEther("0.01"), // Amount to send (0.01 of the native token)
    });

    // Calculate the gas fee in the native token (MATIC)
    const gasFee = gasPrice.mul(gasEstimate);
    console.log(`Estimated Gas Fee: ${ethers.utils.formatUnits(gasFee, "ether")} MATIC`);

    return ethers.utils.formatUnits(gasFee, "ether");
  } catch (error) {
    console.error("Error calculating gas fees:", error);
  }
};

// Call this to check gas fees
const getGasFees = async () => {
  await calculateGasFees(providerPolygon);
};

getGasFees();
