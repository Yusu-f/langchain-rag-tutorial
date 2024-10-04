const FLARE_CONTRACTS = "@flarenetwork/flare-periphery-contract-artifacts";
const FLARE_RPC = "https://coston-api.flare.network/ext/C/rpc";
const DATA_PROVIDER_URL = "https://test-data-provider.flare.rocks";
const DATA_PROVIDER_APIKEY = "ftsov2-tutorial";
const FLARE_CONTRACT_REGISTRY_ADDR =
  "0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019";
const FTSO_PROTOCOL_ID = 100;

async function runGettingDataFeeds_JS(feed_category, feed_name) {

  // 1. Import Dependencies
  const ethers = await import("ethers");
  const flare = await import(FLARE_CONTRACTS);
  const utils = await import(`${FLARE_CONTRACTS}/dist/coston/utils/utils.js`);
  const provider = new ethers.JsonRpcProvider(FLARE_RPC);
  const abiEncoder = ethers.AbiCoder.defaultAbiCoder();

  // 2. Access the Contract Registry
  const flareContractRegistry = new ethers.Contract(
    FLARE_CONTRACT_REGISTRY_ADDR,
    flare.nameToAbi("FlareContractRegistry", "coston").data,
    provider
  );

  // 3. Retrieve the Relay Contract
  const relayAddress = await flareContractRegistry.getContractAddressByName(
    "Relay"
  );
  const relay = new ethers.Contract(
    relayAddress,
    flare.nameToAbi("IRelay", "coston").data,
    provider
  );

  // 4. Retrieve Merkle Root for the Previous Round ID
  const date = new Date();
  const unixTimeStamp = Math.floor(date.getTime() / 1000) - 90000;
  const roundId = await relay.getVotingRoundId(unixTimeStamp);
  const relayMerkleRoot = await relay.getConfirmedMerkleRoot(
    FTSO_PROTOCOL_ID,
    roundId
  );

  // 5. Fetch Feed Data from Data Provider
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
    console.log("There was an error", error);
  }
  const data = await rawData.json();
  const body = data.feedWithProof.body;
  const proof = data.feedWithProof.proof;

  // 6. Calculate Data Hash and Merkle Root
  let dataHash = ethers.keccak256(
    abiEncoder.encode(
      ["uint32", "bytes21", "int32", "uint16", "int8"],
      [body.votingRoundId, body.id, body.value, body.turnoutBIPS, body.decimals]
    )
  );

  for (const p of proof) {
    if (dataHash <= p) {
      dataHash = ethers.solidityPackedKeccak256(
        ["bytes32", "bytes32"],
        [dataHash, p]
      );
    } else {
      dataHash = ethers.solidityPackedKeccak256(
        ["bytes32", "bytes32"],
        [p, dataHash]
      );
    }
  }

  // 7. Check Calculated Root Against On-chain Version
  if (dataHash === relayMerkleRoot) {
    const price = body.value / 10 ** body.decimals;
    console.log(`Verified price for ${feed_name}: ${price}`);
  } else {
    console.log(
      `Feed data obtained from ${DATA_PROVIDER_URL}` +
      ` does not match on-chain hash!`
    );
  }
}

runGettingDataFeeds_JS("1", "BTC/USD");
