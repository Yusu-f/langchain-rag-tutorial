---
og_image: assets/thumbnails/tutorial-ftso-1.png
og_description: This tutorial shows the simplest way to use the FTSO Scaling system to retrieve a specific data feed, such as the price of Bitcoin.
search:
  boost: 2
---

# Getting FTSO Scaling Data Feeds Off-Chain

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

{{ runner.js("ftso-v2/", "GettingDataFeeds_offchain", runFromBrowser='true', params=[{"name":"Symbol", "value":"BTC"}]) }}

<script>
--8<-- "./docs/samples/ftso-v2/GettingDataFeeds_offchain.js::83"
</script>

<div class="tutorial" markdown>

## Tutorial

### 1. Import Dependencies

The tutorial uses the following dependencies:

* The [Flare Periphery Package](https://www.npmjs.com/package/@flarenetwork/flare-periphery-contracts) for Solidity and the [Flare Periphery Artifacts Package](https://www.npmjs.com/package/@flarenetwork/flare-periphery-contract-artifacts) for JavaScript, which provide the API for all Flare smart contracts.

* If you use JavaScript, the [ethers](https://www.npmjs.com/package/ethers) package is also needed to work with smart contracts.

```javascript title="GettingDataFeeds_offchain.js" linenums="12"
--8<-- "./docs/samples/ftso-v2/GettingDataFeeds_offchain.js:12:16"
```

The Periphery Packages simplify working with the Flare smart contracts significantly.

!!! warning
    If you remove this dependency, you must manually provide the signatures for all the methods you want to use.

### 2. Access Contract Registry

The [`FlareContractRegistry`](FlareContractRegistry.md) contains the current addresses for all Flare smart contracts, and it is [the only recommended way](../../getting-started/contract-addresses.md) to retrieve them.

Its address is the same on all of [Flare's networks](../../../tech/flare.md#flare-networks), and it is the only Flare address that needs to be hard-coded into any program.

```javascript title="GettingDataFeeds_offchain.js" linenums="5"
--8<-- "./docs/samples/ftso-v2/GettingDataFeeds_offchain.js:5:6"
```

```javascript linenums="21"
--8<-- "./docs/samples/ftso-v2/GettingDataFeeds_offchain.js:21:25"
```

### 3. Retrieve the Relay Contract

Fetch the address of the Relay contract (`relayAddress`) and create a contract object (`relay`) for the Relay contract to interact with its methods.

The [`Relay`](#) contract is required because, as explained in the [FTSO Scaling concept page](#), it collects and stores the checksums (Merkle roots) for all data feeds, so you will use it later to verify the information you get from a data provider.

```javascript title="GettingDataFeeds_offchain.js" linenums="28"
--8<-- "./docs/samples/ftso-v2/GettingDataFeeds_offchain.js:28:34"
```

Use the [`getContractAddressByName()`](FlareContractRegistry.md#fn_getcontractaddressbyname_82760fca) method from the [`FlareContractRegistry`](FlareContractRegistry.md) smart contract to retrieve the address of the [`Relay`](#) smart contract.

### 4. Retrieve Merkle Root for the Previous Round ID

Calculate the previous `roundId` based on the current timestamp minus 90 seconds, since a full round takes 90s.
Targeting the current voting round requires finding out first if it has finished, which is beyond the scope of this tutorial.

Next, retrieve the confirmed Merkle root for this `roundId` from the Relay contract.

```javascript title="GettingDataFeeds_offchain.js" linenums="37"
--8<-- "./docs/samples/ftso-v2/GettingDataFeeds_offchain.js:37:41"
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

```javascript title="GettingDataFeeds_offchain.js" linenums="44"
--8<-- "./docs/samples/ftso-v2/GettingDataFeeds_offchain.js:44:56"
```

### 6. Calculate Data Hash and Merkle Root

Hash the body of the feed data using the [`keccak256`](https://docs.ethers.org/v5/api/utils/hashing/#utils-keccak256) hashing function.
The resulting hash, stored in `dataHash`, uniquely represents the feed data.

```javascript title="GettingDataFeeds_offchain.js" linenums="59"
--8<-- "./docs/samples/ftso-v2/GettingDataFeeds_offchain.js:59:62"
```

Now, the Merkle proof (`proof`) retrieved earlier contains hashes that can be used to reconstruct the path from `dataHash` up to the Merkle root.

So, iteratively combine `dataHash` with each hash in the Merkle proof using the [`solidityPackedKeccak256`](https://docs.ethers.org/v6/api/hashing/#solidityPackedKeccak256) function to rebuild the path up the tree.

```javascript title="GettingDataFeeds_offchain.js" linenums="64"
--8<-- "./docs/samples/ftso-v2/GettingDataFeeds_offchain.js:64:72"
```

The resulting `dataHash` from the actions of the `for` loop should match the Merkle root if the data is valid.

### 7. Check Calculated Root Against On-chain Version

Finally, compare the `dataHash` calculated from the received data with the `relayMerkleRoot` obtained from the relay contract in [step 4](#4-retrieve-merkle-root-for-the-previous-round-id).

If there is a match, then the data is valid.

```javascript title="GettingDataFeeds_offchain.js" linenums="75"
--8<-- "./docs/samples/ftso-v2/GettingDataFeeds_offchain.js:75:81"
```

## Conclusion

This tutorial has served as the "Hello World" introduction to the [FTSO Scaling system](#) and has shown:

* How to use the Flare Periphery Package, both from [Solidity](https://www.npmjs.com/package/@flarenetwork/flare-periphery-contracts) and from [JavaScript](https://www.npmjs.com/package/@flarenetwork/flare-periphery-contract-artifacts), to work with the Flare API.
* How to retrieve the latest price for a given asset from the [FTSO Scaling system](#) using Solidity and JavaScript or just JavaScript from a data provider of choice.
* How to verify the accuracy of the price retrieved by comparing it to the on-chain checksum.
