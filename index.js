console.log("JAI SHREE RAM / JAI BAJARANG BALI JI");
const bnbCurrentPrice = require("./constants/bnb_deod");
const polygonCurrentPrice = require("./constants/polygon_deod");

const main = async () => {
  const deod_polygon = parseFloat(await polygonCurrentPrice());
  const deod_bnb = parseFloat(await bnbCurrentPrice());

  // Check if values are valid numbers
  if (isNaN(deod_polygon) || isNaN(deod_bnb)) {
    console.error("Invalid price data");
    return;
  }

  // Calculate the percentage difference
  const percentageDifference =
    (Math.abs(deod_polygon - deod_bnb) / deod_polygon) * 100;
  console.log(percentageDifference, "percentageDifference");

  // Check if difference is greater than 5%
  if (percentageDifference >= 5) {
    console.log("Arbitrage opportunity available!");

    // Price comparison
    if (deod_polygon > deod_bnb) {
      console.log("Polygon price is higher and BNB price is lower.");
    } else if (deod_polygon < deod_bnb) {
      console.log("BNB price is higher and Polygon price is lower.");
      // buy karunga polygon se and sell karunga bnb network par 

    } else {
      console.log("Both prices are the same.");
    }
  } else {
    console.log("No significant arbitrage opportunity.");
  }
};

const data = async () => {
  while (true) {
    await main(); // Run the main function
    console.log("-----------------");
    
    await new Promise((resolve) => setTimeout(resolve, 15000)); // Wait for 5 seconds
  }
};
data();

