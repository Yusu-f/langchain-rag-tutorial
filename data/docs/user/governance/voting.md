# Voting

An integral part of the [governance process](../../tech/governance.md), voting is the way you influence decisions about how Flare and Songbird operate.

This process can be performed directly through Flare's smart contracts, but the Flare Foundation has developed the [Flare Portal](https://portal.flare.network) to enable you to conveniently cast your vote.

The following information is about voting on the Flare and Songbird networks.
Ensure you have selected one of these networks in your wallet.

## Governance Process Summary

This section summarizes the voting process, which is explained in more detail in the [Governance page](../../tech/governance.md).

All changes to the Flare and Songbird networks are determined by the outcomes of votes on [Flare Improvement Proposals and Songbird Testing Proposals](../../tech/governance.md#flare-improvement-proposals-and-songbird-test-proposals).

For now, all proposals are published by the Flare Foundation.

On each network, each account can cast a number of votes equal to the amount of wrapped tokens it holds.
Since this amount varies over time, a snapshot of all accounts is taken at a block randomly chosen before voting starts.
This block is called the [vote count block](../../tech/governance.md#the-vote-count-block).

Before snapshots are taken, a **notice period** occurs.
If you need to wrap tokens before a voting, **wrap them during this notice period so that they are always included in the snapshot**.

!!! tip
    It is worth noting that you can use the same wrapped tokens to simultaneously vote on proposals and delegate to [FTSO data providers](glossary.md#data_provider).

## Requirements

To vote on any proposal, you need an account that contains wrapped tokens.
You can wrap your tokens by using the [Flare Portal](https://portal.flare.network), as shown in the [Getting Wrapped Tokens](#2-getting-wrapped-tokens) section below.

!!! warning
    Only wrapped tokens held at the vote count block are considered towards your vote count.
    Tokens wrapped or received afterwards will **not** result in additional votes.

    If you need to wrap tokens, always do so during the **notice period**.

## Guide

### 1. Connecting to the Portal

Copy the Flare Portal URL, since you will need it later:

```text
https://portal.flare.network
```

The first step to use the portal is to connect your wallet to it, and the procedure is different for each wallet:

#### Bifrost Wallet

1. Open Bifrost Wallet, log in, and click the web browser tab indicated by the four gray squares at the bottom of the screen.
2. Paste the Flare Portal URL in the search field at the top of the window, and click **Search**.
3. Click **Connect to Wallet**.
4. Select **Bifrost Wallet**.
5. Ensure either the Flare or Songbird network is selected in the pop-up window, and click **Connect**.

Your wallet is now connected to the portal.

#### MetaMask Mobile

1. Open MetaMask, and log in.
2. Click the **three-lines menu**, and click **Browser**.
3. Paste the Flare Portal URL in the search field at the top of the window, and click **Go**.
4. Click **Connect to Wallet**, and click **MetaMask**.

Your wallet is now connected to the portal.

#### Ledger Nano S/X and Chrome

1. Connect to your Ledger device, and unlock it.
2. Log into the MetaMask Chrome extension, and sync your Ledger device.
3. Paste the Flare Portal URL in the search field at the top of the Chrome window, and click **Enter**.
4. Click **Connect to Wallet**.
5. Click **MetaMask**.

Your wallet is now connected to the portal.

#### MetaMask or Brave Wallet

1. Copy and paste the Flare Portal URL in the search bar at the top of your browser and press **Enter**.
2. Click **Connect to Wallet**.
3. Select **MetaMask**.
4. Ensure the correct account address is selected and press **Confirm**.

Your wallet is now connected to the portal.

### 2. Getting Wrapped Tokens

Wrapped tokens are required to vote.

To wrap your tokens:

1. On the **Account** tab in the Flare Portal, ensure you are connected to the network on which the proposal will be voted.
2. Locate your token balance, and click **Wrap**.
3. Specify the amount you want to wrap, and click **Wrap**.

    !!! warning "Never wrap all your tokens"
        Always leave some unwrapped tokens to pay for transaction fees.

4. Confirm the transaction in your wallet.

Remember to wrap your tokens before voting starts, as explained in the [Governance Process Summary](#governance-process-summary) section above.

### 3. Casting Your Vote

!!! tip

    Wrapped tokens are required to vote.
    Depending on the network, ensure you have either `$FLR` or `$SGB` in the wallet you will use to vote.
    For more information, see [Getting Wrapped Tokens](#2-getting-wrapped-tokens).

1. In the Flare Portal, select the **Voting** tab.
   The **Governance Proposals** page is displayed.
2. Locate your current number of votes in the black box.
   If you have fewer votes than you expected, consider the warning in the [Requirements](#requirements) section above.
3. In the **List of proposals**, locate the proposal you want to vote on, and **click on it**.
   The selected proposal is displayed.
4. Review the information in the **Proposal info** and **Voting details** sections.
5. Cast your vote.
   All your available votes will be assigned to the option you specify:

      * To vote in favor of the proposal, click **Vote For**.
      * To vote for the proposal to be rejected, click **Vote Against**.

6. After you sign the transaction, your vote is final and cannot be changed.
   To sign the transaction and lock your vote, click **Confirm**.

Your contribution to this proposal is now complete.

## Transferring Votes

Votes can be transferred to another account while the wrapped tokens remain in your possession.
This is useful, for example, if you have wrapped tokens in multiple self-custody wallets, since you can simplify your voting process by transferring all the votes to a single wallet.

You can read all the details about transferring votes in the [Governance page](../../tech/governance.md#vote-transfer).

By completing the following process, you are crediting another account with votes only;
the tokens themselves stay in the original wallet.

1. Copy the Flare or Songbird address you want to transfer votes to.
2. On the **Voting** tab in the Flare Portal, locate your amount of current votes in the black box, and click **Transfer votes**.
   The **Information about transferred votes** window is displayed.
3. Read the disclaimer, and click **Transfer votes**.
   The **Transfer votes** window is displayed.
4. In the **Transfer all my votes to** field, paste the address from Step 1, and click **Confirm**.
5. Click **Confirm** on your wallet to sign the transaction.
   Your votes are credited to the address you specified.
   The tokens themselves stay in the original address.

!!! info "Canceling vote transfers"
    You can stop transferring your votes to another address, if you do so before the snapshot is taken.

    You can do so from the **Transfer votes** window using the **Remove delegation** button.
    This button is only available when you have previously transferred votes.
