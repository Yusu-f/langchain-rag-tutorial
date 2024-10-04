const fs = require("fs");
const getDataFeedsJsonFile =
  "./artifacts/contracts/GettingDataFeeds_onchain.sol/GettingDataFeeds_onchain.json";
const parsedDataFeeds = JSON.parse(fs.readFileSync(getDataFeedsJsonFile));
const getDataFeedsAbi = parsedDataFeeds.abi;

const CONTRACT_ADDR = "0xdAf6a08dd5c5Be3Cea44c5c7036b3FF373d2CE13";
const FLARE_CONTRACTS = "@flarenetwork/flare-periphery-contract-artifacts";
const FLARE_RPC = "https://coston-api.flare.network/ext/C/rpc";
const DATA_PROVIDER_URL = "https://test-data-provider.flare.rocks";
const DATA_PROVIDER_APIKEY = "ftsov2-tutorial";
const FTSO_PROTOCOL_ID = 100;

async function runGettingDataFeeds_onchain(feed_category, feed_name) {
  // 1. Import Dependencies
  const ethers = await import("ethers");
  const utils = await import(`${FLARE_CONTRACTS}/dist/coston/utils/utils.js`);
  const provider = new ethers.JsonRpcProvider(FLARE_RPC);

  // 2. Retrieve the Smart Contract
  const getDataFeedsContract = new ethers.Contract(
    CONTRACT_ADDR,
    getDataFeedsAbi,
    provider
  );

  // 3. Retrieve the Previous Round ID
  const roundId = await getDataFeedsContract.getPreviousRoundId();

  // 4. Fetch Feed Data from Data Provider
  const feedId = utils.getFeedId(feed_category, feed_name);
  let rawData;
  try {
    rawData = await fetch(
      `${DATA_PROVIDER_URL}/specific-feed/${feedId}/${roundId}`,
      {
        method: "GET",
        headers: {
          "X-API-KEY": DATA_PROVIDER_APIKEY,
          Accept: "application/json",
        },
      }
    );
  } catch (error) {
    console.log(error);
    return;
  }
  const data = await rawData.json();
  const body = data.feedWithProof.body;

  // 5. Send Feed Data to Contract for Verification
  const validProof = await getDataFeedsContract.verifyFeed(
    FTSO_PROTOCOL_ID,
    roundId,
    data.feedWithProof
  );
  if (validProof) {
    const price = body.value / 10 ** body.decimals;
    console.log(`Verified price for ${feed_name}: ${price}`);
  } else {
    console.log(
      `Feed data obtained from ${DATA_PROVIDER_URL}` +
      ` does not match on-chain hash!`
    );
  }
}

runGettingDataFeeds_onchain("1", "BTC/USD");
