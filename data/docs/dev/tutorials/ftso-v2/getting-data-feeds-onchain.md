---
og_image: assets/thumbnails/tutorial-ftso-1.png
og_description: This tutorial shows the simplest way to use the FTSO Scaling system to retrieve a specific data feed, such as the price of Bitcoin.
search:
  boost: 2
---

# Getting FTSO Scaling Data Feeds On-Chain

This tutorial shows how to use the [FTSO Scaling system](#) to retrieve a specific [data feed](glossary.md#data_feed), such as the price of Bitcoin.

FTSO Scaling can support up to 1000 feeds from 100 data providers, which are published every 90 seconds.
Notably, this only takes up 4.5% of the sustainable network gas throughput, with an additional 4.1% required for the [Flare Systems Protocol](../../../tech/flare-systems-protocol.md) which is shared by all its sub-protocols.

The heart of this enhanced scalability is that only a checksum of the value of all feeds is stored on-chain.
This means that the actual values need to be retrieved from off-chain and then verified against the on-chain checksum, as shown in this tutorial.

The image below depicts the two steps mentioned above. The numbers in the picture match the tutorial steps.

<figure markdown>
  ![FTSO Scaling usage process](FTSO-scaling-basic-tutorial.png){ loading=lazy .allow-zoom width=600px }
  <figcaption>FTSO Scaling schematic diagram</figcaption>
</figure>

The tutorial shows:

* How to use the Flare periphery packages to simplify working with the Flare API.
* How to retrieve the price of a given asset from a data provider.
* How to verify the price against the on-chain checksum.

## Code

Choose your preferred programming language and ensure you have a working [development environment](../../getting-started/setup/index.md).

Verification of the obtained data can be done on- or off-chain, but retrieving the data must be done off-chain.
Therefore, this tutorial has two options: a JavaScript-only version, and a mixed (JavaScript + Solidity) one.

!!! note
    The mixed version cannot be run directly from the browser, as it requires deploying a smart contract.

For easy navigation, numbered comments in the source code (e.g. `// 1.`) link to the tutorial sections below.

{% import "runner.md" as runner with context %}

This tutorial contains a smart contract and a JavaScript program.
To test it, you need to build and deploy the contract first, take note of the deployment address, and use it in the `CONTRACT_ADDR` variable in the JS code.

{{ runner.sol("ftso-v2/", "GettingDataFeeds_onchain") | indent(4) }}

{{ runner.js("ftso-v2/", "GettingDataFeeds_onchain", runFromBrowser='false', params=[{"name":"Symbol", "value":"BTC"}]) | indent(4) }}

<div class="tutorial" markdown>

## Tutorial

### 1. Import Dependencies

The tutorial uses the following dependencies:

* The [Flare Periphery Package](https://www.npmjs.com/package/@flarenetwork/flare-periphery-contracts) for Solidity and the [Flare Periphery Artifacts Package](https://www.npmjs.com/package/@flarenetwork/flare-periphery-contract-artifacts) for JavaScript, which provide the API for all Flare smart contracts.

* If you use JavaScript, the [ethers](https://www.npmjs.com/package/ethers) package is also needed to work with smart contracts.

```solidity title="GettingDataFeeds_onchain.sol" linenums="3"
--8<-- "./docs/samples/ftso-v2/GettingDataFeeds_onchain.sol:3:6"
```

```javascript title="GettingDataFeeds_onchain.js" linenums="12"
--8<-- "./docs/samples/ftso-v2/GettingDataFeeds_onchain.js:12:16"
```

The Periphery Packages simplify working with the Flare smart contracts significantly.

!!! warning
    If you remove this dependency, you must manually provide the signatures for all the methods you want to use.

### 2. Access Contract Registry

The [`FlareContractRegistry`](FlareContractRegistry.md) contains the current addresses for all Flare smart contracts, and it is [the only recommended way](../../getting-started/contract-addresses.md) to retrieve them.

Its address is the same on all of [Flare's networks](../../../tech/flare.md#flare-networks), and it is the only Flare address that needs to be hard-coded into any program.

```javascript title="GettingDataFeeds_onchain.js" linenums="5"
--8<-- "./docs/samples/ftso-v2/GettingDataFeeds_onchain.js:5:6"
```

```javascript title="GettingDataFeeds_onchain.js" linenums="21"
--8<-- "./docs/samples/ftso-v2/GettingDataFeeds_onchain.js:21:25"
```

### 3. Retrieve the Relay Contract

Fetch the address of the Relay contract (`relayAddress`) and create a contract object (`relay`) for the Relay contract to interact with its methods.

The [`Relay`](#) contract is required because, as explained in the [FTSO Scaling concept page](#), it collects and stores the checksums (Merkle roots) for all data feeds, so you will use it later to verify the information you get from a data provider.

```javascript title="GettingDataFeeds_onchain.js" linenums="28"
--8<-- "./docs/samples/ftso-v2/GettingDataFeeds_onchain.js:28:34"
```

Use the [`getContractAddressByName()`](FlareContractRegistry.md#fn_getcontractaddressbyname_82760fca) method from the [`FlareContractRegistry`](FlareContractRegistry.md) smart contract to retrieve the address of the [`Relay`](#) smart contract.

### 4. Retrieve Merkle Root for the Previous Round ID

Calculate the previous `roundId` based on the current timestamp minus 90 seconds, since a full round takes 90s.
Targeting the current voting round requires finding out first if it has finished, which is beyond the scope of this tutorial.

Next, retrieve the confirmed Merkle root for this `roundId` from the Relay contract.

```javascript title="GettingDataFeeds_onchain.js" linenums="37"
--8<-- "./docs/samples/ftso-v2/GettingDataFeeds_onchain.js:37:41"
```

Use the [`getVotingRoundId`](#) method to get the `roundId` and the [`getConfirmedMerkleRoot`](#) to get the on-chain Merkle root (`relayMerkleRoot`).

### 5. Fetch Feed Data from Data Provider

Construct the feed ID using the `feed_category` and `feed_name` as parameters to the [`getFeedID`](#) method.

* `feed_category` represents one of the [four feed categories](#) (category 1 being the price of crypto assets, as used in this tutorial).

    !!! note
         To find the `feed_name` values currently supported by a data provider, you can use the `/data/` endpoint of its REST API.
         This endpoint returns the list of all data feeds supported by the provider for a given `roundId`.

* `feed_name` represents the name of the feed and is usually a pair, such as `BTC/USD`, but can be anything.

Then fetch the body of the feed data (`body`) and Merkle proof (`proof`) by making a `GET` request to the [`specific-feed`](#) endpoint of the data provider that you selected.

To find valid `feed_name` values, you can use the data endpoint of the Data Provider's REST API.
This endpoint returns a list of all assets supported by the provider.
The provider endpoint `/data/{roundId}` returns all feeds for a given `roundId`.

!!!note
    This tutorial uses a test data provider maintained by the Flare Foundation which is heavily rate-limited.
    In a production environment, you should deploy your own provider or select one of the existing ones (from [flaremetrics.io](https://flaremetrics.io/), for example) for which you might need to pay a fee.

```javascript title="GettingDataFeeds_onchain.js" linenums="44"
--8<-- "./docs/samples/ftso-v2/GettingDataFeeds_onchain.js:44:54"
```

### 6. Calculate Data Hash and Merkle Root

The hashing and verification of the feed data is handled by the Solidity smart contract.
However, the contract ([`FeedProofVerifier`](#)), is retrieved via Javascript using Ethers' [ethers.Contract](https://docs.ethers.org/v5/api/contract/contract/#Contract--creating) function and stored in an object (`verifyContract` in this case).

```javascript title="GettingDataFeeds_onchain.js" linenums="57"
--8<-- "./docs/samples/ftso-v2/GettingDataFeeds_onchain.js:57:58"
```

The contract's address and ABI are passed in as the `GETTING_DATA_FEEDS_CONTRACT_ADDR` and `GettingDataFeedAbi` function parameters respectively.

### 7. Check Calculated Root Against On-chain Version

Now, call the contract's [`verifyFeed`](#) method to verify whether or not the data retrieved from the feed is valid.

```javascript title="GettingDataFeeds_onchain.js" linenums="61"
--8<-- "./docs/samples/ftso-v2/GettingDataFeeds_onchain.js:61:61"
```

The Solidity contract handles this verification by comparing `feedHash` from [step 6](#6-calculate-data-hash-and-merkle-root) to the Merkle root, as shown below:

```solidity title="GettingDataFeeds_onchain.sol" linenums="9"
--8<-- "./docs/samples/ftso-v2/GettingDataFeeds_onchain.sol:9:18"
```

The result of hashing the feed data's body with the [`keccak256`](https://docs.ethers.org/v5/api/utils/hashing/#utils-keccak256) hashing function is stored in `feedHash`.

```javascript title="GettingDataFeeds_onchain.js" linenums="62"
--8<-- "./docs/samples/ftso-v2/GettingDataFeeds_onchain.js:62:68"
```

The [`verifyFeed`](#) function takes the feed data (`_feed_data`) and Merkle root (`merkleRoot`) as parameters and returns a boolean indicating whether or not the feed data matches on-chain value.
Finally, check if the data obtained from the feed is valid by checking the return value of [`verifyFeed`](#), which is `true` if the data is valid and `false` if otherwise.

## Conclusion

This tutorial has served as the "Hello World" introduction to the [FTSO Scaling system](#) and has shown:

* How to use the Flare Periphery Package, both from [Solidity](https://www.npmjs.com/package/@flarenetwork/flare-periphery-contracts) and from [JavaScript](https://www.npmjs.com/package/@flarenetwork/flare-periphery-contract-artifacts), to work with the Flare API.
* How to retrieve the latest price for a given asset from the [FTSO Scaling system](#) using Solidity and JavaScript or just JavaScript from a data provider of choice.
* How to verify the accuracy of the price retrieved by comparing it to the on-chain checksum.
