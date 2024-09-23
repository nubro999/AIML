# [Ludium] Silent Auction

# Overview

Silent auction is a private auction platform where auction participant and amount is concealed until the round results is published. Anyone can put up their digital item on the auction and the settlement happens for every round of the auction

# Problem

Auction is a commonly used feature in buying digital items including NFT. However, all auctions are publicly disclosed which makes it

1. Vulnerable to Collusion: Bidders can see the price in place. Collude with one another and limit the price action
2. Limit Price Action Mechanism: Currently, the two prominent forms of auction, English and Dutch auction, is limited on strategic planning for the auction providers. A new sets of options can stir up a new type of price actions

# Solution

Silent auction is a common practice in the convention world for real estate, government work bidding, and charity. It offers

1. Private bidding: Any one can open and participate in the auction where bidding can happen privately
2. Resolution by Provider: Private bids can have its own rule of resolution. For instance, bidder with the first price can win. But [Vickery](https://en.wikipedia.org/wiki/Vickrey_auction) or many other auctions can be implemented
3. Public Settlement: Auction result data are proved, verified and public transaction is sent for sending the item to the winner

# System Architecture

![system-architecture](https://github.com/Ludium-Official/silent-auction/blob/main/images/system-architecture.png?raw=true)

### 1. An Auction Item is Created and sent to Backend

- Mina Contract is created for that Item  at Backend. MerkleMap is also created for that Item and stored in Contract state
- MerkleMap for that contract is stored in Backend

### 2. Private Bidding + Change the MerkleMap root  (See Appendix)

- Bidder access the merkleMap Root in Contract, and the MerkleMap itself in Backend
- Bidders price changes the MerkleMap and the  MerkleMap root is updated on Mina’s Contract

### 3. Amount of Bid is locked on Contract

- For the bid to be finalized the amount of money that is bid is required to be locked up in Mina Contract for the duration of the auction
- Bidders can retrieve the locked balance when the auction is done

### 4. Private Bidding via Private Backend

- Bidders also send the price to Private Backend Server
- Bid amount is encrypted and stored. Data is used to also compute the Merkle Map on the Backend Server

### 5. Resolution by Backend

- Highest Bidder is computed on Backend and the results are sent to the Participants
- MerkleMap Path of the winner is also sent to all Participants to verify that the Bidding is Authentic
- Challenge Period is given for users who do not agree with the results. (Optional)

### 6. Verified on Mina

- MerkleMap Path of the winner is also sent to all Participants which then can be used to verify that the Bidding is Authentic
- Mina Contract is closed and cannot be changed after the Auction is done

# Roadmap

### Scope

- Phase 1 - Quick Start
    - Objective: Build a testable App with Frontend connected to Testnet
    - Static experience with minimal UX just to showcase the POC
    - Round is limited to short period time for the sake of the brevity
- Phase 2 - Turn Silent Auction into a service
    - Objective: More dataset / product level UI to start the service adoption
    - Build an application with options for auction time, rules and other necessary features for the full service
- Phase 3 - Auction collaboration
    - Objective: Collaborate with the different auction platforms
    - Renowned platforms, ex. Christie, can implement the Web3 auction feature

### Budget and Milestones - Quick Start

| **Category** | **Justification** | **Time** |
| --- | --- | --- |
| Planning | Writing down the full feature to initiate the development | 1 Week |
| Backend Deployment | Backend/01js verficiation contract deployed for the | 3 Weeks |
| Application Deployment | Full application with minimal UX for the user testing purposes | 1 Week |
| **Total** |  | 5 Weeks |

# Team

- [mmingyeomm](https://github.com/mmingyeomm/ZKPacket-Tracer): BAY club member. Contributing to Mina Protocol through ZK Packet Tracer and Pump.Z fun
- [Ludium](https://docs.google.com/presentation/d/15mmCJ2OYudZY1ncR8kX_eJsq8x8QaTjuOs80ep_TmwE/edit?usp=sharing): Ludium is Web3 builder community with 1,800 + active contributors. It provides opportunities for builders ranging from education, hackathon, to open source contribution based works.

# Appendix 1 - Private Bidding Process

**1. Auction Item Created**

- User creates an auction item and sends it to the Backend
- Backend creates a Mina Contract for the item
- A MerkleMap is created for the item and stored in the Contract state
- The MerkleMap is also stored in the Backend database

**2. Bid Preparation before Bid is finalized**

- Backend calculates the current Merkle Root of the MerkleMap
- MerkleWitness is calculated for the soon-to-exist Key (future bid Key)

**3. Verification with ZKProgram**

- New bid is added to the MerkleMap in the Backend
- New Merkle Root is calculated for the updated MerkleMap with ZKProgram
- New MerkleWitness is calculated for the now-existing Key with ZKProgram
- Pre-Calculated MerkleWitness is compared with now-calculated MerkleWitness to Verify Bidding

**5. Mina Contract Update**

- If verification is successful, the MerkleMap Root in the Mina Contract is updated