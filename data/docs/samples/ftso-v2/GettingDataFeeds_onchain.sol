// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6 <0.9;
import "@flarenetwork/flare-periphery-contracts/flare/util-contracts/userInterfaces/IRelay.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {IFTSOFeedVerifier} from "@flarenetwork/flare-periphery-contracts/coston/util-contracts/userInterfaces/IFTSOFeedVerifier.sol";
import {FlareContractsRegistryLibrary} from "@flarenetwork/flare-periphery-contracts/coston/util-contracts/ContractRegistryLibrary.sol";

contract GettingDataFeeds_onchain {
    using MerkleProof for bytes32[];

    function getPreviousRoundId() public view returns (uint256) {
        // 3. Retrieve the Previous Round ID
        address relayAddress = FlareContractsRegistryLibrary
            .getContractAddressByName("Relay");
        IRelay relay = IRelay(relayAddress);
        return relay.getVotingRoundId(block.timestamp - 90000);
    }

    function verifyFeed(
        uint256 _protocolId,
        uint256 _roundId,
        IFTSOFeedVerifier.FeedWithProof calldata _feed_data
    ) public view returns (bool) {
        address relayAddress = FlareContractsRegistryLibrary
            .getContractAddressByName("Relay");
        IRelay relay = IRelay(relayAddress);

        // 6. Retrieve Merkle Root for the Previous Round ID
        bytes32 merkleRoot = relay.getConfirmedMerkleRoot(
            _protocolId,
            _roundId
        );

        // 7. Calculate Hash of the Feed Data
        bytes32 feedHash = keccak256(abi.encode(_feed_data.body));

        // 8. Check if Proof is valid
        require(
            _feed_data.proof.verifyCalldata(merkleRoot, feedHash),
            "invalid proof"
        );
        return true;
    }
}